require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { 
  User, Creator, Media, Video, Music, MoodTag, Category, 
  PremiumPlan, Course, MediaMood 
} = require('../models');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Creator.deleteMany({}),
      Media.deleteMany({}),
      Video.deleteMany({}),
      Music.deleteMany({}),
      MoodTag.deleteMany({}),
      Category.deleteMany({}),
      PremiumPlan.deleteMany({}),
      MediaMood.deleteMany({})
    ]);
    console.log('✓ Cleared existing collections');

    // Seed Mood Tags
    const moods = await MoodTag.insertMany([
      {
        name: 'Relaxing',
        description: 'Calm and peaceful content',
        color: 'from-blue-400 to-cyan-400',
        icon: '😴',
        vibeCategory: 'chill'
      },
      {
        name: 'Focus',
        description: 'Content to help you concentrate',
        color: 'from-purple-400 to-pink-400',
        icon: '🎯',
        vibeCategory: 'productive'
      },
      {
        name: 'Workout',
        description: 'High energy content for exercise',
        color: 'from-red-400 to-orange-400',
        icon: '💪',
        vibeCategory: 'energetic'
      },
      {
        name: 'Study',
        description: 'Educational and learning content',
        color: 'from-green-400 to-emerald-400',
        icon: '📚',
        vibeCategory: 'educational'
      },
      {
        name: 'Emotional',
        description: 'Deep and meaningful content',
        color: 'from-rose-400 to-pink-400',
        icon: '💔',
        vibeCategory: 'emotional'
      }
    ]);
    console.log(`✓ Seeded ${moods.length} mood tags`);

    // Seed Categories
    const categories = await Category.insertMany([
      {
        name: 'Music',
        slug: 'music',
        description: 'Music streaming',
        icon: '🎵',
        color: '#ec4899'
      },
      {
        name: 'Videos',
        slug: 'videos',
        description: 'Video content',
        icon: '🎬',
        color: '#3b82f6'
      },
      {
        name: 'Learning',
        slug: 'learning',
        description: 'Educational courses',
        icon: '📚',
        color: '#10b981'
      },
      {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Gaming content',
        icon: '🎮',
        color: '#f59e0b'
      }
    ]);
    console.log(`✓ Seeded ${categories.length} categories`);

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const users = await User.insertMany([
      {
        email: 'demo@example.com',
        username: 'demo_user',
        passwordHash: await bcrypt.hash('password123', salt),
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        isPremium: false,
        status: 'active'
      },
      {
        email: 'creator@example.com',
        username: 'content_creator',
        passwordHash: await bcrypt.hash('password123', salt),
        firstName: 'Content',
        lastName: 'Creator',
        role: 'creator',
        isPremium: true,
        status: 'active'
      },
      {
        email: 'admin@example.com',
        username: 'admin',
        passwordHash: await bcrypt.hash('admin123', salt),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active'
      }
    ]);
    console.log(`✓ Seeded ${users.length} users`);

    // Seed Creator Profile
    await Creator.create({
      userId: users[1]._id,
      channelName: 'Amazing Content Channel',
      channelDescription: 'Creating amazing videos and music',
      verificationBadge: true,
      contentType: ['music', 'video', 'educational'],
      subscribers: [users[0]._id],
      subscriberCount: 1,
      monetizationEnabled: true
    });
    console.log('✓ Seeded creator profile');

    // Seed Premium Plans
    await PremiumPlan.insertMany([
      {
        name: 'Basic',
        description: 'Basic subscription',
        price: 4.99,
        billingCycle: 'monthly',
        features: ['Ad-free', 'Standard quality'],
        adFree: true,
        maxSimultaneousStreams: 1
      },
      {
        name: 'Premium',
        description: 'Premium subscription',
        price: 9.99,
        billingCycle: 'monthly',
        features: ['Ad-free', 'HD quality', 'Offline downloads'],
        adFree: true,
        offlineDownloads: true,
        hd4k: false,
        maxSimultaneousStreams: 2
      },
      {
        name: 'Pro',
        description: 'Professional subscription',
        price: 14.99,
        billingCycle: 'monthly',
        features: ['Ad-free', '4K quality', 'Offline', 'Priority support'],
        adFree: true,
        offlineDownloads: true,
        hd4k: true,
        prioritySupport: true,
        maxSimultaneousStreams: 4
      }
    ]);
    console.log('✓ Seeded premium plans');

    // Seed Media
    const seededMedia = await Media.insertMany([
      {
        title: 'Chill Lofi Beats',
        description: 'Lofi music track to relax and study to.',
        type: 'music',
        creatorId: users[1]._id,
        creatorName: 'Amazing Content Channel',
        category: categories[0]._id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        status: 'published',
        isPublic: true,
        views: 1200,
        likes: 150,
        commentCount: 12,
        shareCount: 5,
        duration: 240,
        publishedAt: new Date()
      },
      {
        title: 'Epic Ocean Drone Footage',
        description: 'Stunning 4K drone video of coastal landscapes.',
        type: 'video',
        creatorId: users[1]._id,
        creatorName: 'Amazing Content Channel',
        category: categories[1]._id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
        status: 'published',
        isPublic: true,
        views: 3500,
        likes: 420,
        commentCount: 45,
        shareCount: 22,
        duration: 180,
        publishedAt: new Date()
      },
      {
        title: 'Deep Study Concentration Music',
        description: 'Binaural beats for high-level brain focus.',
        type: 'music',
        creatorId: users[1]._id,
        creatorName: 'Amazing Content Channel',
        category: categories[0]._id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500',
        status: 'published',
        isPublic: true,
        views: 890,
        likes: 95,
        commentCount: 8,
        shareCount: 2,
        duration: 600,
        publishedAt: new Date()
      },
      {
        title: 'Advanced Node.js Architecture Tutorial',
        description: 'Learn MVC, routes, models, and performance aggregates.',
        type: 'video',
        creatorId: users[1]._id,
        creatorName: 'Amazing Content Channel',
        category: categories[2]._id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        status: 'published',
        isPublic: true,
        views: 5200,
        likes: 680,
        commentCount: 89,
        shareCount: 54,
        duration: 1200,
        publishedAt: new Date()
      }
    ]);
    console.log(`✓ Seeded ${seededMedia.length} media items`);

    // Seed matching Video and Music records
    await Video.create([
      {
        mediaId: seededMedia[1]._id,
        videoUrl: 'uploads/videos/video-1779475475491-541439176.mp4',
        fileSize: 1082672,
        qualityOptions: [
          { quality: '1080p', url: 'uploads/videos/video-1779475475491-541439176.mp4' }
        ]
      },
      {
        mediaId: seededMedia[3]._id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        fileSize: 10000000,
        qualityOptions: [
          { quality: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    ]);

    await Music.create([
      {
        mediaId: seededMedia[0]._id,
        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        artist: 'Amazing Content Creator',
        album: 'Seeded Beats Vol. 1'
      },
      {
        mediaId: seededMedia[2]._id,
        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        artist: 'Amazing Content Creator',
        album: 'Seeded Beats Vol. 1'
      }
    ]);
    console.log('✓ Seeded Video and Music records');

    // Link Media to Moods in MediaMood collection
    await MediaMood.insertMany([
      {
        mediaId: seededMedia[0]._id,
        moodId: moods[0]._id,
        moodName: 'Relaxing',
        confidenceScore: 0.95
      },
      {
        mediaId: seededMedia[1]._id,
        moodId: moods[0]._id,
        moodName: 'Relaxing',
        confidenceScore: 0.8
      },
      {
        mediaId: seededMedia[1]._id,
        moodId: moods[4]._id,
        moodName: 'Emotional',
        confidenceScore: 0.85
      },
      {
        mediaId: seededMedia[2]._id,
        moodId: moods[1]._id,
        moodName: 'Focus',
        confidenceScore: 0.9
      },
      {
        mediaId: seededMedia[2]._id,
        moodId: moods[3]._id,
        moodName: 'Study',
        confidenceScore: 0.95
      },
      {
        mediaId: seededMedia[3]._id,
        moodId: moods[1]._id,
        moodName: 'Focus',
        confidenceScore: 0.75
      },
      {
        mediaId: seededMedia[3]._id,
        moodId: moods[3]._id,
        moodName: 'Study',
        confidenceScore: 0.9
      }
    ]);
    console.log('✓ Linked media to mood tags');

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
