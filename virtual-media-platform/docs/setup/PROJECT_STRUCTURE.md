# Virtual Media Streaming, Collaboration & Learning Management System

## 📁 Complete Folder Structure

```
virtual-media-platform/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopNav.jsx
│   │   │   │   └── NavigationBar.jsx
│   │   │   ├── Media/
│   │   │   │   ├── VideoPlayer.jsx
│   │   │   │   ├── MusicPlayer.jsx
│   │   │   │   ├── MediaCard.jsx
│   │   │   │   └── MediaGrid.jsx
│   │   │   ├── Social/
│   │   │   │   ├── CommentSection.jsx
│   │   │   │   ├── LikeButton.jsx
│   │   │   │   └── ShareButton.jsx
│   │   │   ├── Collaboration/
│   │   │   │   ├── LiveQueue.jsx
│   │   │   │   ├── RoomManager.jsx
│   │   │   │   └── ParticipantList.jsx
│   │   │   ├── Learning/
│   │   │   │   ├── QuizCheckpoint.jsx
│   │   │   │   ├── ProgressTracker.jsx
│   │   │   │   └── CertificateViewer.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── AnalyticsDashboard.jsx
│   │   │   │   ├── AdminPanel.jsx
│   │   │   │   └── CreatorDashboard.jsx
│   │   │   ├── Discovery/
│   │   │   │   ├── MoodDiscovery.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── TrendingSection.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── Common/
│   │   │       ├── Modal.jsx
│   │   │       ├── Loading.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── Button.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Trending.jsx
│   │   │   ├── Watch.jsx
│   │   │   ├── Playlist.jsx
│   │   │   ├── Learning.jsx
│   │   │   ├── CollaborativeRoom.jsx
│   │   │   ├── CreatorStudio.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── MoodDiscovery.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useMedia.js
│   │   │   ├── useRoom.js
│   │   │   ├── useMood.js
│   │   │   └── useFetch.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── MediaContext.jsx
│   │   │   └── UserContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── mediaService.js
│   │   │   ├── roomService.js
│   │   │   └── analyticsService.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   ├── animations.css
│   │   │   └── components.css
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── multer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Creator.js
│   │   ├── Media.js
│   │   ├── Video.js
│   │   ├── Music.js
│   │   ├── Category.js
│   │   ├── Tag.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   ├── Subscription.js
│   │   ├── WatchHistory.js
│   │   ├── Notification.js
│   │   ├── Playlist.js
│   │   ├── PlaylistItem.js
│   │   ├── Room.js
│   │   ├── RoomParticipant.js
│   │   ├── LiveQueue.js
│   │   ├── QueueVote.js
│   │   ├── MoodTag.js
│   │   ├── MediaMood.js
│   │   ├── UserMoodPreference.js
│   │   ├── RecommendationScore.js
│   │   ├── Course.js
│   │   ├── VideoCheckpoint.js
│   │   ├── QuizQuestion.js
│   │   ├── QuizOption.js
│   │   ├── UserResponse.js
│   │   ├── LearningProgress.js
│   │   ├── Certificate.js
│   │   ├── PremiumPlan.js
│   │   ├── Payment.js
│   │   ├── Report.js
│   │   ├── Admin.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── creatorController.js
│   │   ├── mediaController.js
│   │   ├── commentController.js
│   │   ├── playlistController.js
│   │   ├── roomController.js
│   │   ├── recommendationController.js
│   │   ├── learningController.js
│   │   ├── analyticsController.js
│   │   ├── adminController.js
│   │   └── searchController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── mediaRoutes.js
│   │   ├── playlistRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── learningRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── adminRoutes.js
│   │   └── searchRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── multer.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── mediaService.js
│   │   ├── recommendationService.js
│   │   ├── analyticsService.js
│   │   ├── emailService.js
│   │   └── socketService.js
│   ├── sockets/
│   │   ├── roomSocket.js
│   │   └── notificationSocket.js
│   ├── aggregations/
│   │   ├── recommendationPipeline.js
│   │   ├── trendingPipeline.js
│   │   ├── analyticsPipeline.js
│   │   ├── searchPipeline.js
│   │   └── leaderboardPipeline.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── errorMessages.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── uploads/
│   │   ├── videos/
│   │   ├── music/
│   │   └── thumbnails/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── README.md
│
├── database/
│   ├── schemas/
│   │   └── allSchemas.js
│   ├── indexes/
│   │   └── createIndexes.js
│   ├── seedData/
│   │   ├── users.json
│   │   ├── media.json
│   │   ├── moods.json
│   │   ├── categories.json
│   │   └── seed.js
│   └── README.md
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── SETUP_GUIDE.md
│   └── FEATURES.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (v4.4+)
- npm or yarn
- Git

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd virtual-media-platform

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 2: Setup Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/virtual-media
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Start MongoDB

```bash
# Using local MongoDB
mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Seed Database (Optional)

```bash
cd backend
npm run seed
```

### Step 5: Start Development Servers

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Deployment

```bash
docker-compose up -d
```

---

## 📊 MongoDB Collections Overview

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| users | User accounts & profiles | _id, email, username, role, moodPreferences |
| creators | Creator profiles | _id, userId, channelName, subscribers, analytics |
| media | Base media documents | _id, type, title, creator, moodTags |
| videos | Video streaming content | _id, mediaId, duration, quality, checkpoints |
| music | Music streaming content | _id, mediaId, artist, album, duration |
| comments | User comments on media | _id, mediaId, userId, content, replies |
| likes | Like/dislike records | _id, userId, mediaId, type |
| watchHistory | Playback tracking | _id, userId, mediaId, progress, duration |
| playlists | User playlists | _id, userId, items, isPublic, description |
| rooms | Collaborative watch rooms | _id, creator, participants, currentQueue |
| liveQueues | Real-time media queues | _id, roomId, items, order |
| moodTags | Mood categories | _id, name, description, color |
| mediaMoods | Media mood associations | _id, mediaId, moodId, score |
| videoCheckpoints | Quiz locations in videos | _id, videoId, timestamp, quizId |
| certificates | Learning completion records | _id, userId, courseId, score, date |

---

## 🎯 Key Features Implemented

✅ Advanced authentication with JWT & role-based access control
✅ Real-time collaborative media queues with Socket.IO
✅ AI-powered mood-based recommendation engine
✅ Interactive educational video checkpoints with quizzes
✅ Advanced MongoDB aggregation pipelines for analytics
✅ Scalable media streaming architecture
✅ Premium subscription system
✅ Admin moderation tools
✅ Modern glassmorphic UI with animations
✅ Responsive design for all devices

---

## 🔧 Technology Stack

**Frontend:**
- React 18+ with Vite
- Tailwind CSS
- Framer Motion
- React Router v6
- Socket.IO Client
- Axios
- Recharts

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Multer for uploads
- Joi for validation

**Database:**
- MongoDB (NoSQL)
- Advanced indexing
- Aggregation pipelines
- Real-time synchronization

---

## 📈 Performance & Scalability

- Database connection pooling
- Indexed queries for fast searches
- Pagination for large datasets
- Real-time updates via WebSockets
- Modular architecture for horizontal scaling
- Optimized aggregation pipelines
- Caching strategies implemented

---

## 👨‍💼 Role-Based Features

**Users:**
- Stream media
- Create playlists
- Participate in collaborative rooms
- Complete learning courses
- Subscribe to creators
- Provide feedback (comments, likes)

**Creators:**
- Upload content
- Analytics dashboard
- Monetization options
- Manage subscribers
- Create educational checkpoints

**Admins:**
- Content moderation
- User management
- Analytics monitoring
- Report handling
- System configuration

---

## 🎨 UI/UX Highlights

- Dark glassmorphic theme
- Smooth Framer Motion animations
- Gradient accents
- Interactive hover effects
- Card-based layouts
- Responsive sidebar navigation
- Modern gradient backgrounds
- Real-time status indicators

---

## 📝 Next Steps

1. Review DATABASE_DESIGN.md for detailed schema information
2. Check API_DOCUMENTATION.md for endpoint specifications
3. Examine SETUP_GUIDE.md for detailed configuration
4. Run the application and explore all features
5. Customize branding and styling in Tailwind config
6. Deploy to production using Docker

---

## 📄 License

This project is provided for educational purposes.

---

## 🤝 Support

For detailed technical documentation, see the `/docs` folder.
