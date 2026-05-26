const express = require('express');
const router = express.Router();
const { Room, LiveQueue, Media } = require('../models');
const { authenticate } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get public rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create a new room
router.post('/', authenticate, async (req, res) => {
  try {
    const { roomName, description, isPrivate, roomCode, maxParticipants } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const room = new Room({
      creatorId: req.user._id,
      creatorName: req.user.username,
      roomName,
      description,
      isPrivate: isPrivate === true || isPrivate === 'true',
      roomCode: roomCode || null,
      maxParticipants: Number(maxParticipants) || 50,
      currentParticipants: [{
        userId: req.user._id,
        username: req.user.username,
        joinedAt: new Date(),
        role: 'host'
      }],
      participantCount: 1
    });

    await room.save();

    // Create associated LiveQueue
    const queue = new LiveQueue({
      roomId: room._id,
      items: [],
      totalItems: 0,
      totalDuration: 0,
      currentIndex: 0
    });
    await queue.save();

    res.status(201).json({ success: true, room, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get room details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const queue = await LiveQueue.findOne({ roomId: room._id });
    res.json({ success: true, room, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add media to room's queue
router.post('/:id/queue', authenticate, async (req, res) => {
  try {
    const { mediaId } = req.body;
    if (!mediaId) {
      return res.status(400).json({ success: false, message: 'Media ID is required' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const queue = await LiveQueue.findOne({ roomId: room._id });
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    // Check if item already in queue
    const exists = queue.items.some(item => item.mediaId.toString() === mediaId);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Item already in queue' });
    }

    const newItem = {
      queueItemId: new mongoose.Types.ObjectId(),
      mediaId: media._id,
      mediaTitle: media.title,
      creatorName: media.creatorName || 'Unknown Creator',
      thumbnail: media.thumbnailUrl,
      duration: media.duration || 0,
      addedByUserId: req.user._id,
      addedByUsername: req.user.username,
      addedAt: new Date(),
      votes: 0,
      isPlaying: false
    };

    queue.items.push(newItem);
    queue.totalItems = queue.items.length;
    queue.totalDuration = queue.items.reduce((total, item) => total + item.duration, 0);
    await queue.save();

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Vote on item in queue
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { queueItemId, voteType } = req.body; // 'upvote' or 'downvote'
    if (!queueItemId || !voteType) {
      return res.status(400).json({ success: false, message: 'Queue Item ID and Vote Type are required' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const queue = await LiveQueue.findOne({ roomId: room._id });
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const item = queue.items.find(i => i.queueItemId.toString() === queueItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Queue item not found' });
    }

    if (voteType === 'upvote') {
      item.votes += 1;
    } else if (voteType === 'downvote') {
      item.votes = Math.max(0, item.votes - 1);
    }

    // Sort items by vote count descending
    queue.items.sort((a, b) => b.votes - a.votes);
    
    await queue.save();

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
