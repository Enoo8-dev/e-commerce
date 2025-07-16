const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');

router.get('/stats', async (req, res) => {
  try {
    const lang = req.query.lang || 'en-US';
    const data = await dashboardService.getDashboardData(lang);
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;