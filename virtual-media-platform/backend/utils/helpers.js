const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'jwtsecret_change_me',
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
  const publishDate = new Date(media.publishedAt || media.createdAt);
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
