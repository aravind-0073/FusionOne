const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { User, WatchHistory, Creator } = require('../models');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { email, username, firstName, lastName, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username already in use' });
      }
      user.username = username;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get watch history
router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await WatchHistory.find({ userId: req.user.id })
      .populate('mediaId')
      .sort({ watchedAt: -1 })
      .limit(50);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Subscribe to a creator
router.post('/subscribe/:creatorId', authenticate, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user.id;

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    if (creator.subscribers.includes(userId)) {
      // Unsubscribe
      await Creator.findByIdAndUpdate(creatorId, {
        $pull: { subscribers: userId },
        $inc: { subscriberCount: -1 }
      });
      return res.json({ success: true, message: 'Unsubscribed successfully' });
    } else {
      // Subscribe
      await Creator.findByIdAndUpdate(creatorId, {
        $push: { subscribers: userId },
        $inc: { subscriberCount: 1 }
      });
      return res.json({ success: true, message: 'Subscribed successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
