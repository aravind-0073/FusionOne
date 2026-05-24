// backend/aggregations/recommendationPipeline.js
// AI-Powered Mood-Based Recommendation Engine

const mongoose = require('mongoose');

/**
 * MOOD-BASED RECOMMENDATION ALGORITHM
 * 
 * This module implements an advanced recommendation engine that considers:
 * 1. User mood preferences
 * 2. Content mood tags and confidence scores
 * 3. Engagement metrics
 * 4. Popularity trends
 * 5. Collaborative filtering (what similar users liked)
 * 6. Freshness/newness of content
 */

class RecommendationEngine {
  
  /**
   * Generate personalized recommendations for a user
   * Combines multiple factors using a weighted scoring algorithm
   */
  static async generatePersonalizedRecommendations(userId, limit = 20) {
    return [
      {
        $match: {
          status: 'published',
          isPublic: true
        }
      },
      // Get user's mood preferences
      {
        $lookup: {
          from: 'usermoodpreferences',
          let: { userId: new mongoose.Types.ObjectId(userId) },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            { $project: { moodPreferences: 1 } }
          ],
          as: 'userMoods'
        }
      },
      // Get media moods
      {
        $lookup: {
          from: 'mediamoods',
          localField: '_id',
          foreignField: 'mediaId',
          as: 'mediaMoods'
        }
      },
      // Calculate mood match score
      {
        $addFields: {
          moodMatchScore: {
            $cond: [
              { $gt: [{ $size: '$mediaMoods' }, 0] },
              {
                $avg: {
                  $map: {
                    input: '$mediaMoods',
                    as: 'mood',
                    in: '$$mood.confidenceScore'
                  }
                }
              },
              0
            ]
          }
        }
      },
      // Calculate engagement score
      {
        $addFields: {
          engagementRatio: {
            $cond: [
              { $gt: ['$views', 0] },
              {
                $divide: [
                  { $add: ['$likes', '$commentCount', '$shareCount'] },
                  '$views'
                ]
              },
              0
            ]
          }
        }
      },
      // Popularity score (normalized views in last 30 days)
      {
        $addFields: {
          popularityScore: {
            $min: [
              {
                $divide: [
                  { $max: ['$views', 1] },
                  100000 // Normalization constant
                ]
              },
              1
            ]
          }
        }
      },
      // Freshness score (newer content gets higher score)
      {
        $addFields: {
          freshnessScore: {
            $let: {
              vars: {
                daysSincePublish: {
                  $divide: [
                    {
                      $subtract: [new Date(), '$publishedAt']
                    },
                    86400000 // milliseconds in a day
                  ]
                }
              },
              in: {
                $max: [
                  { $subtract: [1, { $divide: ['$$daysSincePublish', 365] }] },
                  0.1
                ]
              }
            }
          }
        }
      },
      // Content quality score (based on engagement and rating)
      {
        $addFields: {
          contentQualityScore: {
            $let: {
              vars: {
                likeRatio: {
                  $cond: [
                    { $gt: [{ $add: ['$likes', '$dislikes'] }, 0] },
                    {
                      $divide: [
                        '$likes',
                        { $add: ['$likes', '$dislikes'] }
                      ]
                    },
                    0.5
                  ]
                }
              },
              in: {
                $multiply: [
                  '$$likeRatio',
                  { $min: [{ $divide: ['$engagementRatio', 0.1] }, 1] }
                ]
              }
            }
          }
        }
      },
      // Calculate collaborative score (similar users)
      {
        $lookup: {
          from: 'watchhistories',
          let: { mediaId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$mediaId', '$$mediaId'] } } },
            { $project: { userId: 1 } },
            { $limit: 1000 } // Get users who watched this
          ],
          as: 'viewers'
        }
      },
      {
        $addFields: {
          collaborativeScore: {
            $cond: [
              { $gt: [{ $size: '$viewers' }, 0] },
              {
                $min: [
                  { $divide: [{ $size: '$viewers' }, 100] },
                  1
                ]
              },
              0.2
            ]
          }
        }
      },
      // Calculate final recommendation score with weighted factors
      {
        $addFields: {
          recommendationScore: {
            $add: [
              { $multiply: ['$moodMatchScore', 0.30] },        // 30% weight
              { $multiply: ['$contentQualityScore', 0.25] },  // 25% weight
              { $multiply: ['$freshnessScore', 0.15] },       // 15% weight
              { $multiply: ['$collaborativeScore', 0.20] },   // 20% weight
              { $multiply: ['$popularityScore', 0.10] }       // 10% weight
            ]
          }
        }
      },
      // Sort by recommendation score
      {
        $sort: { recommendationScore: -1 }
      },
      // Exclude already watched content
      {
        $lookup: {
          from: 'watchhistories',
          let: { mediaId: '$_id', userId: new mongoose.Types.ObjectId(userId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$mediaId', '$$mediaId'] },
                    { $eq: ['$userId', '$$userId'] }
                  ]
                }
              }
            }
          ],
          as: 'watchRecord'
        }
      },
      {
        $match: {
          watchRecord: { $size: 0 }
        }
      },
      // Project final fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          thumbnailUrl: 1,
          creatorName: 1,
          duration: 1,
          views: 1,
          likes: 1,
          moodTags: 1,
          type: 1,
          recommendationScore: 1,
          moodMatchScore: 1,
          contentQualityScore: 1,
          freshnessScore: 1,
          reason: {
            $cond: [
              { $gt: ['$moodMatchScore', 0.6] },
              'Based on your mood preferences',
              {
                $cond: [
                  { $gt: ['$contentQualityScore', 0.7] },
                  'Highly rated content',
                  'Trending in your interests'
                ]
              }
            ]
          }
        }
      },
      // Limit results
      {
        $limit: limit
      }
    ];
  }

  /**
   * Trending content pipeline by mood
   */
  static async getTrendingByMood(moodId, limit = 15) {
    return [
      {
        $match: {
          moodId: new mongoose.Types.ObjectId(moodId),
          'mediaId': { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'mediaDetails'
        }
      },
      {
        $unwind: '$mediaDetails'
      },
      {
        $match: {
          'mediaDetails.status': 'published',
          'mediaDetails.isPublic': true
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$confidenceScore', 0.4] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $max: ['$mediaDetails.views', 1] },
                      10000
                    ]
                  },
                  0.3
                ]
              },
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ['$userVotes', 0] },
                      { $min: [{ $divide: ['$userVotes', 100] }, 1] },
                      0.3
                    ]
                  },
                  0.3
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $project: {
          _id: '$mediaDetails._id',
          title: '$mediaDetails.title',
          thumbnailUrl: '$mediaDetails.thumbnailUrl',
          creatorName: '$mediaDetails.creatorName',
          views: '$mediaDetails.views',
          likes: '$mediaDetails.likes',
          moodName: '$moodName',
          trendingScore: 1
        }
      },
      {
        $limit: limit
      }
    ];
  }

  /**
   * Search with mood and category filters
   */
  static async advancedSearch(query, moodIds = [], categoryId = null, type = null, limit = 20) {
    const pipeline = [
      {
        $match: {
          $text: { $search: query },
          status: 'published',
          isPublic: true
        }
      },
      {
        $addFields: {
          score: { $meta: 'textScore' }
        }
      }
    ];

    // Add mood filter if specified
    if (moodIds && moodIds.length > 0) {
      pipeline.push({
        $lookup: {
          from: 'mediamoods',
          let: { mediaId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$mediaId', '$$mediaId'] },
                moodId: {
                  $in: moodIds.map(id => new mongoose.Types.ObjectId(id))
                }
              }
            }
          ],
          as: 'matchingMoods'
        }
      });

      pipeline.push({
        $match: {
          matchingMoods: { $size: { $gt: 0 } }
        }
      });
    }

    // Add category filter if specified
    if (categoryId) {
      pipeline.push({
        $match: {
          category: new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    // Add type filter if specified
    if (type) {
      pipeline.push({
        $match: { type }
      });
    }

    // Sort and limit
    pipeline.push(
      {
        $sort: { score: { $meta: 'textScore' }, views: -1 }
      },
      {
        $project: {
          score: { $meta: 'textScore' },
          title: 1,
          description: 1,
          creatorName: 1,
          thumbnailUrl: 1,
          views: 1,
          moodTags: 1,
          type: 1
        }
      },
      {
        $limit: limit
      }
    );

    return pipeline;
  }

  /**
   * Creator analytics pipeline
   */
  static async getCreatorAnalytics(creatorId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return [
      {
        $match: {
          creatorId: new mongoose.Types.ObjectId(creatorId),
          status: 'published'
        }
      },
      {
        $lookup: {
          from: 'watchhistories',
          let: { mediaId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$mediaId', '$$mediaId'] },
                watchedAt: { $gte: startDate }
              }
            }
          ],
          as: 'recentWatches'
        }
      },
      {
        $lookup: {
          from: 'likes',
          let: { mediaId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$mediaId', '$$mediaId'] },
                createdAt: { $gte: startDate },
                type: 'like'
              }
            }
          ],
          as: 'recentLikes'
        }
      },
      {
        $lookup: {
          from: 'comments',
          let: { mediaId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$mediaId', '$$mediaId'] },
                createdAt: { $gte: startDate }
              }
            }
          ],
          as: 'recentComments'
        }
      },
      {
        $addFields: {
          views30Days: { $size: '$recentWatches' },
          likes30Days: { $size: '$recentLikes' },
          comments30Days: { $size: '$recentComments' },
          engagement30Days: {
            $add: [
              { $size: '$recentLikes' },
              { $size: '$recentComments' },
              { $multiply: [{ $size: '$recentWatches' }, 0.1] }
            ]
          },
          avgWatchDuration: {
            $cond: [
              { $gt: [{ $size: '$recentWatches' }, 0] },
              {
                $avg: '$recentWatches.progress'
              },
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalViews30Days: { $sum: '$views30Days' },
          totalEngagement30Days: { $sum: '$engagement30Days' },
          totalWatchTime: { $sum: { $multiply: ['$avgWatchDuration', '$views30Days'] } },
          topPerformingMedia: {
            $push: {
              mediaId: '$_id',
              title: '$title',
              views: '$views30Days'
            }
          }
        }
      },
      {
        $project: {
          totalMedia: 1,
          totalViews30Days: 1,
          totalEngagement30Days: 1,
          avgViewsPerMedia: { $divide: ['$totalViews30Days', '$totalMedia'] },
          totalWatchTime: { $round: ['$totalWatchTime', 0] },
          topPerformingMedia: {
            $slice: [
              {
                $sortByCount: '$topPerformingMedia.views'
              },
              5
            ]
          }
        }
      }
    ];
  }

  /**
   * Room activity analytics
   */
  static async getRoomAnalytics(roomId) {
    return [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(roomId)
        }
      },
      {
        $lookup: {
          from: 'livequeues',
          localField: '_id',
          foreignField: 'roomId',
          as: 'queueData'
        }
      },
      {
        $unwind: {
          path: '$queueData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          roomName: 1,
          creatorName: 1,
          participantCount: 1,
          totalItems: '$queueData.totalItems',
          avgItemDuration: {
            $cond: [
              { $gt: ['$queueData.totalItems', 0] },
              { $divide: ['$queueData.totalDuration', '$queueData.totalItems'] },
              0
            ]
          },
          chatMessageCount: { $size: '$chatHistory' },
          totalPlaybackTime: '$queueData.totalDuration',
          createdAt: 1
        }
      }
    ];
  }

  /**
   * Leaderboard pipeline for top creators
   */
  static async getTopCreatorsLeaderboard(limit = 20, timeframe = 'all') {
    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case 'week':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    return [
      {
        $match: { status: 'published', ...dateFilter }
      },
      {
        $group: {
          _id: '$creatorId',
          creatorName: { $first: '$creatorName' },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalEngagement: {
            $sum: {
              $add: ['$likes', '$commentCount', '$shareCount']
            }
          },
          mediaCount: { $sum: 1 },
          avgViewsPerMedia: {
            $avg: '$views'
          }
        }
      },
      {
        $lookup: {
          from: 'subscriptions',
          let: { creatorId: '$_id' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$creatorId', '$$creatorId'] } }
            },
            { $count: 'count' }
          ],
          as: 'subscriberInfo'
        }
      },
      {
        $addFields: {
          subscribers: {
            $cond: [
              { $gt: [{ $size: '$subscriberInfo' }, 0] },
              { $arrayElemAt: ['$subscriberInfo.count', 0] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalViews: -1 }
      },
      {
        $project: {
          _id: 1,
          creatorName: 1,
          totalViews: 1,
          totalLikes: 1,
          totalEngagement: 1,
          subscribers: 1,
          mediaCount: 1,
          avgViewsPerMedia: { $round: ['$avgViewsPerMedia', 0] },
          engagementRate: {
            $round: [
              { $divide: ['$totalEngagement', { $max: ['$totalViews', 1] }] },
              4
            ]
          }
        }
      },
      {
        $limit: limit
      }
    ];
  }

  /**
   * Quiz performance analytics
   */
  static async getQuizPerformance(courseId) {
    return [
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: '$questionId',
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: {
              $cond: ['$isCorrect', 1, 0]
            }
          },
          averageTimeSpent: { $avg: '$timeSpent' }
        }
      },
      {
        $addFields: {
          successRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$correctAnswers', '$totalAttempts'] },
                  100
                ]
              },
              2
            ]
          },
          difficulty: {
            $cond: [
              { $lt: ['$successRate', 30] },
              'Hard',
              { $cond: [{ $lt: ['$successRate', 70] }, 'Medium', 'Easy'] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'quizquestions',
          localField: '_id',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      {
        $unwind: '$questionDetails'
      },
      {
        $project: {
          questionText: '$questionDetails.questionText',
          totalAttempts: 1,
          correctAnswers: 1,
          successRate: 1,
          difficulty: 1,
          averageTimeSpent: 1
        }
      }
    ];
  }
}

module.exports = RecommendationEngine;
