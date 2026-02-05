const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({ 
        message: 'User created successfully', 
        data: newUser 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
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

router.post('/demo-login', async (req, res) => {
    try {
        const { role } = req.body; // Ci aspettiamo { role: 'customer' } o { role: 'admin' }
        
        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Ruolo non valido per la demo.' });
        }
        
        const token = await authService.loginAsDemoUser(role);
        
        res.status(200).json({
            message: 'Demo login successful',
            token: token
        });
    } catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({ message: 'Errore creazione utente demo.' });
    }
});

module.exports = router;