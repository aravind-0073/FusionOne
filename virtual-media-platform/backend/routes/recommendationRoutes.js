const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const RecommendationEngine = require('../aggregations');
const { Media, MediaMood } = require('../models');

class RecommendationController {
  // Get personalized recommendations
  static async getRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      const pipeline = await RecommendationEngine.generatePersonalizedRecommendations(
        userId,
        parseInt(limit)
      );

      let recommendations = await Media.aggregate(pipeline);

      // Fallback: if personalized recommendations are empty (e.g., user watched all videos), return published media
      if (!recommendations || recommendations.length < 3) {
        recommendations = await Media.find({ status: 'published', isPublic: true })
          .sort({ views: -1 })
          .limit(parseInt(limit));
      }

      res.json({
        success: true,
        recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching recommendations',
        error: error.message
      });
    }
  }

  // Get trending by mood
  static async getTrendingByMood(req, res) {
    try {
      const moodId = req.params.moodId || req.query.moodId;
      const limit = req.query.limit || 15;

      if (!moodId) {
        return res.status(400).json({
          success: false,
          message: 'Mood ID is required'
        });
      }

      let targetMoodId = moodId;
      const mongoose = require('mongoose');
      const { MoodTag } = require('../models');

      if (!mongoose.Types.ObjectId.isValid(moodId)) {
        const moodDoc = await MoodTag.findOne({ name: new RegExp('^' + moodId + '$', 'i') });
        if (moodDoc) {
          targetMoodId = moodDoc._id.toString();
        } else {
          return res.json({
            success: true,
            trending: []
          });
        }
      }

      const pipeline = await RecommendationEngine.getTrendingByMood(
        targetMoodId,
        parseInt(limit)
      );

      const trending = await MediaMood.aggregate(pipeline);

      res.json({
        success: true,
        trending
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending content',
        error: error.message
      });
    }
  }

  // Advanced search
  static async advancedSearch(req, res) {
    try {
      const { query, moods, category, type, limit = 20 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const moodArray = moods ? moods.split(',') : [];
      const pipeline = await RecommendationEngine.advancedSearch(
        query,
        moodArray,
        category,
        type,
        parseInt(limit)
      );

      const results = await Media.aggregate(pipeline);

      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching content',
        error: error.message
      });
    }
  }
}

router.get('/personalized', authenticate, RecommendationController.getRecommendations);
router.get('/trending-mood/:moodId', RecommendationController.getTrendingByMood);
router.get('/search', RecommendationController.advancedSearch);

module.exports = router;
