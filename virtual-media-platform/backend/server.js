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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
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
