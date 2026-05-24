# Complete Setup & Implementation Guide
# Virtual Media Streaming, Collaboration & Learning Management System

---

## 📋 Table of Contents

1. Prerequisites
2. MongoDB Setup
3. Backend Setup
4. Frontend Setup
5. Database Seeding
6. Running the Application
7. Testing the Features
8. Deployment Guide

---

## 1. PREREQUISITES

### System Requirements
- **Node.js**: v16.x or higher
- **npm/yarn**: Latest version
- **MongoDB**: v4.4 or higher (local or cloud)
- **Git**: For version control
- **Postman**: For API testing (optional)

### Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Install nvm (Node Version Manager) if needed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use Node.js 18
nvm use 18
```

---

## 2. MONGODB SETUP

### Option A: Local MongoDB Installation

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
mongo # Connect to MongoDB
```

**Windows:**
```
Download from: https://www.mongodb.com/try/download/community
Run installer
Add to PATH: C:\Program Files\MongoDB\Server\<version>\bin
Start MongoDB: mongod
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
mongo # Connect
```

### Option B: MongoDB Atlas (Cloud)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update `.env` with connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/databasename?retryWrites=true&w=majority
```

### Test MongoDB Connection

```bash
# Open MongoDB shell
mongo

# Create database
use virtual-media

# Create collections
db.createCollection("users")

# Insert test document
db.users.insertOne({ name: "Test User", email: "test@example.com" })

# Query
db.users.find()
```

---

## 3. BACKEND SETUP

### Step 1: Clone & Initialize

```bash
# Create project directory
mkdir virtual-media-platform
cd virtual-media-platform

# Create backend directory
mkdir backend
cd backend

# Initialize Node project
npm init -y

# or use TypeScript
npm create vite@latest . -- --template node
```

### Step 2: Install Dependencies

```bash
npm install \
  express \
  mongoose \
  bcryptjs \
  jsonwebtoken \
  dotenv \
  cors \
  multer \
  socket.io \
  joi \
  express-validator \
  cloudinary \
  nodemailer \
  compression \
  helmet \
  express-rate-limit \
  morgan
```

### Step 3: Install Dev Dependencies

```bash
npm install --save-dev \
  nodemon \
  @types/node \
  @types/express
```

### Step 4: Create .env File

Create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/virtual-media
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-media

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://your-domain.com

# File Upload
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=5242880000

# Cloudinary (Optional - for media CDN)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@virtualmedia.com

# AWS (Optional)
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXX
```

### Step 5: Create Backend Structure

```bash
mkdir -p config models controllers routes middleware services sockets aggregations utils uploads/{videos,music,thumbnails}

# Create main server file
touch server.js
```

### Step 6: Server Configuration (server.js)

```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50,
  minPoolSize: 10
})
.then(() => console.log('✓ MongoDB Connected'))
.catch(err => console.error('✗ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  // Room events
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('userJoined', { userId: socket.id });
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    io.to(roomId).emit('userLeft', { userId: socket.id });
  });

  // Queue events
  socket.on('addToQueue', (data) => {
    io.to(data.roomId).emit('queueUpdated', data);
  });

  socket.on('voteMedia', (data) => {
    io.to(data.roomId).emit('voteUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Socket.IO listening on http://localhost:${PORT}/socket.io`);
});

module.exports = { app, io };
```

### Step 7: Update package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node database/seed.js",
    "test": "jest",
    "migrate": "node scripts/migrate.js"
  }
}
```

---

## 4. FRONTEND SETUP

### Step 1: Create React Project

```bash
cd ..

# Using Vite (Recommended)
npm create vite@latest frontend -- --template react

# Navigate to frontend
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install \
  react-router-dom \
  axios \
  socket.io-client \
  framer-motion \
  tailwindcss \
  postcss \
  autoprefixer \
  lucide-react \
  recharts \
  zustand \
  react-hot-toast

npm install --save-dev \
  @tailwindcss/forms \
  @tailwindcss/typography
```

### Step 3: Configure Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gradient-start': '#0f172a',
        'gradient-end': '#7c3aed',
      },
      fontFamily: {
        'display': ['Inter Tight', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Step 4: Create .env.local

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ENVIRONMENT=development
```

### Step 5: Project Structure

```bash
mkdir -p src/{components,pages,hooks,context,services,styles,utils}

# Create main files
touch src/App.jsx src/main.jsx
```

### Step 6: Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

---

## 5. DATABASE SEEDING

### Create Seed Data File

```javascript
// backend/database/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { 
  User, Creator, Media, MoodTag, Category, 
  PremiumPlan, Course 
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
      MoodTag.deleteMany({}),
      Category.deleteMany({})
    ]);
    console.log('✓ Cleared existing collections');

    // Seed Mood Tags
    const moods = await MoodTag.insertMany([
      {
        name: 'Relaxing',
        description: 'Calm and peaceful content',
        color: '#3b82f6',
        icon: '😴',
        vibeCategory: 'chill'
      },
      {
        name: 'Focus',
        description: 'Content to help you concentrate',
        color: '#8b5cf6',
        icon: '🎯',
        vibeCategory: 'productive'
      },
      {
        name: 'Workout',
        description: 'High energy content for exercise',
        color: '#ef4444',
        icon: '💪',
        vibeCategory: 'energetic'
      },
      {
        name: 'Study',
        description: 'Educational and learning content',
        color: '#10b981',
        icon: '📚',
        vibeCategory: 'educational'
      },
      {
        name: 'Emotional',
        description: 'Deep and meaningful content',
        color: '#ec4899',
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

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### Run Seeding

```bash
cd backend
npm run seed
```

---

## 6. RUNNING THE APPLICATION

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
# Output: 🚀 Server running on http://localhost:5000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
# Output: VITE v4.x.x ready in xxx ms
#         ➜  Local:   http://localhost:5173/
```

### Verify Both Running

```bash
# Test backend
curl http://localhost:5000/api/health

# Test frontend
open http://localhost:5173
```

---

## 7. TESTING THE FEATURES

### API Testing with Curl

```bash
# User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Trending Media
curl http://localhost:5000/api/media/trending

# Get Personalized Recommendations
curl -X GET http://localhost:5000/api/recommendations/personalized \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search by Mood
curl "http://localhost:5000/api/search?query=relax&mood=relaxing"
```

### Frontend Testing

1. **Authentication**
   - Navigate to login page
   - Register new account
   - Verify email confirmation

2. **Media Streaming**
   - Click on media card
   - Play video/music
   - Like/dislike functionality
   - Add comments

3. **Mood Discovery**
   - Click mood buttons on home
   - Verify filtered results
   - Check trending by mood

4. **Collaborative Rooms**
   - Create new room
   - Invite participants (copy room code)
   - Add media to queue
   - Vote on queue items
   - Real-time sync

5. **Learning**
   - Enroll in course
   - Watch checkpoint video
   - Complete quiz
   - View progress

6. **Creator Features**
   - Upload media
   - Add mood tags
   - Edit metadata
   - View analytics

---

## 8. DEPLOYMENT GUIDE

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongo_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Update API URL in environment
vercel env add VITE_API_URL
# Enter: https://your-backend.herokuapp.com
```

### Docker Deployment

```dockerfile
# backend/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://mongodb:27017/virtual-media

  frontend:
    build: ./frontend
    ports:
      - "80:5173"
    depends_on:
      - backend

volumes:
  mongo_data:
```

```bash
# Run with Docker Compose
docker-compose up -d
```

---

## 📊 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Implement Redis caching for frequently accessed data
- Use aggregation pipelines for complex queries
- Implement rate limiting
- Connection pooling in MongoDB

### Frontend Optimization
- Code splitting with React.lazy
- Image optimization
- Service workers for offline support
- Lazy loading for media
- Debouncing/throttling for API calls

### Database Optimization
- Create appropriate indexes
- Use covered queries
- Monitor slow queries
- Regular cleanup of old data
- Sharding for very large collections

---

## 🔒 Security Checklist

- [ ] Set strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Validate all user inputs
- [ ] Use CORS properly
- [ ] Sanitize data
- [ ] Hash passwords with bcrypt
- [ ] Implement rate limiting
- [ ] Use environment variables
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Connect directly
mongo
use virtual-media
db.users.find().limit(1)
```

### Port Already in Use
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors
- Verify FRONTEND_URL in .env
- Check Socket.IO CORS configuration
- Restart backend

### Module Not Found
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

This setup guide covers everything needed to get your application running. For production deployment, ensure all security measures are in place and consider hiring DevOps expertise.
