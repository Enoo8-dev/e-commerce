const express = require('express');
const router = express.Router();
const addressService = require('../services/addressService');

// GET /api/addresses 
router.get('/', async (req, res) => {
  try {
    const addresses = await addressService.getUserAddresses(req.user.userId);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// POST /api/addresses 
router.post('/', async (req, res) => {
  try {
    const newAddressId = await addressService.addUserAddress(req.user.userId, req.body);
    res.status(201).json({ id: newAddressId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating address' });
  }
});

// PUT /api/addresses/:id
router.put('/:id', async (req, res) => {
  try {
    const success = await addressService.updateUserAddress(req.params.id, req.user.userId, req.body);
    if (success) res.json({ message: 'Address updated' });
    else res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await addressService.deleteUserAddress(req.params.id, req.user.userId);
    if (success) res.json({ message: 'Address deleted' });
    else res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
});

// PATCH /api/addresses/:id/default 
router.patch('/:id/default', async (req, res) => {
  try {
    const success = await addressService.setDefaultUserAddress(req.user.userId, req.params.id);
    if (success) res.json({ message: 'Default address set' });
    else res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error setting default address' });
  }
});

module.exports = router;