# MongoDB Database Schema Design
# Virtual Media Streaming, Collaboration & Learning Management System

---

## Database Design Philosophy

This platform uses MongoDB with the following principles:
- **Embedded Documents**: For closely related data accessed together
- **Referenced Documents**: For independent entities with many-to-many relationships
- **Denormalization**: Strategic denormalization for performance
- **Aggregation Pipelines**: Complex queries and analytics
- **Atomic Updates**: Transaction support for critical operations

---

## CORE COLLECTIONS

---

## 1. USERS COLLECTION

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username", "passwordHash", "role"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { 
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        username: { 
          bsonType: "string",
          minLength: 3,
          maxLength: 30
        },
        passwordHash: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        profilePicture: { bsonType: "string" },
        bio: { bsonType: "string" },
        role: {
          enum: ["user", "creator", "admin"],
          default: "user"
        },
        moodPreferences: {
          bsonType: "object",
          properties: {
            preferredMoods: { bsonType: "array", items: { bsonType: "objectId" } },
            moodWeights: { bsonType: "object" }
          }
        },
        subscriptions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              creatorId: { bsonType: "objectId" },
              subscribedAt: { bsonType: "date" },
              notifications: { bsonType: "bool" }
            }
          }
        },
        isPremium: { bsonType: "bool", default: false },
        premiumExpiresAt: { bsonType: "date" },
        status: {
          enum: ["active", "inactive", "suspended"],
          default: "active"
        },
        followCount: { bsonType: "int", default: 0 },
        followerCount: { bsonType: "int", default: 0 },
        totalWatchTime: { bsonType: "int", default: 0 },
        notificationSettings: {
          bsonType: "object",
          properties: {
            emailNotifications: { bsonType: "bool", default: true },
            pushNotifications: { bsonType: "bool", default: true }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastLogin: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isPremium: 1 });
db.users.createIndex({ "moodPreferences.preferredMoods": 1 });
```

---

## 2. CREATORS COLLECTION

```javascript
db.createCollection("creators", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "channelName"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        channelName: { bsonType: "string" },
        channelDescription: { bsonType: "string" },
        channelBanner: { bsonType: "string" },
        channelLogo: { bsonType: "string" },
        verificationBadge: { bsonType: "bool", default: false },
        subscribers: { bsonType: "array", items: { bsonType: "objectId" } },
        subscriberCount: { bsonType: "int", default: 0 },
        totalViews: { bsonType: "long", default: 0 },
        totalEngagement: { bsonType: "int", default: 0 },
        contentType: {
          bsonType: "array",
          items: {
            enum: ["music", "video", "educational", "live", "podcast"]
          }
        },
        uploadedMedia: { bsonType: "array", items: { bsonType: "objectId" } },
        mediaCount: { bsonType: "int", default: 0 },
        monetizationEnabled: { bsonType: "bool", default: false },
        analyticsData: {
          bsonType: "object",
          properties: {
            views30Days: { bsonType: "long", default: 0 },
            engagement30Days: { bsonType: "int", default: 0 },
            watchTime30Days: { bsonType: "long", default: 0 },
            averageViewDuration: { bsonType: "int", default: 0 }
          }
        },
        socialLinks: {
          bsonType: "object",
          properties: {
            twitter: { bsonType: "string" },
            instagram: { bsonType: "string" },
            website: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.creators.createIndex({ userId: 1 }, { unique: true });
db.creators.createIndex({ subscriberCount: -1 });
db.creators.createIndex({ totalViews: -1 });
db.creators.createIndex({ mediaCount: -1 });
db.creators.createIndex({ createdAt: -1 });
```

---

## 3. MEDIA COLLECTION (Base)

```javascript
db.createCollection("media", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "creatorId", "type"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string", minLength: 1, maxLength: 200 },
        description: { bsonType: "string" },
        creatorId: { bsonType: "objectId" },
        creatorName: { bsonType: "string" },
        type: {
          enum: ["video", "music", "podcast", "course"]
        },
        thumbnailUrl: { bsonType: "string" },
        category: { bsonType: "objectId" },
        tags: { 
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        moodTags: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              moodId: { bsonType: "objectId" },
              moodName: { bsonType: "string" },
              score: { bsonType: "double" }
            }
          }
        },
        duration: { bsonType: "int" }, // in seconds
        views: { bsonType: "long", default: 0 },
        likes: { bsonType: "int", default: 0 },
        dislikes: { bsonType: "int", default: 0 },
        commentCount: { bsonType: "int", default: 0 },
        shareCount: { bsonType: "int", default: 0 },
        isPublic: { bsonType: "bool", default: true },
        isMonetized: { bsonType: "bool", default: false },
        status: {
          enum: ["draft", "processing", "published", "deleted"],
          default: "draft"
        },
        contentRating: {
          enum: ["G", "PG", "PG-13", "R", "NC-17"],
          default: "PG"
        },
        language: { bsonType: "string", default: "en" },
        engagementScore: { bsonType: "double", default: 0 },
        trendingScore: { bsonType: "double", default: 0 },
        statistics: {
          bsonType: "object",
          properties: {
            avgWatchDuration: { bsonType: "int", default: 0 },
            watchPercentage: { bsonType: "double", default: 0 },
            clickThroughRate: { bsonType: "double", default: 0 }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        publishedAt: { bsonType: "date" }
      }
    }
  }
});

db.media.createIndex({ creatorId: 1 });
db.media.createIndex({ type: 1 });
db.media.createIndex({ category: 1 });
db.media.createIndex({ tags: 1 });
db.media.createIndex({ "moodTags.moodId": 1 });
db.media.createIndex({ isPublic: 1, status: 1 });
db.media.createIndex({ views: -1 });
db.media.createIndex({ createdAt: -1 });
db.media.createIndex({ title: "text", description: "text" });
db.media.createIndex({ trendingScore: -1 });
db.media.createIndex({ engagementScore: -1 });
```

---

## 4. VIDEOS COLLECTION

```javascript
db.createCollection("videos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mediaId"],
      properties: {
        _id: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        videoUrl: { bsonType: "string" },
        qualityOptions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              quality: { enum: ["360p", "480p", "720p", "1080p", "4K"] },
              bitrate: { bsonType: "int" },
              url: { bsonType: "string" }
            }
          }
        },
        resolution: { bsonType: "string" },
        fileSize: { bsonType: "long" },
        codec: { bsonType: "string" },
        subtitles: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              language: { bsonType: "string" },
              url: { bsonType: "string" }
            }
          }
        },
        chapters: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              timestamp: { bsonType: "int" },
              title: { bsonType: "string" },
              description: { bsonType: "string" }
            }
          }
        },
        checkpoints: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              checkpointId: { bsonType: "objectId" },
              timestamp: { bsonType: "int" },
              type: { enum: ["quiz", "survey", "milestone"] },
              isRequired: { bsonType: "bool" }
            }
          }
        },
        transcription: { bsonType: "string" },
        isLive: { bsonType: "bool", default: false },
        recordingUrl: { bsonType: "string" }
      }
    }
  }
});

db.videos.createIndex({ mediaId: 1 }, { unique: true });
db.videos.createIndex({ "checkpoints.checkpointId": 1 });
```

---

## 5. MUSIC COLLECTION

```javascript
db.createCollection("music", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mediaId"],
      properties: {
        _id: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        musicUrl: { bsonType: "string" },
        artist: { bsonType: "string" },
        album: { bsonType: "string" },
        genre: { bsonType: "string" },
        releaseDate: { bsonType: "date" },
        isrc: { bsonType: "string" }, // International Standard Recording Code
        audioCodec: { bsonType: "string" },
        bitrate: { bsonType: "int" },
        fileSize: { bsonType: "long" },
        lyrics: { bsonType: "string" },
        lyricsUrl: { bsonType: "string" },
        instrumental: { bsonType: "bool", default: false },
        explicit: { bsonType: "bool", default: false },
        features: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        equalizer: {
          bsonType: "object",
          properties: {
            bass: { bsonType: "double" },
            treble: { bsonType: "double" },
            midRange: { bsonType: "double" }
          }
        }
      }
    }
  }
});

db.music.createIndex({ mediaId: 1 }, { unique: true });
db.music.createIndex({ artist: 1 });
db.music.createIndex({ album: 1 });
db.music.createIndex({ genre: 1 });
```

---

## 6. CATEGORIES COLLECTION

```javascript
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        slug: { bsonType: "string" },
        description: { bsonType: "string" },
        icon: { bsonType: "string" },
        color: { bsonType: "string" },
        parentCategory: { bsonType: "objectId" },
        mediaCount: { bsonType: "int", default: 0 },
        order: { bsonType: "int" }
      }
    }
  }
});

db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentCategory: 1 });
```

---

## 7. TAGS COLLECTION

```javascript
db.createCollection("tags", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        slug: { bsonType: "string" },
        mediaCount: { bsonType: "int", default: 0 },
        color: { bsonType: "string" },
        popularity: { bsonType: "double", default: 0 }
      }
    }
  }
});

db.tags.createIndex({ slug: 1 }, { unique: true });
db.tags.createIndex({ popularity: -1 });
```

---

## 8. COMMENTS COLLECTION

```javascript
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mediaId", "userId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        username: { bsonType: "string" },
        userProfilePic: { bsonType: "string" },
        content: { bsonType: "string" },
        timestamp: { bsonType: "int" }, // in seconds (if applicable)
        likes: { bsonType: "int", default: 0 },
        dislikes: { bsonType: "int", default: 0 },
        replies: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              _id: { bsonType: "objectId" },
              userId: { bsonType: "objectId" },
              username: { bsonType: "string" },
              content: { bsonType: "string" },
              likes: { bsonType: "int" },
              createdAt: { bsonType: "date" }
            }
          }
        },
        replyCount: { bsonType: "int", default: 0 },
        pinned: { bsonType: "bool", default: false },
        isEdited: { bsonType: "bool", default: false },
        isDeleted: { bsonType: "bool", default: false },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.comments.createIndex({ mediaId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1 });
db.comments.createIndex({ "replies.userId": 1 });
```

---

## 9. LIKES COLLECTION

```javascript
db.createCollection("likes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "mediaId", "type"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        type: {
          enum: ["like", "dislike", "neutral"]
        },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.likes.createIndex({ userId: 1, mediaId: 1 }, { unique: true });
db.likes.createIndex({ mediaId: 1 });
db.likes.createIndex({ type: 1 });
```

---

## 10. SUBSCRIPTIONS COLLECTION

```javascript
db.createCollection("subscriptions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "creatorId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        creatorId: { bsonType: "objectId" },
        notificationsEnabled: { bsonType: "bool", default: true },
        subscriptionTier: {
          enum: ["free", "premium", "vip"],
          default: "free"
        },
        subscribedAt: { bsonType: "date" },
        unsubscribedAt: { bsonType: "date" }
      }
    }
  }
});

db.subscriptions.createIndex({ userId: 1, creatorId: 1 }, { unique: true });
db.subscriptions.createIndex({ creatorId: 1 });
```

---

## 11. WATCH HISTORY COLLECTION

```javascript
db.createCollection("watchHistory", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "mediaId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        progress: { bsonType: "int" }, // in seconds
        totalDuration: { bsonType: "int" },
        watchPercentage: { bsonType: "double" },
        watchedAt: { bsonType: "date" },
        deviceInfo: { bsonType: "string" },
        qualityWatched: { bsonType: "string" }
      }
    }
  }
});

db.watchHistory.createIndex({ userId: 1, watchedAt: -1 });
db.watchHistory.createIndex({ mediaId: 1 });
db.watchHistory.createIndex({ userId: 1, mediaId: 1 }, { unique: true });
```

---

## 12. NOTIFICATIONS COLLECTION

```javascript
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        type: {
          enum: ["new_upload", "comment_reply", "like", "new_subscriber", 
                  "room_invite", "quiz_available", "message", "announcement"]
        },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        relatedEntityId: { bsonType: "objectId" },
        relatedEntityType: { bsonType: "string" },
        read: { bsonType: "bool", default: false },
        actionUrl: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## COLLABORATIVE COLLECTIONS

---

## 13. ROOMS COLLECTION

```javascript
db.createCollection("rooms", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["creatorId", "roomName"],
      properties: {
        _id: { bsonType: "objectId" },
        creatorId: { bsonType: "objectId" },
        creatorName: { bsonType: "string" },
        roomName: { bsonType: "string" },
        description: { bsonType: "string" },
        isPrivate: { bsonType: "bool", default: true },
        roomCode: { bsonType: "string" }, // for private rooms
        maxParticipants: { bsonType: "int", default: 50 },
        currentParticipants: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId: { bsonType: "objectId" },
              username: { bsonType: "string" },
              joinedAt: { bsonType: "date" },
              role: { enum: ["host", "editor", "viewer"] }
            }
          }
        },
        participantCount: { bsonType: "int", default: 0 },
        currentlyPlayingId: { bsonType: "objectId" },
        currentlyPlayingTitle: { bsonType: "string" },
        playbackPosition: { bsonType: "int", default: 0 },
        isPlaying: { bsonType: "bool", default: false },
        syncedPlayback: { bsonType: "bool", default: true },
        roomSettings: {
          bsonType: "object",
          properties: {
            allowExplicitContent: { bsonType: "bool", default: true },
            requireApprovalForAdditions: { bsonType: "bool", default: false },
            allowVoting: { bsonType: "bool", default: true }
          }
        },
        chatHistory: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId: { bsonType: "objectId" },
              username: { bsonType: "string" },
              message: { bsonType: "string" },
              timestamp: { bsonType: "date" }
            }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastActivityAt: { bsonType: "date" }
      }
    }
  }
});

db.rooms.createIndex({ creatorId: 1 });
db.rooms.createIndex({ isPrivate: 1 });
db.rooms.createIndex({ roomCode: 1 }, { sparse: true });
db.rooms.createIndex({ lastActivityAt: -1 });
db.rooms.createIndex({ "currentParticipants.userId": 1 });
```

---

## 14. LIVE QUEUES COLLECTION

```javascript
db.createCollection("liveQueues", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["roomId"],
      properties: {
        _id: { bsonType: "objectId" },
        roomId: { bsonType: "objectId" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              queueItemId: { bsonType: "objectId" },
              mediaId: { bsonType: "objectId" },
              mediaTitle: { bsonType: "string" },
              creatorName: { bsonType: "string" },
              thumbnail: { bsonType: "string" },
              duration: { bsonType: "int" },
              addedByUserId: { bsonType: "objectId" },
              addedByUsername: { bsonType: "string" },
              addedAt: { bsonType: "date" },
              votes: { bsonType: "int", default: 0 },
              isPlaying: { bsonType: "bool", default: false },
              playStartTime: { bsonType: "date" },
              position: { bsonType: "int" }
            }
          }
        },
        totalItems: { bsonType: "int", default: 0 },
        totalDuration: { bsonType: "int", default: 0 },
        currentIndex: { bsonType: "int", default: 0 },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.liveQueues.createIndex({ roomId: 1 }, { unique: true });
db.liveQueues.createIndex({ "items.addedByUserId": 1 });
```

---

## 15. QUEUE VOTES COLLECTION

```javascript
db.createCollection("queueVotes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["queueItemId", "userId"],
      properties: {
        _id: { bsonType: "objectId" },
        queueItemId: { bsonType: "objectId" },
        roomId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        voteType: {
          enum: ["upvote", "downvote"]
        },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.queueVotes.createIndex({ queueItemId: 1, userId: 1 }, { unique: true });
db.queueVotes.createIndex({ roomId: 1 });
```

---

## MOOD AI RECOMMENDATION COLLECTIONS

---

## 16. MOOD TAGS COLLECTION

```javascript
db.createCollection("moodTags", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        _id: { bsonType: "objectId" },
        name: {
          enum: ["Relaxing", "Focus", "Workout", "Chill", "Gaming", 
                  "Motivational", "Emotional", "Study", "Energetic", 
                  "Party", "Sleep", "Nature", "Dark", "Uplifting"]
        },
        description: { bsonType: "string" },
        color: { bsonType: "string" },
        icon: { bsonType: "string" },
        vibeCategory: { bsonType: "string" },
        associatedGenres: { bsonType: "array", items: { bsonType: "string" } },
        relatedMoods: { bsonType: "array", items: { bsonType: "objectId" } }
      }
    }
  }
});

db.moodTags.createIndex({ name: 1 }, { unique: true });
```

---

## 17. MEDIA MOODS COLLECTION

```javascript
db.createCollection("mediaMoods", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mediaId", "moodId"],
      properties: {
        _id: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        moodId: { bsonType: "objectId" },
        moodName: { bsonType: "string" },
        confidenceScore: { bsonType: "double", minimum: 0, maximum: 1 },
        userVotes: { bsonType: "int", default: 0 },
        aiAssignedAt: { bsonType: "date" },
        verifiedByUser: { bsonType: "bool", default: false }
      }
    }
  }
});

db.mediaMoods.createIndex({ mediaId: 1 });
db.mediaMoods.createIndex({ moodId: 1 });
db.mediaMoods.createIndex({ mediaId: 1, moodId: 1 }, { unique: true });
db.mediaMoods.createIndex({ confidenceScore: -1 });
```

---

## 18. USER MOOD PREFERENCES COLLECTION

```javascript
db.createCollection("userMoodPreferences", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        moodPreferences: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              moodId: { bsonType: "objectId" },
              moodName: { bsonType: "string" },
              weight: { bsonType: "double" }, // 0-1 scale
              interaction: { bsonType: "int" }, // times user selected this
              lastSelectedAt: { bsonType: "date" }
            }
          }
        },
        currentMood: { bsonType: "objectId" },
        moodHistory: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              moodId: { bsonType: "objectId" },
              selectedAt: { bsonType: "date" },
              duration: { bsonType: "int" } // in minutes
            }
          }
        },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.userMoodPreferences.createIndex({ userId: 1 }, { unique: true });
db.userMoodPreferences.createIndex({ "moodPreferences.moodId": 1 });
```

---

## 19. RECOMMENDATION SCORES COLLECTION

```javascript
db.createCollection("recommendationScores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "mediaId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        overallScore: { bsonType: "double" }, // 0-1
        moodMatchScore: { bsonType: "double" },
        personalityMatchScore: { bsonType: "double" },
        popularityScore: { bsonType: "double" },
        freshhnessScore: { bsonType: "double" },
        collaborativeScore: { bsonType: "double" }, // similar users liked
        contentScore: { bsonType: "double" }, // quality metrics
        rankPosition: { bsonType: "int" },
        calculatedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

db.recommendationScores.createIndex({ userId: 1, overallScore: -1 });
db.recommendationScores.createIndex({ mediaId: 1 });
db.recommendationScores.createIndex({ userId: 1, mediaId: 1 }, { unique: true });
db.recommendationScores.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## LEARNING & EDUCATIONAL COLLECTIONS

---

## 20. COURSES COLLECTION

```javascript
db.createCollection("courses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "creatorId"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        creatorId: { bsonType: "objectId" },
        creatorName: { bsonType: "string" },
        thumbnail: { bsonType: "string" },
        category: { bsonType: "string" },
        level: {
          enum: ["beginner", "intermediate", "advanced"],
          default: "beginner"
        },
        videos: { bsonType: "array", items: { bsonType: "objectId" } },
        videoCount: { bsonType: "int", default: 0 },
        totalDuration: { bsonType: "int", default: 0 },
        enrollmentCount: { bsonType: "int", default: 0 },
        completionCount: { bsonType: "int", default: 0 },
        averageRating: { bsonType: "double", default: 0 },
        ratingCount: { bsonType: "int", default: 0 },
        prerequisites: { bsonType: "array", items: { bsonType: "objectId" } },
        certificateEligible: { bsonType: "bool", default: true },
        passingScore: { bsonType: "int", default: 70 },
        price: { bsonType: "double", default: 0 },
        isPaid: { bsonType: "bool", default: false },
        isPublished: { bsonType: "bool", default: false },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.courses.createIndex({ creatorId: 1 });
db.courses.createIndex({ isPublished: 1 });
db.courses.createIndex({ "videos": 1 });
db.courses.createIndex({ enrollmentCount: -1 });
```

---

## 21. VIDEO CHECKPOINTS COLLECTION

```javascript
db.createCollection("videoCheckpoints", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["videoId", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        videoId: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        courseId: { bsonType: "objectId" },
        timestamp: { bsonType: "int" }, // in seconds
        checkpointType: {
          enum: ["quiz", "survey", "milestone", "reading", "exercise"]
        },
        isRequired: { bsonType: "bool", default: true },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        relatedQuizId: { bsonType: "objectId" },
        instructions: { bsonType: "string" },
        passingCriteria: { bsonType: "int" }, // min score %
        timeLimit: { bsonType: "int" }, // in seconds, 0 = no limit
        attempts: { bsonType: "int", default: 3 },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.videoCheckpoints.createIndex({ videoId: 1, timestamp: 1 });
db.videoCheckpoints.createIndex({ courseId: 1 });
db.videoCheckpoints.createIndex({ relatedQuizId: 1 });
```

---

## 22. QUIZ QUESTIONS COLLECTION

```javascript
db.createCollection("quizQuestions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["checkpointId", "questionText"],
      properties: {
        _id: { bsonType: "objectId" },
        checkpointId: { bsonType: "objectId" },
        videoId: { bsonType: "objectId" },
        questionText: { bsonType: "string" },
        questionType: {
          enum: ["mcq", "trueFalse", "shortAnswer", "multipleSelection"]
        },
        difficulty: {
          enum: ["easy", "medium", "hard"],
          default: "medium"
        },
        points: { bsonType: "int", default: 1 },
        options: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              optionId: { bsonType: "objectId" },
              text: { bsonType: "string" },
              isCorrect: { bsonType: "bool" }
            }
          }
        },
        explanation: { bsonType: "string" },
        order: { bsonType: "int" },
        isRequired: { bsonType: "bool", default: true }
      }
    }
  }
});

db.quizQuestions.createIndex({ checkpointId: 1, order: 1 });
db.quizQuestions.createIndex({ videoId: 1 });
```

---

## 23. USER RESPONSES COLLECTION

```javascript
db.createCollection("userResponses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "questionId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        questionId: { bsonType: "objectId" },
        checkpointId: { bsonType: "objectId" },
        videoId: { bsonType: "objectId" },
        courseId: { bsonType: "objectId" },
        selectedOptionId: { bsonType: "objectId" },
        selectedOptions: { bsonType: "array", items: { bsonType: "objectId" } },
        responseText: { bsonType: "string" },
        isCorrect: { bsonType: "bool" },
        pointsEarned: { bsonType: "int", default: 0 },
        timeSpent: { bsonType: "int" }, // in seconds
        attemptNumber: { bsonType: "int", default: 1 },
        answeredAt: { bsonType: "date" }
      }
    }
  }
});

db.userResponses.createIndex({ userId: 1, courseId: 1 });
db.userResponses.createIndex({ checkpointId: 1 });
db.userResponses.createIndex({ videoId: 1 });
```

---

## 24. LEARNING PROGRESS COLLECTION

```javascript
db.createCollection("learningProgress", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "courseId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        courseId: { bsonType: "objectId" },
        enrollmentDate: { bsonType: "date" },
        completedVideos: { bsonType: "array", items: { bsonType: "objectId" } },
        completedVideoCount: { bsonType: "int", default: 0 },
        totalVideos: { bsonType: "int", default: 0 },
        progressPercentage: { bsonType: "double", default: 0 },
        totalQuizScore: { bsonType: "double", default: 0 },
        quizzesAttempted: { bsonType: "int", default: 0 },
        quizzesCompleted: { bsonType: "int", default: 0 },
        averageQuizScore: { bsonType: "double", default: 0 },
        certificateEarned: { bsonType: "bool", default: false },
        certificateId: { bsonType: "objectId" },
        certificateEarnedAt: { bsonType: "date" },
        courseCompletedAt: { bsonType: "date" },
        totalTimeSpent: { bsonType: "int", default: 0 }, // in seconds
        lastActivityAt: { bsonType: "date" },
        status: {
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started"
        },
        streakDays: { bsonType: "int", default: 0 }
      }
    }
  }
});

db.learningProgress.createIndex({ userId: 1, courseId: 1 }, { unique: true });
db.learningProgress.createIndex({ progressPercentage: -1 });
db.learningProgress.createIndex({ status: 1 });
```

---

## 25. CERTIFICATES COLLECTION

```javascript
db.createCollection("certificates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "courseId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        courseId: { bsonType: "objectId" },
        courseName: { bsonType: "string" },
        creatorName: { bsonType: "string" },
        certificateNumber: { bsonType: "string" },
        earnedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        finalScore: { bsonType: "double" },
        certificateUrl: { bsonType: "string" },
        verificationUrl: { bsonType: "string" },
        isVerified: { bsonType: "bool", default: true },
        shareable: { bsonType: "bool", default: true }
      }
    }
  }
});

db.certificates.createIndex({ userId: 1, courseId: 1 }, { unique: true });
db.certificates.createIndex({ certificateNumber: 1 }, { unique: true });
db.certificates.createIndex({ earnedAt: -1 });
```

---

## PLAYLIST COLLECTIONS

---

## 26. PLAYLISTS COLLECTION

```javascript
db.createCollection("playlists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "name"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        thumbnail: { bsonType: "string" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              mediaId: { bsonType: "objectId" },
              position: { bsonType: "int" },
              addedAt: { bsonType: "date" }
            }
          }
        },
        itemCount: { bsonType: "int", default: 0 },
        isPublic: { bsonType: "bool", default: false },
        isCollaborative: { bsonType: "bool", default: false },
        collaborators: { bsonType: "array", items: { bsonType: "objectId" } },
        collaboratorCount: { bsonType: "int", default: 0 },
        isFavorite: { bsonType: "bool", default: false },
        views: { bsonType: "int", default: 0 },
        likes: { bsonType: "int", default: 0 },
        totalDuration: { bsonType: "int", default: 0 }, // in seconds
        autoGenerated: { bsonType: "bool", default: false },
        generationReason: { bsonType: "string" }, // mood, recommendations, trending
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.playlists.createIndex({ userId: 1 });
db.playlists.createIndex({ isPublic: 1 });
db.playlists.createIndex({ "items.mediaId": 1 });
db.playlists.createIndex({ collaborators: 1 });
```

---

## 27. PLAYLIST ITEMS COLLECTION

```javascript
db.createCollection("playlistItems", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["playlistId", "mediaId"],
      properties: {
        _id: { bsonType: "objectId" },
        playlistId: { bsonType: "objectId" },
        mediaId: { bsonType: "objectId" },
        position: { bsonType: "int" },
        addedByUserId: { bsonType: "objectId" },
        addedAt: { bsonType: "date" },
        notes: { bsonType: "string" }
      }
    }
  }
});

db.playlistItems.createIndex({ playlistId: 1, position: 1 });
db.playlistItems.createIndex({ mediaId: 1 });
```

---

## PREMIUM & PAYMENT COLLECTIONS

---

## 28. PREMIUM PLANS COLLECTION

```javascript
db.createCollection("premiumPlans", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        price: { bsonType: "double" },
        billingCycle: {
          enum: ["monthly", "quarterly", "annual"],
          default: "monthly"
        },
        features: { bsonType: "array", items: { bsonType: "string" } },
        adFree: { bsonType: "bool", default: false },
        offlineDownloads: { bsonType: "bool", default: false },
        hd4k: { bsonType: "bool", default: false },
        unlimitedSkips: { bsonType: "bool", default: false },
        customizedMixedPlaylist: { bsonType: "bool", default: false },
        maxSimultaneousStreams: { bsonType: "int", default: 1 },
        storageLimit: { bsonType: "long", default: 0 }, // in MB
        prioritySupport: { bsonType: "bool", default: false },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.premiumPlans.createIndex({ price: 1 });
```

---

## 29. PAYMENTS COLLECTION

```javascript
db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "amount", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        planId: { bsonType: "objectId" },
        transactionId: { bsonType: "string" },
        amount: { bsonType: "double" },
        currency: { bsonType: "string", default: "USD" },
        paymentMethod: {
          enum: ["credit_card", "debit_card", "paypal", "wallet"],
          default: "credit_card"
        },
        status: {
          enum: ["pending", "completed", "failed", "cancelled", "refunded"],
          default: "pending"
        },
        paymentGateway: { bsonType: "string" },
        gatewayTransactionId: { bsonType: "string" },
        subscriptionStartDate: { bsonType: "date" },
        subscriptionEndDate: { bsonType: "date" },
        autoRenew: { bsonType: "bool", default: true },
        receiptUrl: { bsonType: "string" },
        failureReason: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true });
```

---

## MODERATION & REPORTING COLLECTIONS

---

## 30. REPORTS COLLECTION

```javascript
db.createCollection("reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reporterUserId", "reportedEntityType"],
      properties: {
        _id: { bsonType: "objectId" },
        reporterUserId: { bsonType: "objectId" },
        reportedEntityType: {
          enum: ["user", "media", "comment", "channel"],
          default: "media"
        },
        reportedEntityId: { bsonType: "objectId" },
        reportedUserId: { bsonType: "objectId" },
        reportReason: {
          enum: ["inappropriate_content", "copyright_violation", "spam", 
                  "harassment", "fraud", "other"]
        },
        description: { bsonType: "string" },
        attachments: { bsonType: "array", items: { bsonType: "string" } },
        status: {
          enum: ["open", "investigating", "resolved", "closed"],
          default: "open"
        },
        resolution: { bsonType: "string" },
        resolvedAt: { bsonType: "date" },
        handledByAdminId: { bsonType: "objectId" },
        severity: {
          enum: ["low", "medium", "high", "critical"],
          default: "medium"
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.reports.createIndex({ reportedEntityId: 1 });
db.reports.createIndex({ reporterUserId: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ severity: 1 });
db.reports.createIndex({ createdAt: -1 });
```

---

## 31. ADMINS COLLECTION

```javascript
db.createCollection("admins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        adminLevel: {
          enum: ["junior", "senior", "super_admin"],
          default: "junior"
        },
        permissions: { bsonType: "array", items: { bsonType: "string" } },
        manageUsers: { bsonType: "bool", default: false },
        manageContent: { bsonType: "bool", default: true },
        handleReports: { bsonType: "bool", default: true },
        manageAdmins: { bsonType: "bool", default: false },
        viewAnalytics: { bsonType: "bool", default: false },
        approvalRequired: { bsonType: "bool", default: false },
        activityLog: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              action: { bsonType: "string" },
              targetId: { bsonType: "objectId" },
              timestamp: { bsonType: "date" },
              details: { bsonType: "string" }
            }
          }
        },
        assignedBy: { bsonType: "objectId" },
        assignedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.admins.createIndex({ userId: 1 }, { unique: true });
db.admins.createIndex({ adminLevel: 1 });
```

---

## DATABASE OPTIMIZATION STRATEGIES

### Index Summary

```javascript
// Text Search Index for Discovery
db.media.createIndex({ title: "text", description: "text", "moodTags.moodName": "text" });

// Compound Indexes for Common Queries
db.media.createIndex({ isPublic: 1, status: 1, publishedAt: -1 });
db.watchHistory.createIndex({ userId: 1, watchedAt: -1 });
db.comments.createIndex({ mediaId: 1, createdAt: -1 });
db.liveQueues.createIndex({ roomId: 1, "items.addedByUserId": 1 });

// Aggregation Indexes
db.media.createIndex({ creatorId: 1, views: -1 });
db.users.createIndex({ createdAt: -1 });
db.courses.createIndex({ isPublished: 1, enrollmentCount: -1 });
```

### Connection Pooling
Set `maxPoolSize: 50` and `minPoolSize: 10` in production.

### Query Optimization
- Always use indexes for sorting and filtering
- Limit returned fields with projection
- Batch write operations
- Use aggregation pipelines for complex queries

---

## Data Relationships Overview

```
Users
  ├── Creators (1:many)
  ├── Media -> watchHistory (many:many)
  ├── Playlists (1:many)
  ├── Comments (1:many)
  ├── Subscriptions -> Creators (many:many)
  ├── Rooms (1:many)
  ├── LearningProgress -> Courses (many:many)
  └── Certificates (1:many)

Creators
  ├── Media (1:many)
  └── Courses (1:many)

Media
  ├── Videos or Music (1:1)
  ├── Comments (1:many)
  ├── Likes (1:many)
  ├── MoodTags (many:many)
  ├── Categories (many:1)
  ├── WatchHistory (1:many)
  └── Playlists (many:many)

Rooms
  ├── LiveQueues (1:1)
  ├── RoomParticipants (1:many)
  └── QueueVotes (many:many)

Courses
  ├── Videos (1:many)
  ├── VideoCheckpoints (1:many)
  ├── LearningProgress (1:many)
  └── Certificates (1:many)
```

---

## Aggregation Pipeline Examples

These are demonstrated in the backend service files.
```

