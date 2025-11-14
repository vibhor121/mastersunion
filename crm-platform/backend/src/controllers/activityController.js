import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { emitNotification } from '../utils/socketManager.js';
import { sendEmail, emailTemplates } from '../config/email.js';

/**
 * Get all activities for a lead
 * @route GET /api/v1/leads/:leadId/activities
 * @access Private
 */
export const getActivities = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { leadId };
    if (type) where.type = type;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activities',
      error: error.message,
    });
  }
};

/**
 * Get single activity
 * @route GET /api/v1/activities/:id
 * @access Private
 */
export const getActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            ownerId: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity',
      error: error.message,
    });
  }
};

/**
 * Create new activity
 * @route POST /api/v1/leads/:leadId/activities
 * @access Private
 */
export const createActivity = async (req, res) => {
  try {
    const { leadId } = req.params;
    const {
      type,
      title,
      description,
      outcome,
      duration,
      scheduledAt,
      completedAt,
    } = req.body;

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
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

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        outcome,
        duration: duration ? parseInt(duration) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        leadId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If activity is scheduled and user is not the lead owner, notify the owner
    if (scheduledAt && lead.ownerId !== req.user.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: lead.ownerId,
          title: 'New Activity Scheduled',
          message: `${req.user.firstName} scheduled a ${type.toLowerCase()}: ${title}`,
          type: 'ACTIVITY_REMINDER',
          metadata: { activityId: activity.id, leadId },
        },
      });

      emitNotification(lead.ownerId, notification);
    }

    logger.info(`Activity created: ${activity.id} for lead ${leadId}`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity,
    });
  } catch (error) {
    logger.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message,
    });
  }
};

/**
 * Update activity
 * @route PUT /api/v1/activities/:id
 * @access Private
 */
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      description,
      outcome,
      duration,
      scheduledAt,
      completedAt,
    } = req.body;

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        lead: {
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
        },
      },
    });

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Check permissions: only creator, lead owner, or admin/manager can update
    if (
      existingActivity.userId !== req.user.id &&
      existingActivity.lead.ownerId !== req.user.id &&
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'MANAGER'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this activity',
      });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(outcome !== undefined && { outcome }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(scheduledAt !== undefined && {
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        }),
        ...(completedAt !== undefined && {
          completedAt: completedAt ? new Date(completedAt) : null,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Activity updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity,
    });
  } catch (error) {
    logger.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message,
    });
  }
};

/**
 * Delete activity
 * @route DELETE /api/v1/activities/:id
 * @access Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        lead: true,
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Check permissions
    if (
      activity.userId !== req.user.id &&
      activity.lead.ownerId !== req.user.id &&
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'MANAGER'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this activity',
      });
    }

    await prisma.activity.delete({
      where: { id },
    });

    logger.info(`Activity deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    logger.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message,
    });
  }
};

/**
 * Get upcoming activities for current user
 * @route GET /api/v1/activities/upcoming
 * @access Private
 */
export const getUpcomingActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get leads owned by user
    const userLeads = await prisma.lead.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });

    const leadIds = userLeads.map((lead) => lead.id);

    const activities = await prisma.activity.findMany({
      where: {
        leadId: { in: leadIds },
        scheduledAt: { gte: new Date() },
        completedAt: null,
      },
      take: parseInt(limit),
      orderBy: { scheduledAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    logger.error('Get upcoming activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming activities',
      error: error.message,
    });
  }
};

