import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authentication required.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Invalid token.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is lead owner or has admin/manager role
 */
export const authorizeLeadAccess = async (req, res, next) => {
  try {
    const { id: leadId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admins and Managers can access all leads
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      return next();
    }

    // Check if user is the lead owner
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    if (lead.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this lead.',
      });
    }

    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.',
    });
  }
};

