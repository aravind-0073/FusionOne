const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const multer = require('../middleware/multer');
const { 
  Media, Video, Music, Creator, MediaMood, WatchHistory, Comment, Like 
} = require('../models');

// ============================================
// CONTROLLERS
// ============================================

class MediaController {
  // Upload new media
  static async uploadMedia(req, res) {
    try {
      const { title, description, type, category, moodTags, duration } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!title || !type) {
        return res.status(400).json({
          success: false,
          message: 'Title and type are required'
        });
      }

      // Create media document
      const media = await Media.create({
        title,
        description,
        type,
        creatorId: userId,
        creatorName: req.user.username,
        category: category ? new mongoose.Types.ObjectId(category) : undefined,
        moodTags: moodTags ? JSON.parse(moodTags) : [],
        duration: duration ? parseInt(duration) : undefined,
        thumbnailUrl: req.files?.thumbnail?.[0]?.path,
        status: 'processing',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Store file paths based on type
      if (type === 'video' && req.files?.video) {
        await Video.create({
          mediaId: media._id,
          videoUrl: req.files.video[0].path,
          fileSize: req.files.video[0].size,
          qualityOptions: [
            { quality: '1080p', url: req.files.video[0].path }
          ]
        });
      } else if (type === 'music' && req.files?.music) {
        await Music.create({
          mediaId: media._id,
          musicUrl: req.files.music[0].path,
          fileSize: req.files.music[0].size
        });
      }

      // Update creator's media count
      await Creator.updateOne(
        { userId },
        {
          $push: { uploadedMedia: media._id },
          $inc: { mediaCount: 1 }
        }
      );

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        media: media
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading media',
        error: error.message
      });
    }
  }

  // Get all media with filters
  static async getMedia(req, res) {
    try {
      const { type, category, moodId, search, skip = 0, limit = 20 } = req.query;
      
      const filter = {
        status: 'published',
        isPublic: true
      };

      if (type) filter.type = type;
      if (category) filter.category = category;

      let query = Media.find(filter)
        .sort({ views: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      // Search by mood
      if (moodId) {
        let targetMoodId = moodId;
        const { MoodTag } = require('../models');
        if (!mongoose.Types.ObjectId.isValid(moodId)) {
          const moodDoc = await MoodTag.findOne({ name: new RegExp('^' + moodId + '$', 'i') });
          if (moodDoc) {
            targetMoodId = moodDoc._id;
          } else {
            targetMoodId = new mongoose.Types.ObjectId();
          }
        } else {
          targetMoodId = new mongoose.Types.ObjectId(moodId);
        }

        const mediaWithMood = await MediaMood.find({
          moodId: targetMoodId
        }).distinct('mediaId');
        
        filter._id = { $in: mediaWithMood };
        query = Media.find(filter)
          .sort({ views: -1 })
          .skip(parseInt(skip))
          .limit(parseInt(limit));
      }

      // Text search
      if (search) {
        query = Media.find(
          { $text: { $search: search }, ...filter },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' }, views: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
      }

      const media = await query;
      const total = await Media.countDocuments(filter);

      res.json({
        success: true,
        total,
        count: media.length,
        media
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching media',
        error: error.message
      });
    }
  }

  // Get trending media
  static async getTrendingMedia(req, res) {
    try {
      const { moodId, limit = 20 } = req.query;

      let pipeline = [
        {
          $match: {
            status: 'published',
            isPublic: true
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: [{ $log: [{ $max: ['$views', 1] }, 10] }, 0.4] },
                { $multiply: [{ $log: [{ $add: ['$likes', 1] }, 10] }, 0.3] },
                { $multiply: [{ $log: [{ $add: ['$commentCount', 1] }, 10] }, 0.2] },
                { $multiply: [{ $log: [{ $add: ['$shareCount', 1] }, 10] }, 0.1] }
              ]
            }
          }
        }
      ];

      // Add mood filter if provided
      if (moodId) {
        let targetMoodId = moodId;
        const { MoodTag } = require('../models');
        if (!mongoose.Types.ObjectId.isValid(moodId)) {
          const moodDoc = await MoodTag.findOne({ name: new RegExp('^' + moodId + '$', 'i') });
          if (moodDoc) {
            targetMoodId = moodDoc._id;
          } else {
            return res.json({ success: true, trending: [] });
          }
        } else {
          targetMoodId = new mongoose.Types.ObjectId(moodId);
        }

        pipeline.push({
          $lookup: {
            from: 'mediamoods',
            let: { mediaId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$mediaId', '$$mediaId'] },
                  moodId: targetMoodId
                }
              }
            ],
            as: 'moodMatch'
          }
        });

        pipeline.push({
          $match: {
            moodMatch: { $not: { $size: 0 } }
          }
        });
      }

      pipeline.push(
        { $sort: { trendingScore: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            creatorName: 1,
            thumbnailUrl: 1,
            views: 1,
            likes: 1,
            moodTags: 1,
            trendingScore: 1,
            type: 1
          }
        }
      );

      const trending = await Media.aggregate(pipeline);

      res.json({
        success: true,
        trending
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending media',
        error: error.message
      });
    }
  }

  // Get media by ID
  static async getMediaById(req, res) {
    try {
      const { mediaId } = req.params;
      
      // Try to optionally extract userId from authorization header
      let userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1];
      if (!userId && token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (e) {
          // Ignore invalid/expired tokens for public media routes
        }
      }

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      // Convert Mongoose document to plain object to attach custom properties
      const mediaObj = media.toObject();

      // Fetch dynamic streaming URL from corresponding type collection
      if (media.type === 'video') {
        const videoData = await Video.findOne({ mediaId });
        if (videoData) {
          mediaObj.videoUrl = videoData.videoUrl;
          mediaObj.qualityOptions = videoData.qualityOptions;
        }
      } else if (media.type === 'music') {
        const musicData = await Music.findOne({ mediaId });
        if (musicData) {
          mediaObj.musicUrl = musicData.musicUrl;
        }
      }

      // Increment views
      await Media.updateOne(
        { _id: mediaId },
        { $inc: { views: 1 } }
      );

      // Log watch history
      if (userId) {
        await WatchHistory.updateOne(
          { userId: new mongoose.Types.ObjectId(userId), mediaId: new mongoose.Types.ObjectId(mediaId) },
          {
            $set: {
              watchedAt: new Date(),
              userId: new mongoose.Types.ObjectId(userId),
              mediaId: new mongoose.Types.ObjectId(mediaId)
            }
          },
          { upsert: true }
        );
      }

      // Get comments
      const comments = await Comment.find({ mediaId })
        .sort({ createdAt: -1 })
        .limit(20);

      // Get user's like status
      let userLikeStatus = null;
      if (userId) {
        userLikeStatus = await Like.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          mediaId: new mongoose.Types.ObjectId(mediaId)
        });
      }

      res.json({
        success: true,
        media: mediaObj,
        comments,
        userLikeStatus: userLikeStatus?.type || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching media',
        error: error.message
      });
    }
  }

  // Like/Dislike media
  static async toggleLike(req, res) {
    try {
      const { mediaId } = req.params;
      const { type } = req.body; // 'like' or 'dislike'
      const userId = req.user.id;

      // Check if already liked
      const existingLike = await Like.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        mediaId: new mongoose.Types.ObjectId(mediaId)
      });

      let action = 'added';
      if (existingLike) {
        if (existingLike.type === type) {
          // Remove like
          await Like.deleteOne({ _id: existingLike._id });
          action = 'removed';
          
          // Decrement media stats
          if (type === 'like') {
            await Media.updateOne({ _id: mediaId }, { $inc: { likes: -1 } });
          } else {
            await Media.updateOne({ _id: mediaId }, { $inc: { dislikes: -1 } });
          }
        } else {
          // Change like type
          await Like.updateOne(
            { _id: existingLike._id },
            { type }
          );
          action = type === 'like' ? 'added' : 'disliked';

          // Update media stats
          if (type === 'like') {
            await Media.updateOne(
              { _id: mediaId },
              { $inc: { likes: 1, dislikes: -1 } }
            );
          } else {
            await Media.updateOne(
              { _id: mediaId },
              { $inc: { likes: -1, dislikes: 1 } }
            );
          }
        }
      } else {
        // Create new like
        await Like.create({
          userId: new mongoose.Types.ObjectId(userId),
          mediaId: new mongoose.Types.ObjectId(mediaId),
          type,
          createdAt: new Date()
        });
        action = type === 'like' ? 'added' : 'disliked';

        // Increment media stats
        if (type === 'like') {
          await Media.updateOne({ _id: mediaId }, { $inc: { likes: 1 } });
        } else {
          await Media.updateOne({ _id: mediaId }, { $inc: { dislikes: 1 } });
        }
      }

      res.json({
        success: true,
        action,
        message: action === 'removed' ? 'Removed like' : 'Liked video!'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error toggling like',
        error: error.message
      });
    }
  }

  // Add mood tag to media
  static async addMoodTag(req, res) {
    try {
      const { mediaId } = req.params;
      const { moodId, moodName, confidenceScore } = req.body;

      await MediaMood.findOneAndUpdate(
        { mediaId: new mongoose.Types.ObjectId(mediaId), moodId: new mongoose.Types.ObjectId(moodId) },
        {
          mediaId: new mongoose.Types.ObjectId(mediaId),
          moodId: new mongoose.Types.ObjectId(moodId),
          moodName,
          confidenceScore: parseFloat(confidenceScore) || 0.8
        },
        { upsert: true, new: true }
      );

      // Update media with mood tags
      const moods = await MediaMood.find({ mediaId: new mongoose.Types.ObjectId(mediaId) });
      await Media.updateOne(
        { _id: mediaId },
        {
          moodTags: moods.map(m => ({
            moodId: m.moodId,
            moodName: m.moodName,
            score: m.confidenceScore
          }))
        }
      );

      res.json({
        success: true,
        message: 'Mood tag added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding mood tag',
        error: error.message
      });
    }
  }

  // Update media metadata
  static async updateMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const { title, description, category, tags } = req.body;
      const userId = req.user.id;

      // Verify ownership
      const media = await Media.findById(mediaId);
      if (media.creatorId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (tags) updateData.tags = tags;
      updateData.updatedAt = new Date();

      await Media.updateOne({ _id: mediaId }, updateData);

      res.json({
        success: true,
        message: 'Media updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating media',
        error: error.message
      });
    }
  }

  // Publish media
  static async publishMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const userId = req.user.id;

      const media = await Media.findById(mediaId);
      if (media.creatorId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      await Media.updateOne(
        { _id: mediaId },
        {
          status: 'published',
          isPublic: true,
          publishedAt: new Date(),
          updatedAt: new Date()
        }
      );

      res.json({
        success: true,
        message: 'Media published successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error publishing media',
        error: error.message
      });
    }
  }

  // Delete media
  static async deleteMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const userId = req.user.id;

      const media = await Media.findById(mediaId);
      if (media.creatorId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Mark as deleted
      await Media.updateOne(
        { _id: mediaId },
        { status: 'deleted', updatedAt: new Date() }
      );

      // Remove from creator's uploads
      await Creator.updateOne(
        { userId },
        { $pull: { uploadedMedia: mediaId }, $inc: { mediaCount: -1 } }
      );

      res.json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting media',
        error: error.message
      });
    }
  }
}

// ============================================
// ROUTES
// ============================================

// Public routes
router.get('/trending', MediaController.getTrendingMedia);
router.get('/:mediaId', MediaController.getMediaById);
router.get('/', MediaController.getMedia);

// Protected routes
router.post('/upload', authenticate, multer.fields([
  { name: 'video', maxCount: 1 },
  { name: 'music', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), MediaController.uploadMedia);

router.post('/:mediaId/mood-tag', authenticate, MediaController.addMoodTag);
router.post('/:mediaId/like', authenticate, MediaController.toggleLike);
router.put('/:mediaId', authenticate, MediaController.updateMedia);
router.post('/:mediaId/publish', authenticate, MediaController.publishMedia);
router.delete('/:mediaId', authenticate, MediaController.deleteMedia);

module.exports = router;
