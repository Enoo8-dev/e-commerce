const express = require('express');
const authService = require('../services/authService');
const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const newUser = await authService.registerUser(req.body);
        res.status(201).json({
            message: 'User registered successfully',
            data: newUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal server error'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal server error'
        });
        
    }
});

module.exports = router;