const express = require('express');
const router = express.Router();

router.get('/overview', async (req, res) => {
  res.json({
    success: true,
    data: {
      totalViews: 125000,
      watchTimeHours: 4200,
      activeUsers: 850
    }
  });
});

module.exports = router;
