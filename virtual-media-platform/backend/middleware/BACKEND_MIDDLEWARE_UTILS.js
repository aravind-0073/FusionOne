// backend/middleware/auth.js
// JWT Authentication Middleware

const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

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

/**
 * Rate limiting middleware
 */
const rateLimit = require('express-rate-limit');

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

// ============================================
// backend/middleware/validation.js
// Request Validation Middleware
// ============================================

const { validationResult } = require('express-validator');
const { body, param, query } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Media upload validation
 */
const validateMediaUpload = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['video', 'music', 'podcast', 'course']).withMessage('Invalid media type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description too long'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be positive'),
  
  handleValidationErrors
];

/**
 * Comment validation
 */
const validateComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content required')
    .isLength({ min: 1, max: 5000 }).withMessage('Comment must be 1-5000 characters'),
  
  param('mediaId')
    .isMongoId().withMessage('Invalid media ID'),
  
  handleValidationErrors
];

/**
 * Room creation validation
 */
const validateRoomCreation = [
  body('roomName')
    .trim()
    .notEmpty().withMessage('Room name required')
    .isLength({ min: 3, max: 100 }).withMessage('Room name must be 3-100 characters'),
  
  body('isPrivate')
    .optional()
    .isBoolean().withMessage('isPrivate must be boolean'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description too long'),
  
  handleValidationErrors
];

/**
 * Quiz submission validation
 */
const validateQuizSubmission = [
  body('courseId')
    .isMongoId().withMessage('Invalid course ID'),
  
  body('questionId')
    .isMongoId().withMessage('Invalid question ID'),
  
  body('selectedOption')
    .optional()
    .isMongoId().withMessage('Invalid option ID'),
  
  body('responseText')
    .optional()
    .trim(),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateMediaUpload,
  validateComment,
  validateRoomCreation,
  validateQuizSubmission
};

// ============================================
// backend/utils/errorMessages.js
// Centralized Error Messages
// ============================================

const ErrorMessages = {
  // Auth errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    PASSWORD_WEAK: 'Password must be at least 8 characters',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_REQUIRED: 'Authentication token required',
    UNAUTHORIZED: 'Unauthorized access'
  },

  // Media errors
  MEDIA: {
    NOT_FOUND: 'Media not found',
    INVALID_TYPE: 'Invalid media type',
    UPLOAD_FAILED: 'Media upload failed',
    FILE_TOO_LARGE: 'File size exceeds limit',
    INVALID_FORMAT: 'Invalid file format'
  },

  // Room errors
  ROOM: {
    NOT_FOUND: 'Room not found',
    INVALID_CODE: 'Invalid room code',
    ROOM_FULL: 'Room is full',
    ALREADY_JOINED: 'Already joined this room',
    NOT_PARTICIPANT: 'Not a participant of this room'
  },

  // Course errors
  COURSE: {
    NOT_FOUND: 'Course not found',
    NOT_ENROLLED: 'Not enrolled in this course',
    ALREADY_ENROLLED: 'Already enrolled in this course',
    INSUFFICIENT_SCORE: 'Insufficient score to pass'
  },

  // Server errors
  SERVER: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    SOCKET_ERROR: 'WebSocket connection failed'
  },

  // Validation errors
  VALIDATION: {
    INVALID_INPUT: 'Invalid input provided',
    REQUIRED_FIELD: 'Required field missing',
    INVALID_FORMAT: 'Invalid format'
  }
};

module.exports = ErrorMessages;

// ============================================
// backend/utils/helpers.js
// Utility Helper Functions
// ============================================

/**
 * Generate JWT token
 */
const generateToken = (userId, expiresIn = '7d') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Calculate engagement score
 */
const calculateEngagementScore = (media) => {
  const weights = {
    views: 0.4,
    likes: 0.3,
    comments: 0.2,
    shares: 0.1
  };

  const totalViews = Math.max(media.views, 1);
  const engagementRatio = (media.likes + media.commentCount + media.shareCount) / totalViews;

  return (
    (Math.log(media.views + 1) / Math.log(10)) * weights.views +
    (Math.log(media.likes + 1) / Math.log(10)) * weights.likes +
    (Math.log(media.commentCount + 1) / Math.log(10)) * weights.comments +
    (Math.log(media.shareCount + 1) / Math.log(10)) * weights.shares +
    engagementRatio * 10
  );
};

/**
 * Calculate trending score
 */
const calculateTrendingScore = (media, timePeriodDays = 7) => {
  const now = new Date();
  const publishDate = new Date(media.publishedAt);
  const daysSincePublish = (now - publishDate) / (1000 * 60 * 60 * 24);

  // Recency factor (newer is better)
  const recencyFactor = Math.max(0, 1 - (daysSincePublish / timePeriodDays));

  // Engagement factor
  const engagementScore = calculateEngagementScore(media);

  // Velocity factor (growth rate)
  const velocityFactor = media.commentCount > 0 ? 
    (media.likes + media.commentCount) / Math.max(1, daysSincePublish) : 0;

  return (
    recencyFactor * 0.4 +
    (Math.min(engagementScore, 100) / 100) * 0.35 +
    (Math.min(velocityFactor, 10) / 10) * 0.25
  );
};

/**
 * Format response
 */
const formatResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) response.data = data;
  if (errors) response.errors = errors;

  return response;
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Generate room code
 */
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Generate certificate number
 */
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}-${random}`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string (basic XSS prevention)
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Convert duration to readable format
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);
  
  return `${size.toFixed(2)} ${units[index]}`;
};

/**
 * Get date range
 */
const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
};

/**
 * Sleep utility (for testing)
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateToken,
  calculateEngagementScore,
  calculateTrendingScore,
  formatResponse,
  paginate,
  generateRoomCode,
  generateCertificateNumber,
  isValidEmail,
  sanitizeString,
  formatDuration,
  formatFileSize,
  getDateRange,
  sleep
};

// ============================================
// backend/services/socketService.js
// Socket.IO Event Management
// ============================================

const { Room, LiveQueue } = require('../models');

class SocketService {
  /**
   * Handle user joining a room
   */
  static async handleRoomJoin(io, socket, { roomId, userId, username }) {
    try {
      socket.join(roomId);
      
      // Update room participants
      await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            currentParticipants: {
              userId,
              username,
              joinedAt: new Date(),
              role: 'viewer'
            }
          },
          $inc: { participantCount: 1 },
          lastActivityAt: new Date()
        }
      );

      // Notify others
      io.to(roomId).emit('userJoined', {
        userId,
        username,
        timestamp: new Date()
      });

      // Send current queue to new user
      const queue = await LiveQueue.findOne({ roomId });
      socket.emit('queueSync', queue);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle queue update
   */
  static async handleQueueUpdate(io, socket, { roomId, items }) {
    try {
      await LiveQueue.findOneAndUpdate(
        { roomId },
        {
          items,
          totalItems: items.length,
          updatedAt: new Date()
        }
      );

      io.to(roomId).emit('queueUpdated', { items });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update queue' });
    }
  }

  /**
   * Handle vote on queue item
   */
  static async handleVote(io, socket, { roomId, queueItemId, userId, voteType }) {
    try {
      const queue = await LiveQueue.findOne({ roomId });
      
      const item = queue.items.find(i => i.queueItemId.toString() === queueItemId);
      if (item) {
        if (voteType === 'upvote') {
          item.votes += 1;
        } else {
          item.votes = Math.max(0, item.votes - 1);
        }
      }

      await queue.save();
      
      // Re-sort and emit
      queue.items.sort((a, b) => b.votes - a.votes);
      io.to(roomId).emit('voteUpdated', { items: queue.items });
    } catch (error) {
      socket.emit('error', { message: 'Failed to vote' });
    }
  }

  /**
   * Handle message in room
   */
  static async handleMessage(io, socket, { roomId, userId, username, message }) {
    try {
      const cleanMessage = message.substring(0, 500); // Limit message length
      
      await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            chatHistory: {
              userId,
              username,
              message: cleanMessage,
              timestamp: new Date()
            }
          }
        }
      );

      io.to(roomId).emit('newMessage', {
        userId,
        username,
        message: cleanMessage,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle user leaving room
   */
  static async handleRoomLeave(io, socket, { roomId, userId }) {
    try {
      socket.leave(roomId);
      
      await Room.findByIdAndUpdate(
        roomId,
        {
          $pull: { currentParticipants: { userId } },
          $inc: { participantCount: -1 },
          lastActivityAt: new Date()
        }
      );

      io.to(roomId).emit('userLeft', {
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }
}

module.exports = SocketService;
