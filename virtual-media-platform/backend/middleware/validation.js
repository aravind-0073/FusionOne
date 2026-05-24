const { validationResult, body, param, query } = require('express-validator');

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
        field: err.path || err.param,
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
