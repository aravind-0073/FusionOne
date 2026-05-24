// backend/models/index.js
// Complete MongoDB Mongoose Models for Virtual Media Platform

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
// 1. USER MODEL
// ============================================

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  firstName: String,
  lastName: String,
  profilePicture: String,
  bio: String,
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  moodPreferences: {
    preferredMoods: [mongoose.Schema.Types.ObjectId],
    moodWeights: mongoose.Schema.Types.Mixed
  },
  subscriptions: [{
    creatorId: mongoose.Schema.Types.ObjectId,
    subscribedAt: Date,
    notifications: Boolean
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiresAt: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  followCount: {
    type: Number,
    default: 0
  },
  followerCount: {
    type: Number,
    default: 0
  },
  totalWatchTime: {
    type: Number,
    default: 0
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isPremium: 1 });

const User = mongoose.model('User', userSchema);

// ============================================
// 2. CREATOR MODEL
// ============================================

const creatorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  channelName: {
    type: String,
    required: true
  },
  channelDescription: String,
  channelBanner: String,
  channelLogo: String,
  verificationBadge: {
    type: Boolean,
    default: false
  },
  subscribers: [mongoose.Schema.Types.ObjectId],
  subscriberCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  totalEngagement: {
    type: Number,
    default: 0
  },
  contentType: [{
    type: String,
    enum: ['music', 'video', 'educational', 'live', 'podcast']
  }],
  uploadedMedia: [mongoose.Schema.Types.ObjectId],
  mediaCount: {
    type: Number,
    default: 0
  },
  monetizationEnabled: {
    type: Boolean,
    default: false
  },
  analyticsData: {
    views30Days: {
      type: Number,
      default: 0
    },
    engagement30Days: {
      type: Number,
      default: 0
    },
    watchTime30Days: {
      type: Number,
      default: 0
    },
    averageViewDuration: {
      type: Number,
      default: 0
    }
  },
  socialLinks: {
    twitter: String,
    instagram: String,
    website: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

creatorSchema.index({ userId: 1 });
creatorSchema.index({ subscriberCount: -1 });
creatorSchema.index({ totalViews: -1 });

const Creator = mongoose.model('Creator', creatorSchema);

// ============================================
// 3. MEDIA MODEL (Base)
// ============================================

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: 1,
    maxlength: 200
  },
  description: String,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  creatorName: String,
  type: {
    type: String,
    enum: ['video', 'music', 'podcast', 'course'],
    required: true
  },
  thumbnailUrl: String,
  category: mongoose.Schema.Types.ObjectId,
  tags: [mongoose.Schema.Types.ObjectId],
  moodTags: [{
    moodId: mongoose.Schema.Types.ObjectId,
    moodName: String,
    score: Number
  }],
  duration: Number, // in seconds
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isMonetized: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'published', 'deleted'],
    default: 'draft'
  },
  contentRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    default: 'PG'
  },
  language: {
    type: String,
    default: 'en'
  },
  engagementScore: {
    type: Number,
    default: 0
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  statistics: {
    avgWatchDuration: {
      type: Number,
      default: 0
    },
    watchPercentage: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
}, { timestamps: true });

// Text index for search
mediaSchema.index({ title: 'text', description: 'text' });
mediaSchema.index({ creatorId: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ "moodTags.moodId": 1 });
mediaSchema.index({ isPublic: 1, status: 1 });
mediaSchema.index({ views: -1 });
mediaSchema.index({ trendingScore: -1 });

const Media = mongoose.model('Media', mediaSchema);

// ============================================
// 4. VIDEO MODEL
// ============================================

const videoSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    unique: true
  },
  videoUrl: String,
  qualityOptions: [{
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p', '4K']
    },
    bitrate: Number,
    url: String
  }],
  resolution: String,
  fileSize: Number,
  codec: String,
  subtitles: [{
    language: String,
    url: String
  }],
  chapters: [{
    timestamp: Number,
    title: String,
    description: String
  }],
  checkpoints: [{
    checkpointId: mongoose.Schema.Types.ObjectId,
    timestamp: Number,
    type: {
      type: String,
      enum: ['quiz', 'survey', 'milestone']
    },
    isRequired: Boolean
  }],
  transcription: String,
  isLive: {
    type: Boolean,
    default: false
  },
  recordingUrl: String
}, { timestamps: true });

videoSchema.index({ mediaId: 1 });

const Video = mongoose.model('Video', videoSchema);

// ============================================
// 5. MUSIC MODEL
// ============================================

const musicSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    unique: true
  },
  musicUrl: String,
  artist: String,
  album: String,
  genre: String,
  releaseDate: Date,
  isrc: String,
  audioCodec: String,
  bitrate: Number,
  fileSize: Number,
  lyrics: String,
  lyricsUrl: String,
  instrumental: {
    type: Boolean,
    default: false
  },
  explicit: {
    type: Boolean,
    default: false
  },
  features: [String],
  equalizer: {
    bass: Number,
    treble: Number,
    midRange: Number
  }
}, { timestamps: true });

musicSchema.index({ mediaId: 1 });
musicSchema.index({ artist: 1 });
musicSchema.index({ album: 1 });
musicSchema.index({ genre: 1 });

const Music = mongoose.model('Music', musicSchema);

// ============================================
// 6. CATEGORY MODEL
// ============================================

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: String,
  icon: String,
  color: String,
  parentCategory: mongoose.Schema.Types.ObjectId,
  mediaCount: {
    type: Number,
    default: 0
  },
  order: Number
}, { timestamps: true });

categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });

const Category = mongoose.model('Category', categorySchema);

// ============================================
// 7. TAG MODEL
// ============================================

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  mediaCount: {
    type: Number,
    default: 0
  },
  color: String,
  popularity: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

tagSchema.index({ slug: 1 });
tagSchema.index({ popularity: -1 });

const Tag = mongoose.model('Tag', tagSchema);

// ============================================
// 8. COMMENT MODEL
// ============================================

const commentSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  userProfilePic: String,
  content: {
    type: String,
    required: true
  },
  timestamp: Number,
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  replies: [{
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    content: String,
    likes: Number,
    createdAt: Date
  }],
  replyCount: {
    type: Number,
    default: 0
  },
  pinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

commentSchema.index({ mediaId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

// ============================================
// 9. LIKE MODEL
// ============================================

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike', 'neutral'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

likeSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
likeSchema.index({ mediaId: 1 });

const Like = mongoose.model('Like', likeSchema);

// ============================================
// 10. SUBSCRIPTION MODEL
// ============================================

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'vip'],
    default: 'free'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date
});

subscriptionSchema.index({ userId: 1, creatorId: 1 }, { unique: true });
subscriptionSchema.index({ creatorId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ============================================
// 11. WATCH HISTORY MODEL
// ============================================

const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  progress: Number,
  totalDuration: Number,
  watchPercentage: Number,
  watchedAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: String,
  qualityWatched: String
});

watchHistorySchema.index({ userId: 1, watchedAt: -1 });
watchHistorySchema.index({ mediaId: 1 });
watchHistorySchema.index({ userId: 1, mediaId: 1 }, { unique: true });

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

// ============================================
// 12. NOTIFICATION MODEL
// ============================================

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_upload', 'comment_reply', 'like', 'new_subscriber', 
            'room_invite', 'quiz_available', 'message', 'announcement'],
    required: true
  },
  title: String,
  description: String,
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  relatedEntityType: String,
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ============================================
// 13. PLAYLIST MODEL
// ============================================

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  thumbnail: String,
  items: [{
    mediaId: mongoose.Schema.Types.ObjectId,
    position: Number,
    addedAt: Date
  }],
  itemCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isCollaborative: {
    type: Boolean,
    default: false
  },
  collaborators: [mongoose.Schema.Types.ObjectId],
  collaboratorCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  autoGenerated: {
    type: Boolean,
    default: false
  },
  generationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

playlistSchema.index({ userId: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ "items.mediaId": 1 });

const Playlist = mongoose.model('Playlist', playlistSchema);

// ============================================
// 14. ROOM MODEL (Collaborative)
// ============================================

const roomSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: String,
  roomName: {
    type: String,
    required: true
  },
  description: String,
  isPrivate: {
    type: Boolean,
    default: true
  },
  roomCode: String,
  maxParticipants: {
    type: Number,
    default: 50
  },
  currentParticipants: [{
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    joinedAt: Date,
    role: {
      type: String,
      enum: ['host', 'editor', 'viewer'],
      default: 'viewer'
    }
  }],
  participantCount: {
    type: Number,
    default: 0
  },
  currentlyPlayingId: mongoose.Schema.Types.ObjectId,
  currentlyPlayingTitle: String,
  playbackPosition: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  syncedPlayback: {
    type: Boolean,
    default: true
  },
  roomSettings: {
    allowExplicitContent: {
      type: Boolean,
      default: true
    },
    requireApprovalForAdditions: {
      type: Boolean,
      default: false
    },
    allowVoting: {
      type: Boolean,
      default: true
    }
  },
  chatHistory: [{
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    message: String,
    timestamp: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

roomSchema.index({ creatorId: 1 });
roomSchema.index({ isPrivate: 1 });
roomSchema.index({ roomCode: 1 }, { sparse: true });
roomSchema.index({ lastActivityAt: -1 });

const Room = mongoose.model('Room', roomSchema);

// ============================================
// 15. LIVE QUEUE MODEL
// ============================================

const liveQueueSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    unique: true
  },
  items: [{
    queueItemId: mongoose.Schema.Types.ObjectId,
    mediaId: mongoose.Schema.Types.ObjectId,
    mediaTitle: String,
    creatorName: String,
    thumbnail: String,
    duration: Number,
    addedByUserId: mongoose.Schema.Types.ObjectId,
    addedByUsername: String,
    addedAt: Date,
    votes: {
      type: Number,
      default: 0
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    playStartTime: Date,
    position: Number
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

liveQueueSchema.index({ roomId: 1 });

const LiveQueue = mongoose.model('LiveQueue', liveQueueSchema);

// ============================================
// 16. QUEUE VOTE MODEL
// ============================================

const queueVoteSchema = new mongoose.Schema({
  queueItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

queueVoteSchema.index({ queueItemId: 1, userId: 1 }, { unique: true });
queueVoteSchema.index({ roomId: 1 });

const QueueVote = mongoose.model('QueueVote', queueVoteSchema);

// ============================================
// 17. MOOD TAG MODEL
// ============================================

const moodTagSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Relaxing", "Focus", "Workout", "Chill", "Gaming", 
            "Motivational", "Emotional", "Study", "Energetic", 
            "Party", "Sleep", "Nature", "Dark", "Uplifting"],
    required: true,
    unique: true
  },
  description: String,
  color: String,
  icon: String,
  vibeCategory: String,
  associatedGenres: [String],
  relatedMoods: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });

moodTagSchema.index({ name: 1 });

const MoodTag = mongoose.model('MoodTag', moodTagSchema);

// ============================================
// 18. MEDIA MOOD MODEL
// ============================================

const mediaMoodSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  moodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodTag',
    required: true
  },
  moodName: String,
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  userVotes: {
    type: Number,
    default: 0
  },
  aiAssignedAt: Date,
  verifiedByUser: {
    type: Boolean,
    default: false
  }
});

mediaMoodSchema.index({ mediaId: 1 });
mediaMoodSchema.index({ moodId: 1 });
mediaMoodSchema.index({ mediaId: 1, moodId: 1 }, { unique: true });

const MediaMood = mongoose.model('MediaMood', mediaMoodSchema);

// ============================================
// 19. USER MOOD PREFERENCE MODEL
// ============================================

const userMoodPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  moodPreferences: [{
    moodId: mongoose.Schema.Types.ObjectId,
    moodName: String,
    weight: Number,
    interaction: {
      type: Number,
      default: 0
    },
    lastSelectedAt: Date
  }],
  currentMood: mongoose.Schema.Types.ObjectId,
  moodHistory: [{
    moodId: mongoose.Schema.Types.ObjectId,
    selectedAt: Date,
    duration: Number
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userMoodPreferenceSchema.index({ userId: 1 });

const UserMoodPreference = mongoose.model('UserMoodPreference', userMoodPreferenceSchema);

// ============================================
// 20. RECOMMENDATION SCORE MODEL
// ============================================

const recommendationScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  overallScore: Number,
  moodMatchScore: Number,
  personalityMatchScore: Number,
  popularityScore: Number,
  freshhnessScore: Number,
  collaborativeScore: Number,
  contentScore: Number,
  rankPosition: Number,
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

recommendationScoreSchema.index({ userId: 1, overallScore: -1 });
recommendationScoreSchema.index({ mediaId: 1 });
recommendationScoreSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

const RecommendationScore = mongoose.model('RecommendationScore', recommendationScoreSchema);

// ============================================
// 21. COURSE MODEL
// ============================================

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  creatorName: String,
  thumbnail: String,
  category: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  videos: [mongoose.Schema.Types.ObjectId],
  videoCount: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  prerequisites: [mongoose.Schema.Types.ObjectId],
  certificateEligible: {
    type: Boolean,
    default: true
  },
  passingScore: {
    type: Number,
    default: 70
  },
  price: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

courseSchema.index({ creatorId: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ enrollmentCount: -1 });

const Course = mongoose.model('Course', courseSchema);

// ============================================
// 22. VIDEO CHECKPOINT MODEL
// ============================================

const videoCheckpointSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  timestamp: {
    type: Number,
    required: true
  },
  checkpointType: {
    type: String,
    enum: ['quiz', 'survey', 'milestone', 'reading', 'exercise']
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  title: String,
  description: String,
  relatedQuizId: mongoose.Schema.Types.ObjectId,
  instructions: String,
  passingCriteria: Number,
  timeLimit: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

videoCheckpointSchema.index({ videoId: 1, timestamp: 1 });
videoCheckpointSchema.index({ courseId: 1 });

const VideoCheckpoint = mongoose.model('VideoCheckpoint', videoCheckpointSchema);

// ============================================
// 23. QUIZ QUESTION MODEL
// ============================================

const quizQuestionSchema = new mongoose.Schema({
  checkpointId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCheckpoint',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'trueFalse', 'shortAnswer', 'multipleSelection']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  },
  options: [{
    optionId: mongoose.Schema.Types.ObjectId,
    text: String,
    isCorrect: Boolean
  }],
  explanation: String,
  order: Number,
  isRequired: {
    type: Boolean,
    default: true
  }
});

quizQuestionSchema.index({ checkpointId: 1, order: 1 });
quizQuestionSchema.index({ videoId: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

// ============================================
// 24. USER RESPONSE MODEL
// ============================================

const userResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion',
    required: true
  },
  checkpointId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCheckpoint'
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  selectedOptionId: mongoose.Schema.Types.ObjectId,
  selectedOptions: [mongoose.Schema.Types.ObjectId],
  responseText: String,
  isCorrect: Boolean,
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: Number,
  attemptNumber: {
    type: Number,
    default: 1
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

userResponseSchema.index({ userId: 1, courseId: 1 });
userResponseSchema.index({ checkpointId: 1 });

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

// ============================================
// 25. LEARNING PROGRESS MODEL
// ============================================

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completedVideos: [mongoose.Schema.Types.ObjectId],
  completedVideoCount: {
    type: Number,
    default: 0
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  totalQuizScore: {
    type: Number,
    default: 0
  },
  quizzesAttempted: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  certificateId: mongoose.Schema.Types.ObjectId,
  certificateEarnedAt: Date,
  courseCompletedAt: Date,
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  lastActivityAt: Date,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  streakDays: {
    type: Number,
    default: 0
  }
});

learningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
learningProgressSchema.index({ progressPercentage: -1 });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

// ============================================
// 26. CERTIFICATE MODEL
// ============================================

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: String,
  creatorName: String,
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  finalScore: Number,
  certificateUrl: String,
  verificationUrl: String,
  isVerified: {
    type: Boolean,
    default: true
  },
  shareable: {
    type: Boolean,
    default: true
  }
});

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ earnedAt: -1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

// ============================================
// 27. PREMIUM PLAN MODEL
// ============================================

const premiumPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    default: 'monthly'
  },
  features: [String],
  adFree: {
    type: Boolean,
    default: false
  },
  offlineDownloads: {
    type: Boolean,
    default: false
  },
  hd4k: {
    type: Boolean,
    default: false
  },
  unlimitedSkips: {
    type: Boolean,
    default: false
  },
  customizedMixedPlaylist: {
    type: Boolean,
    default: false
  },
  maxSimultaneousStreams: {
    type: Number,
    default: 1
  },
  storageLimit: {
    type: Number,
    default: 0
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

premiumPlanSchema.index({ price: 1 });

const PremiumPlan = mongoose.model('PremiumPlan', premiumPlanSchema);

// ============================================
// 28. PAYMENT MODEL
// ============================================

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PremiumPlan'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'wallet'],
    default: 'credit_card'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentGateway: String,
  gatewayTransactionId: String,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  receiptUrl: String,
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

// ============================================
// 29. REPORT MODEL
// ============================================

const reportSchema = new mongoose.Schema({
  reporterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedEntityType: {
    type: String,
    enum: ['user', 'media', 'comment', 'channel'],
    default: 'media'
  },
  reportedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reportedUserId: mongoose.Schema.Types.ObjectId,
  reportReason: {
    type: String,
    enum: ['inappropriate_content', 'copyright_violation', 'spam', 
            'harassment', 'fraud', 'other'],
    required: true
  },
  description: String,
  attachments: [String],
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed'],
    default: 'open'
  },
  resolution: String,
  resolvedAt: Date,
  handledByAdminId: mongoose.Schema.Types.ObjectId,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

reportSchema.index({ reportedEntityId: 1 });
reportSchema.index({ reporterUserId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ severity: 1 });

const Report = mongoose.model('Report', reportSchema);

// ============================================
// 30. ADMIN MODEL
// ============================================

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  adminLevel: {
    type: String,
    enum: ['junior', 'senior', 'super_admin'],
    default: 'junior'
  },
  permissions: [String],
  manageUsers: {
    type: Boolean,
    default: false
  },
  manageContent: {
    type: Boolean,
    default: true
  },
  handleReports: {
    type: Boolean,
    default: true
  },
  manageAdmins: {
    type: Boolean,
    default: false
  },
  viewAnalytics: {
    type: Boolean,
    default: false
  },
  approvalRequired: {
    type: Boolean,
    default: false
  },
  activityLog: [{
    action: String,
    targetId: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    details: String
  }],
  assignedBy: mongoose.Schema.Types.ObjectId,
  assignedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.index({ userId: 1 });
adminSchema.index({ adminLevel: 1 });

const Admin = mongoose.model('Admin', adminSchema);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  User,
  Creator,
  Media,
  Video,
  Music,
  Category,
  Tag,
  Comment,
  Like,
  Subscription,
  WatchHistory,
  Notification,
  Playlist,
  Room,
  LiveQueue,
  QueueVote,
  MoodTag,
  MediaMood,
  UserMoodPreference,
  RecommendationScore,
  Course,
  VideoCheckpoint,
  QuizQuestion,
  UserResponse,
  LearningProgress,
  Certificate,
  PremiumPlan,
  Payment,
  Report,
  Admin
};
