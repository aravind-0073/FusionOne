const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');
const rateLimit = require('express-rate-limit');

/**
 * Verify JWT token and extract user information
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

/**
 * Check user role authorization
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
};

/**
 * Check admin privileges
 */
const checkAdminPrivileges = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }

      const admin = await Admin.findOne({ userId: req.user._id });
      if (!admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin profile not found'
        });
      }

      if (requiredPermission && !admin[requiredPermission]) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${requiredPermission}`
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking admin privileges',
        error: error.message
      });
    }
  };
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests, please try again later'
});

module.exports = {
  authenticate,
  authorize,
  checkAdminPrivileges,
  authLimiter,
  apiLimiter
};
