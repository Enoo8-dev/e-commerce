const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authenticateToken = require('../middleware/auth.middleware');

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // Get the user ID from the authenticated token
        const userProfile = await userService.getUserProfile(userId);
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal server error'
        });
    }
});

// Export the router so it can be used in other files
module.exports = router;