const ErrorMessages = {
  // Auth errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_REFRESH: 'Invalid refresh token',
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
