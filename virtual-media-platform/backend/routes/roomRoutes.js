const express = require('express');
const router = express.Router();
const { Room } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
