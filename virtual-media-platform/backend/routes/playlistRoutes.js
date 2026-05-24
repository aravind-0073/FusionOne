const express = require('express');
const router = express.Router();
const { Playlist } = require('../models');

router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true });
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
