import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import { emitNotification } from '../utils/socketManager.js';

/**
 * Get all leads with filtering, sorting, and pagination
 * @route GET /api/v1/leads
 * @access Private
 */
export const getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      ownerId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};

    // Role-based filtering
    if (req.user.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    } else if (ownerId) {
      where.ownerId = ownerId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              activities: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leads',
      error: error.message,
    });
  }
};

/**
 * Get single lead by ID
 * @route GET /api/v1/leads/:id
 * @access Private
 */
export const getLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check access permissions
    if (
      req.user.role === 'SALES_EXECUTIVE' &&
      lead.ownerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this lead',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    logger.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lead',
      error: error.message,
    });
  }
};

/**
 * Create new lead
 * @route POST /api/v1/leads
 * @access Private
 */
export const createLead = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      source,
      value,
      priority,
      notes,
      ownerId,
    } = req.body;

    // Determine owner: if ownerId provided and user is admin/manager, use it; otherwise assign to current user
    let finalOwnerId = req.user.id;
    if (ownerId && (req.user.role === 'ADMIN' || req.user.role === 'MANAGER')) {
      finalOwnerId = ownerId;
    }

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        source,
        value: value ? parseFloat(value) : 0,
        priority: priority || 'MEDIUM',
        notes,
        ownerId: finalOwnerId,
        createdById: req.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'NOTE',
        title: 'Lead created',
        description: `Lead created by ${req.user.firstName} ${req.user.lastName}`,
        leadId: lead.id,
        userId: req.user.id,
      },
    });

    // Send notification if lead is assigned to someone else
    if (finalOwnerId !== req.user.id) {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          userId: finalOwnerId,
          title: 'New Lead Assigned',
          message: `A new lead "${firstName} ${lastName}" has been assigned to you`,
          type: 'LEAD_ASSIGNED',
          metadata: { leadId: lead.id },
        },
      });

      // Emit socket notification
      emitNotification(finalOwnerId, notification);

      // Send email
      const emailTemplate = emailTemplates.leadAssigned(
        `${firstName} ${lastName}`,
        `${lead.owner.firstName} ${lead.owner.lastName}`
      );
      sendEmail({
        to: lead.owner.email,
        ...emailTemplate,
      });
    }

    logger.info(`Lead created: ${lead.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message,
    });
  }
};

/**
 * Update lead
 * @route PUT /api/v1/leads/:id
 * @access Private
 */
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      status,
      source,
      value,
      priority,
      notes,
      ownerId,
    } = req.body;

    // Get existing lead
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check permissions
    if (
      req.user.role === 'SALES_EXECUTIVE' &&
      existingLead.ownerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this lead',
      });
    }

    // Track changes for history
    const changes = [];
    const fieldsToTrack = {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      status,
      source,
      priority,
      ownerId,
    };

    for (const [field, newValue] of Object.entries(fieldsToTrack)) {
      if (newValue !== undefined && existingLead[field] !== newValue) {
        changes.push({
          leadId: id,
          fieldName: field,
          oldValue: String(existingLead[field] || ''),
          newValue: String(newValue),
          changedBy: `${req.user.firstName} ${req.user.lastName}`,
        });
      }
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(status && { status }),
        ...(source !== undefined && { source }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(priority && { priority }),
        ...(notes !== undefined && { notes }),
        ...(ownerId &&
          (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') && {
            ownerId,
          }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create history records
    if (changes.length > 0) {
      await prisma.leadHistory.createMany({
        data: changes,
      });
    }

    // Log status change activity
    if (status && status !== existingLead.status) {
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          title: 'Status changed',
          description: `Status changed from ${existingLead.status} to ${status}`,
          leadId: id,
          userId: req.user.id,
        },
      });

      // Send notification to owner
      const notification = await prisma.notification.create({
        data: {
          userId: updatedLead.ownerId,
          title: 'Lead Status Changed',
          message: `Lead status changed from ${existingLead.status} to ${status}`,
          type: 'LEAD_STATUS_CHANGED',
          metadata: { leadId: id },
        },
      });

      emitNotification(updatedLead.ownerId, notification);

      // Send email
      const emailTemplate = emailTemplates.leadStatusChanged(
        `${updatedLead.firstName} ${updatedLead.lastName}`,
        existingLead.status,
        status
      );
      sendEmail({
        to: updatedLead.owner.email,
        ...emailTemplate,
      });
    }

    // If owner changed
    if (ownerId && ownerId !== existingLead.ownerId) {
      const notification = await prisma.notification.create({
        data: {
          userId: ownerId,
          title: 'Lead Assigned',
          message: `Lead "${updatedLead.firstName} ${updatedLead.lastName}" has been assigned to you`,
          type: 'LEAD_ASSIGNED',
          metadata: { leadId: id },
        },
      });

      emitNotification(ownerId, notification);
    }

    logger.info(`Lead updated: ${id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    logger.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message,
    });
  }
};

/**
 * Delete lead
 * @route DELETE /api/v1/leads/:id
 * @access Private (Admin/Manager only)
 */
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    await prisma.lead.delete({
      where: { id },
    });

    logger.info(`Lead deleted: ${id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    logger.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message,
    });
  }
};

/**
 * Get lead history
 * @route GET /api/v1/leads/:id/history
 * @access Private
 */
export const getLeadHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      prisma.leadHistory.findMany({
        where: { leadId: id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leadHistory.count({ where: { leadId: id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get lead history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lead history',
      error: error.message,
    });
  }
};

