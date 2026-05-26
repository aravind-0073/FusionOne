require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const SocketService = require('./services/socketService');


const app = express();
const server = http.createServer(app);

// Setup Allowed Origins for CORS (removes trailing slashes dynamically)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.some(allowed => cleanOrigin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.some(allowed => cleanOrigin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier development/testing of media streams
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10
})
.then(() => console.log('✓ MongoDB Connected'))
.catch(err => console.error('✗ MongoDB Error:', err));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', dbState: mongoose.connection.readyState });
});

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
  socket.on('joinRoom', async ({ roomId, userId, username }) => {
    socket.roomId = roomId;
    socket.userId = userId;
    await SocketService.handleRoomJoin(io, socket, { roomId, userId, username });
  });

  socket.on('leaveRoom', async ({ roomId, userId }) => {
    await SocketService.handleRoomLeave(io, socket, { roomId, userId });
    socket.roomId = null;
    socket.userId = null;
  });

  // Queue events
  socket.on('addToQueue', async ({ roomId, items }) => {
    await SocketService.handleQueueUpdate(io, socket, { roomId, items });
  });

  socket.on('voteMedia', async ({ roomId, queueItemId, userId, voteType }) => {
    await SocketService.handleVote(io, socket, { roomId, queueItemId, userId, voteType });
  });

  // Chat message event
  socket.on('sendMessage', async ({ roomId, userId, username, message }) => {
    await SocketService.handleMessage(io, socket, { roomId, userId, username, message });
  });

  // Playback synchronization events
  socket.on('syncPlay', ({ roomId, mediaId, title, position }) => {
    io.to(roomId).emit('playbackPlay', { mediaId, title, position, timestamp: Date.now() });
  });

  socket.on('syncPause', ({ roomId, position }) => {
    io.to(roomId).emit('playbackPause', { position, timestamp: Date.now() });
  });

  socket.on('syncSeek', ({ roomId, position }) => {
    io.to(roomId).emit('playbackSeek', { position, timestamp: Date.now() });
  });

  socket.on('disconnect', async () => {
    if (socket.roomId && socket.userId) {
      console.log(`Auto-cleaning room session for user ${socket.userId} in room ${socket.roomId}`);
      await SocketService.handleRoomLeave(io, socket, { roomId: socket.roomId, userId: socket.userId });
    }
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
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
