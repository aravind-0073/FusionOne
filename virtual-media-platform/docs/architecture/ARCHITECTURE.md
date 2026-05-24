# Architecture & System Design Documentation
# Virtual Media Streaming Platform

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
├─────────────────────────────────────────────────────────────────┤
│  React (SPA) │ Tailwind CSS │ Framer Motion │ Socket.IO Client  │
│  State Management (Zustand) │ Real-time Updates                  │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS / WebSocket
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY TIER                           │
├─────────────────────────────────────────────────────────────────┤
│  Nginx / Load Balancer │ Rate Limiting │ Request Validation     │
│  CORS Configuration │ SSL Termination                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                              │
├─────────────────────────────────────────────────────────────────┤
│  Express.js │ Node.js Runtime │ Socket.IO Server                │
│  Authentication │ Route Handlers │ Business Logic               │
│  Middleware Stack │ Error Handling                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
     ┌────────┼────────┬──────────────┐
     ↓        ↓        ↓              ↓
┌─────────┐ ┌──────┐ ┌──────────┐ ┌────────┐
│ MongoDB │ │Redis │ │Cloudinary│ │ SMTP   │
│ Primary │ │Cache │ │  CDN     │ │ Server │
│ Database│ │Store │ │Media     │ │ Email  │
└─────────┘ └──────┘ └──────────┘ └────────┘
```

---

## 📊 Data Flow Architecture

### User Registration & Authentication Flow

```
User Input
    ↓
Frontend Form Validation
    ↓
API Request (POST /auth/register)
    ↓
Backend Validation (Joi)
    ↓
Check Email Uniqueness (Query DB)
    ↓
Hash Password (bcrypt)
    ↓
Create User Document
    ↓
Generate JWT Token (7 days)
    ↓
Generate Refresh Token (30 days)
    ↓
Send Verification Email
    ↓
Return Token & User Data
    ↓
Store Token in localStorage
    ↓
Redirect to Home
```

### Media Upload Flow

```
User Selects Files
    ↓
Client-side Validation
    ↓
Multipart Form Data Upload
    ↓
Multer Middleware Processing
    ↓
Backend Validation
    ↓
Store Files (Cloudinary/S3)
    ↓
Create Media Document
    ↓
Extract Metadata (duration, codec)
    ↓
Generate Thumbnail
    ↓
AI Mood Detection
    ↓
Create Video/Music Document
    ↓
Update Creator Stats
    ↓
Change Status to "processing"
    ↓
Background Job: Transcode Video
    ↓
Change Status to "published"
    ↓
Notify Creator
```

### Media Discovery & Recommendation Flow

```
User Opens Home
    ↓
Fetch User Mood Preferences
    ↓
Fetch Recommendation Scores (from cache/DB)
    ↓
Run Aggregation Pipeline:
  ├─ Match published media
  ├─ Lookup mood preferences
  ├─ Calculate mood match score
  ├─ Calculate engagement score
  ├─ Calculate popularity score
  ├─ Calculate freshness score
  ├─ Calculate collaborative score
  └─ Combine all scores (weighted)
    ↓
Exclude watched media
    ↓
Sort by final score
    ↓
Limit to 20 results
    ↓
Return to Frontend
    ↓
Display with Animations
```

### Collaborative Room Real-Time Flow

```
User A Creates Room
    ↓
Room Document Created
    ↓
Room Code Generated
    ↓
User A Joins (Socket Connection)
    ↓
Socket emits: "joinRoom"
    ↓
Backend: Updates Room.currentParticipants
    ↓
Broadcast: "userJoined" to other participants
    ↓
User A Adds Media to Queue
    ↓
Socket emits: "addToQueue"
    ↓
Backend: Updates LiveQueue.items
    ↓
Atomic operation: $push item
    ↓
Broadcast: "queueUpdated" with new items
    ↓
All clients update UI instantly
    ↓
User B Votes on Item
    ↓
Socket emits: "voteMedia"
    ↓
Backend: $inc votes counter
    ↓
Broadcast: "voteUpdated" with new vote count
    ↓
Queue re-sorts (by votes)
    ↓
All clients sync new order
```

---

## 🎯 Database Design Patterns

### 1. Embedded vs Referenced Documents

**Embedded (Denormalization)**
- Use when: Data accessed together frequently
- Example: User's mood preferences embedded in user document
- Pros: Single query, faster retrieval
- Cons: Data duplication, larger documents

```javascript
// Embedded approach
{
  _id: ObjectId,
  username: "user1",
  moodPreferences: {
    preferredMoods: [ObjectId1, ObjectId2],
    moodWeights: { Relaxing: 0.8, Focus: 0.5 }
  }
}
```

**Referenced (Normalization)**
- Use when: Data has many-to-many relationships
- Example: Comments reference users and media
- Pros: Reduced duplication, flexibility
- Cons: Multiple queries needed

```javascript
// Referenced approach
// Comments collection
{
  _id: ObjectId,
  mediaId: ObjectId,
  userId: ObjectId,
  content: "..."
}
```

### 2. Aggregation Pipeline Patterns

**Multi-Stage Calculation**
```javascript
[
  { $match: { /* filter */ } },
  { $lookup: { /* join data */ } },
  { $addFields: { /* compute scores */ } },
  { $group: { /* aggregate */ } },
  { $sort: { /* order results */ } },
  { $limit: { /* pagination */ } },
  { $project: { /* select fields */ } }
]
```

**Scoring Algorithm**
```javascript
{
  $addFields: {
    finalScore: {
      $add: [
        { $multiply: ['$moodScore', 0.3] },
        { $multiply: ['$engagementScore', 0.25] },
        { $multiply: ['$popularityScore', 0.2] },
        { $multiply: ['$freshnessScore', 0.15] },
        { $multiply: ['$collaborativeScore', 0.1] }
      ]
    }
  }
}
```

### 3. Array Operations

**Push with Limit**
```javascript
{
  $push: {
    chatHistory: {
      $each: [newMessage],
      $slice: -100 // Keep only last 100 messages
    }
  }
}
```

**Conditional Array Updates**
```javascript
{
  $cond: [
    { $in: [userId, '$subscribers'] },
    { $pull: { subscribers: userId } },
    { $push: { subscribers: userId } }
  ]
}
```

---

## 🔄 API Request/Response Cycle

### Request Lifecycle

```
1. REQUEST ARRIVAL
   ↓
2. CORS MIDDLEWARE
   - Check origin
   - Validate headers
   ↓
3. BODY PARSING
   - Parse JSON
   - Validate size
   ↓
4. AUTHENTICATION
   - Extract JWT
   - Verify signature
   - Validate expiry
   ↓
5. AUTHORIZATION
   - Check user role
   - Verify permissions
   ↓
6. VALIDATION
   - Input validation (Joi)
   - Schema validation
   ↓
7. RATE LIMITING
   - Check request count
   - Validate window
   ↓
8. REQUEST HANDLING
   - Execute controller
   - Query database
   - Process data
   ↓
9. RESPONSE FORMATTING
   - Format JSON
   - Add metadata
   ↓
10. RESPONSE SENDING
    - Set headers
    - Stream response
    ↓
11. LOGGING
    - Record request
    - Track metrics
```

---

## 💾 Caching Strategy

### Cache Layers

**1. Client-Side Caching**
- LocalStorage: User preferences, auth tokens
- SessionStorage: Temporary data
- IndexedDB: Large datasets (watch history, playlists)

**2. Browser Cache**
- HTTP Cache-Control headers
- ETag validation
- Conditional requests

**3. Redis Cache (Server)**
- User sessions
- Recommendation scores (TTL: 1 hour)
- Trending calculations (TTL: 6 hours)
- Search indexes
- Leaderboards

```javascript
// Example Redis caching
const cacheKey = `recommendations:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const recommendations = await generateRecommendations(userId);
await redis.setex(cacheKey, 3600, JSON.stringify(recommendations));
return recommendations;
```

**4. Database Query Optimization**
- Covered indexes
- Projection (select specific fields)
- Aggregation pipeline caching
- Query profiling

---

## 🔐 Security Architecture

### Authentication Flow

```
User Credentials
    ↓
Hash with bcrypt (10 rounds)
    ↓
Compare with stored hash
    ↓
Generate JWT
├─ Algorithm: HS256
├─ Secret: Strong random key
├─ Payload: { id, role }
└─ Expiry: 7 days
    ↓
Return Token
    ↓
Store in httpOnly cookie (secure flag)
    ↓
Include in Authorization header
```

### Authorization Layers

```
Request with Token
    ↓
Verify JWT Signature
    ↓
Check Token Expiry
    ↓
Fetch User from Database
    ↓
Check User Status (active/suspended)
    ↓
Verify Role-Based Access Control
    ↓
Verify Resource Ownership (if applicable)
    ↓
Allow/Deny Request
```

### Security Headers

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📈 Scalability Patterns

### Horizontal Scaling

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┼────┐
    ↓    ↓    ↓
  ┌──┐ ┌──┐ ┌──┐
  │01│ │02│ │03│ (Node.js Instances)
  └──┘ └──┘ └──┘
    │    │    │
    └────┼────┘
         ↓
    ┌────────┐
    │ Redis  │ (Shared Cache)
    └────────┘
         │
    ┌────────┐
    │MongoDB │ (Replicated Set)
    └────────┘
```

### Database Replication

```
Primary Node (Write)
    ↓
Oplog (Operation Log)
    ↓
Secondary Nodes (Read-Only)
├─ Secondary 1
├─ Secondary 2
└─ Arbiter (Voting)
    ↓
Auto-failover if primary fails
```

### Sharding Strategy

**Shard Key: `creatorId`**

```
Range-based sharding
├─ Shard 1: creatorId [0 - 333...]
├─ Shard 2: creatorId [333... - 666...]
└─ Shard 3: creatorId [666... - FFF...]

Benefits:
- Even distribution of creator data
- Good locality for creator's media queries
- Supports growth
```

---

## 🎬 Media Processing Architecture

### Video Transcoding Pipeline

```
Upload Video
    ↓
Queue to Job System
    ↓
Extract Metadata
├─ Duration
├─ Codec
├─ Resolution
└─ Bitrate
    ↓
Generate Thumbnail
    ↓
Transcode to Multiple Formats
├─ 360p (500 kbps)
├─ 480p (1000 kbps)
├─ 720p (2500 kbps)
└─ 1080p (5000 kbps)
    ↓
Upload to CDN
    ↓
Generate HLS Playlist
    ↓
Update Media Document
    ↓
Mark as Ready
    ↓
Notify User
```

### Media Delivery

```
User Request
    ↓
CDN Check
├─ If cached: Return from edge
└─ If not: Fetch from origin
    ↓
Select Quality (adaptive)
├─ Based on bandwidth
├─ Based on device
└─ Based on user preference
    ↓
Stream HLS Playlist
    ↓
Progressive Download
```

---

## 📊 Analytics & Monitoring

### Metrics Tracked

```
User Metrics
├─ Total users
├─ Active users (DAU, WAU, MAU)
├─ User growth rate
├─ Churn rate
└─ Retention rate

Content Metrics
├─ Total uploads
├─ Upload rate
├─ Average video length
├─ Upload quality distribution
└─ Content removal rate

Engagement Metrics
├─ Views per video
├─ Average watch duration
├─ Completion rate
├─ Like/dislike ratio
├─ Comment rate
├─ Share rate
└─ Session length

Creator Metrics
├─ Creator count
├─ Average subscribers
├─ Average views per creator
├─ Monetization rate
└─ Creator growth

Technical Metrics
├─ API response time
├─ Database query time
├─ Cache hit rate
├─ Error rate
├─ Uptime
└─ CDN bandwidth
```

### Monitoring Dashboard

```
Real-time Metrics
├─ Active connections
├─ Requests/second
├─ Response times
├─ Error rates
└─ Database load

Historical Trends
├─ Daily active users
├─ Total uploads
├─ Total views
├─ Engagement trends
└─ Revenue trends

Alerts
├─ High error rate (> 5%)
├─ High latency (> 500ms)
├─ Database down
├─ Cache down
└─ Disk space critical
```

---

## 🚀 Deployment Architecture

### Development Environment

```
Developer Machine
├─ Node.js
├─ MongoDB (local)
├─ Redis (local)
└─ Ngrok (for webhooks)
```

### Staging Environment

```
AWS/GCP Instance
├─ Node.js (production mode)
├─ MongoDB Atlas
├─ Redis Cloud
├─ SSL Certificates
└─ Backup strategy
```

### Production Environment

```
Load Balancer
├─ Auto-scaling group
│  └─ 3-10 Node.js instances
├─ MongoDB Replica Set
│  └─ 3+ nodes
├─ Redis Cluster
│  └─ 6+ nodes
├─ CDN (Cloudinary/AWS CloudFront)
├─ Backup System
│  └─ Daily snapshots
└─ Monitoring & Logging
   └─ ELK Stack / Datadog
```

---

## 🔄 CI/CD Pipeline

### Automated Testing & Deployment

```
Code Push to main
    ↓
GitHub Actions Triggered
    ↓
1. LINT
   └─ ESLint checks
    ↓
2. TEST
   ├─ Unit tests
   ├─ Integration tests
   └─ E2E tests (sample)
    ↓
3. BUILD
   ├─ Backend build
   └─ Frontend build
    ↓
4. DOCKER BUILD
   ├─ Build images
   └─ Push to registry
    ↓
5. STAGING DEPLOY
   └─ Deploy to staging
    ↓
6. SMOKE TESTS
   └─ Basic functionality
    ↓
7. APPROVAL
   └─ Manual review
    ↓
8. PRODUCTION DEPLOY
   └─ Blue-green deployment
    ↓
9. HEALTH CHECK
   └─ Verify health
    ↓
10. ROLLBACK (if needed)
    └─ Automatic rollback
```

---

## 📱 Frontend State Management

### State Structure

```
App State
├─ Auth
│  ├─ user
│  ├─ token
│  ├─ isAuthenticated
│  └─ role
├─ Media
│  ├─ currentMedia
│  ├─ mediaList
│  ├─ trending
│  └─ recommendations
├─ User
│  ├─ profile
│  ├─ watchHistory
│  ├─ playlists
│  ├─ subscriptions
│  └─ preferences
├─ Room (Collaborative)
│  ├─ currentRoom
│  ├─ participants
│  ├─ queue
│  └─ chat
└─ UI
   ├─ theme (light/dark)
   ├─ sidebarOpen
   ├─ modals
   └─ notifications
```

### Zustand Store Example

```javascript
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  media: [],
  setMedia: (media) => set({ media }),
  addMedia: (item) => set((state) => ({
    media: [...state.media, item]
  })),
  
  recommendations: [],
  fetchRecommendations: async () => {
    const data = await api.get('/recommendations');
    set({ recommendations: data });
  }
}));
```

---

## 🔌 WebSocket Events

### Event Categories

**Room Events**
- `joinRoom` - User joins room
- `leaveRoom` - User leaves room
- `userJoined` - Broadcast user join
- `userLeft` - Broadcast user leave
- `roomClosed` - Host closes room

**Queue Events**
- `addToQueue` - Add media to queue
- `removeFromQueue` - Remove media
- `reorderQueue` - Reorder items
- `queueUpdated` - Broadcast queue change

**Vote Events**
- `voteMedia` - Vote on queue item
- `voteUpdated` - Broadcast vote count

**Chat Events**
- `sendMessage` - Send chat message
- `newMessage` - Broadcast message
- `messageDeleted` - Delete message

**Playback Events**
- `play` - Start playback
- `pause` - Pause playback
- `seek` - Jump to position
- `playbackSync` - Sync all clients

**Notification Events**
- `notification` - Receive notification
- `notificationRead` - Mark as read

---

## 🌐 Network Architecture

### API Gateway Configuration

```nginx
upstream api_backend {
    least_conn;
    server api1.example.com:5000;
    server api2.example.com:5000;
    server api3.example.com:5000;
    
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

This comprehensive architecture documentation covers all aspects of the system design and is ready for production implementation.
