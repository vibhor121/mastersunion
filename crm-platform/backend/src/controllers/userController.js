import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get all users (Admin/Manager only)
 * @route GET /api/v1/users
 * @access Private (Admin/Manager)
 */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leads: true,
              activities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
};

/**
 * Get single user by ID
 * @route GET /api/v1/users/:id
 * @access Private (Admin/Manager or self)
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this profile
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'MANAGER' &&
      req.user.id !== id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            leads: true,
            activities: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message,
    });
  }
};

/**
 * Create new user (Admin only)
 * @route POST /api/v1/users
 * @access Private (Admin)
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    logger.info(`User created: ${user.email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

/**
 * Update user (Admin/Manager or self with limited fields)
 * @route PUT /api/v1/users/:id
 * @access Private
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Permission check
    const isSelf = req.user.id === id;
    const isAdminOrManager =
      req.user.role === 'ADMIN' || req.user.role === 'MANAGER';

    if (!isSelf && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this user',
      });
    }

    // Build update data based on permissions
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Only admin can update role and isActive
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    logger.info(`User updated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

/**
 * Delete user (Admin only)
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Instead of hard delete, we can deactivate the user
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`User deactivated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

/**
 * Get sales executives list (for lead assignment)
 * @route GET /api/v1/users/sales-executives
 * @access Private (Admin/Manager)
 */
export const getSalesExecutives = async (req, res) => {
  try {
    const salesExecutives = await prisma.user.findMany({
      where: {
        role: { in: ['SALES_EXECUTIVE', 'MANAGER'] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: salesExecutives,
    });
  } catch (error) {
    logger.error('Get sales executives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales executives',
      error: error.message,
    });
  }
};

