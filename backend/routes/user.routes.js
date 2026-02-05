const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const demoGuard = require('../middleware/demoGuard.middleware');

router.use(demoGuard); // Applichiamo il middleware demoGuard a tutte le rotte di questo router

// GET /api/users/me (rotta protetta dal middleware in app.js)
router.get('/me', async (req, res) => {
    try {
        const userId = req.user.userId;
        const userProfile = await userService.getUserProfile(userId);
        res.json(userProfile);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// POST /api/users/change-password - Per cambiare la password
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.user.userId, oldPassword, newPassword);
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// --- ROTTE SOLO PER ADMIN ---

// GET /api/users - per ottenere la lista filtrata
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.json(users);
  } catch (error) { res.status(500).json({ message: 'Error fetching users' }); }
});

// POST /api/users/admin - per creare un nuovo admin
router.post('/admin', async (req, res) => {
  try {
    const newAdminId = await userService.createAdmin(req.body);
    res.status(201).json({ id: newAdminId });
  } catch (error) { res.status(error.statusCode || 500).json({ message: error.message }); }
});

// PATCH /api/users/:id/status - per bloccare/sbloccare
router.patch('/:id/status', async (req, res) => {
  try {
    const success = await userService.updateUserStatus(req.params.id, req.body.isActive);
    if (success) res.json({ message: 'User status updated' });
    else res.status(404).json({ message: 'User not found' });
  } catch (error) { res.status(500).json({ message: 'Error updating user status' }); }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await userService.deleteUser(req.params.id);
    if (success) res.json({ message: 'User deleted' });
    else res.status(404).json({ message: 'User not found' });
  } catch (error) { res.status(500).json({ message: 'Error deleting user' }); }
});

module.exports = router;
