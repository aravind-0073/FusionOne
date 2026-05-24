# API Documentation & Testing Guide
# Virtual Media Streaming Platform

---

## 📋 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.virtualmedia.com/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "username": "newuser",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "username",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  }
}
```

### 3. Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  }
}
```

### 4. Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📱 User Endpoints

### 1. Get User Profile
```http
GET /users/profile
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "url_to_image",
    "bio": "User bio",
    "role": "user",
    "isPremium": false,
    "premiumExpiresAt": null,
    "followCount": 5,
    "followerCount": 10,
    "totalWatchTime": 3600,
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

### 2. Update User Profile
```http
PUT /users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Updated bio",
  "profilePicture": "url_to_new_image"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### 3. Get Watch History
```http
GET /users/watch-history?skip=0&limit=20
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "total": 150,
  "count": 20,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mediaId": "507f1f77bcf86cd799439012",
      "title": "Video Title",
      "thumbnail": "url",
      "progress": 1200,
      "duration": 3600,
      "watchPercentage": 33.33,
      "watchedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 4. Get Notifications
```http
GET /users/notifications?skip=0&limit=20
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "unreadCount": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "new_upload",
      "title": "New Video from Creator",
      "description": "Creator uploaded new video",
      "read": false,
      "actionUrl": "/watch/507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🎬 Media Endpoints

### 1. Upload Media
```http
POST /media/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- title: "Amazing Video"
- type: "video"
- description: "Video description"
- category: "507f1f77bcf86cd799439011"
- duration: 3600
- moodTags: '[{"moodId":"...", "moodName":"Relaxing"}]'
- video: <file>
- thumbnail: <file>

Response:
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "mediaId": "507f1f77bcf86cd799439011",
    "title": "Amazing Video",
    "status": "processing",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Get Media by ID
```http
GET /media/507f1f77bcf86cd799439011
Authorization: Bearer <jwt_token> (optional)

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Video Title",
    "description": "Video description",
    "creatorName": "Creator Name",
    "creatorId": "507f1f77bcf86cd799439012",
    "type": "video",
    "duration": 3600,
    "views": 1500,
    "likes": 250,
    "dislikes": 10,
    "commentCount": 45,
    "shareCount": 30,
    "moodTags": [
      {
        "moodId": "507f1f77bcf86cd799439013",
        "moodName": "Relaxing",
        "score": 0.85
      }
    ],
    "userLikeStatus": "like",
    "userWatchProgress": 1800,
    "publishedAt": "2024-01-10T10:00:00Z"
  },
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439015",
      "username": "commenter",
      "content": "Great video!",
      "likes": 5,
      "replyCount": 2,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. Search Media
```http
GET /media/search?query=relaxation&type=video&mood=relaxing&limit=20
Authorization: Bearer <jwt_token> (optional)

Response:
{
  "success": true,
  "total": 250,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Relaxation Video",
      "creatorName": "Creator",
      "views": 5000,
      "moodTags": [{ "moodName": "Relaxing" }]
    }
  ]
}
```

### 4. Like/Dislike Media
```http
POST /media/507f1f77bcf86cd799439011/like
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "like"  // or "dislike"
}

Response:
{
  "success": true,
  "message": "Media liked successfully"
}
```

### 5. Get Trending Media
```http
GET /media/trending?moodId=507f1f77bcf86cd799439011&limit=20

Response:
{
  "success": true,
  "trending": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Trending Video",
      "views": 15000,
      "likes": 1200,
      "trendingScore": 85.5
    }
  ]
}
```

---

## 💬 Comment Endpoints

### 1. Add Comment
```http
POST /comments/media/507f1f77bcf86cd799439011
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "This is a great video!",
  "timestamp": 120  // optional, in seconds
}

Response:
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "commentId": "507f1f77bcf86cd799439014",
    "content": "This is a great video!",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Reply to Comment
```http
POST /comments/507f1f77bcf86cd799439014/reply
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Thanks for the reply!"
}

Response:
{
  "success": true,
  "message": "Reply added successfully"
}
```

### 3. Get Comments
```http
GET /comments/media/507f1f77bcf86cd799439011?skip=0&limit=20

Response:
{
  "success": true,
  "total": 45,
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "username": "commenter",
      "content": "Great video!",
      "likes": 5,
      "replies": [
        {
          "username": "creator",
          "content": "Thanks!",
          "createdAt": "2024-01-15T10:05:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 👥 Collaborative Room Endpoints

### 1. Create Room
```http
POST /rooms
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "roomName": "Movie Night with Friends",
  "description": "Watching movies together",
  "isPrivate": true,
  "maxParticipants": 10
}

Response:
{
  "success": true,
  "data": {
    "roomId": "507f1f77bcf86cd799439011",
    "roomName": "Movie Night with Friends",
    "roomCode": "ABC123XYZ",
    "creatorId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Join Room
```http
POST /rooms/507f1f77bcf86cd799439011/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "roomCode": "ABC123XYZ"  // required if private
}

Response:
{
  "success": true,
  "message": "Joined room successfully"
}
```

### 3. Get Room Details
```http
GET /rooms/507f1f77bcf86cd799439011
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "roomId": "507f1f77bcf86cd799439011",
    "roomName": "Movie Night",
    "creatorName": "Creator",
    "participantCount": 5,
    "currentParticipants": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "username": "user1",
        "role": "host"
      }
    ],
    "currentlyPlayingId": "507f1f77bcf86cd799439013",
    "currentlyPlayingTitle": "Movie Title",
    "playbackPosition": 1200,
    "isPlaying": true,
    "syncedPlayback": true
  }
}
```

### 4. Add to Queue
```http
POST /rooms/507f1f77bcf86cd799439011/queue
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "mediaId": "507f1f77bcf86cd799439013"
}

Response:
{
  "success": true,
  "message": "Added to queue",
  "data": {
    "queueItemId": "507f1f77bcf86cd799439014",
    "position": 3
  }
}
```

### 5. Vote on Queue Item
```http
POST /rooms/507f1f77bcf86cd799439011/vote
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "queueItemId": "507f1f77bcf86cd799439014",
  "voteType": "upvote"  // or "downvote"
}

Response:
{
  "success": true,
  "message": "Vote recorded",
  "data": {
    "currentVotes": 5
  }
}
```

---

## 📚 Learning Endpoints

### 1. Get Courses
```http
GET /courses?skip=0&limit=20&category=programming&level=beginner

Response:
{
  "success": true,
  "total": 150,
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Python Basics",
      "creatorName": "Creator",
      "level": "beginner",
      "videoCount": 24,
      "enrollmentCount": 5000,
      "completionCount": 1500,
      "averageRating": 4.5,
      "certificateEligible": true,
      "price": 0
    }
  ]
}
```

### 2. Enroll in Course
```http
POST /courses/507f1f77bcf86cd799439011/enroll
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Enrolled successfully",
  "data": {
    "enrollmentId": "507f1f77bcf86cd799439012",
    "courseId": "507f1f77bcf86cd799439011",
    "enrollmentDate": "2024-01-15T10:00:00Z"
  }
}
```

### 3. Get Course Progress
```http
GET /courses/507f1f77bcf86cd799439011/progress
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "courseName": "Python Basics",
    "completedVideos": 12,
    "totalVideos": 24,
    "progressPercentage": 50,
    "quizzesCompleted": 5,
    "totalQuizzes": 6,
    "averageQuizScore": 85,
    "certificateEarned": false,
    "lastActivityAt": "2024-01-15T10:00:00Z"
  }
}
```

### 4. Submit Quiz
```http
POST /courses/507f1f77bcf86cd799439011/quiz-submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "checkpointId": "507f1f77bcf86cd799439012",
  "responses": [
    {
      "questionId": "507f1f77bcf86cd799439013",
      "selectedOptionId": "507f1f77bcf86cd799439014"
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "score": 85,
    "totalPoints": 100,
    "passed": true,
    "explanation": "Great job!"
  }
}
```

### 5. Get Certificate
```http
GET /courses/507f1f77bcf86cd799439011/certificate
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "certificateId": "507f1f77bcf86cd799439012",
    "certificateNumber": "CERT-2024-001",
    "courseName": "Python Basics",
    "creatorName": "Creator",
    "earnedAt": "2024-01-15T10:00:00Z",
    "finalScore": 85,
    "certificateUrl": "https://certificates.virtualmedia.com/verify/CERT-2024-001",
    "verificationUrl": "https://virtualmedia.com/verify?cert=CERT-2024-001"
  }
}
```

---

## 📊 Recommendation Endpoints

### 1. Get Personalized Recommendations
```http
GET /recommendations/personalized?limit=20
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Video Title",
      "creatorName": "Creator",
      "views": 5000,
      "recommendationScore": 0.92,
      "moodMatchScore": 0.95,
      "reason": "Based on your mood preferences"
    }
  ]
}
```

### 2. Get Trending by Mood
```http
GET /recommendations/trending?moodId=507f1f77bcf86cd799439011&limit=15

Response:
{
  "success": true,
  "trending": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Trending Video",
      "moodName": "Relaxing",
      "trendingScore": 0.88
    }
  ]
}
```

### 3. Advanced Search
```http
GET /recommendations/search?query=meditation&moods=relaxing,focus&category=wellness&limit=20

Response:
{
  "success": true,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Meditation Session",
      "relevanceScore": 0.95
    }
  ]
}
```

---

## 📈 Analytics Endpoints

### 1. Creator Analytics
```http
GET /analytics/creator?days=30
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "totalViews": 15000,
    "totalEngagement": 2500,
    "engagement30Days": 850,
    "views30Days": 5000,
    "avgViewsPerMedia": 625,
    "topPerformingMedia": [
      {
        "mediaId": "507f1f77bcf86cd799439011",
        "title": "Top Video",
        "views": 2000
      }
    ]
  }
}
```

### 2. Platform Analytics (Admin)
```http
GET /analytics/platform
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "totalUsers": 50000,
    "activeUsers": 12000,
    "totalMedia": 150000,
    "totalViews": 5000000,
    "avgEngagementRate": 0.15,
    "topCreators": [
      {
        "creatorName": "Top Creator",
        "views": 500000
      }
    ]
  }
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Get trending media
curl http://localhost:5000/api/media/trending?limit=10

# Get user profile (with token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/users/profile
```

### Using Postman

1. **Import Collection**: Use the provided Postman collection
2. **Set Variables**:
   - `{{base_url}}`: http://localhost:5000/api
   - `{{token}}`: Your JWT token
   - `{{userId}}`: Your user ID
3. **Run Requests**: Execute endpoints in order

### Using Insomnia

1. Create new workspace
2. Set environment variables
3. Import API requests
4. Execute with authentication headers

---

## 🔄 Real-Time Events (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Room Events

**Join Room:**
```javascript
socket.emit('joinRoom', { roomId: '...' });

socket.on('userJoined', (data) => {
  console.log(data.username + ' joined');
});
```

**Add to Queue:**
```javascript
socket.emit('addToQueue', {
  roomId: '...',
  mediaId: '...'
});

socket.on('queueUpdated', (queue) => {
  console.log('Queue updated:', queue.items);
});
```

**Vote:**
```javascript
socket.emit('voteMedia', {
  roomId: '...',
  queueItemId: '...',
  voteType: 'upvote'
});

socket.on('voteUpdated', (queue) => {
  console.log('Votes updated');
});
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📋 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 204 | No Content - Success, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

This API documentation covers all major endpoints with examples and testing strategies.
