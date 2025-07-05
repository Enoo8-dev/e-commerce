const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// GET /api/payment-methods
router.get('/', async (req, res) => {
  try {
    const methods = await paymentService.getUserPaymentMethods(req.user.userId);
    res.json(methods);
  } catch (error) { res.status(500).json({ message: 'Error fetching payment methods' }); }
});

// POST /api/payment-methods
router.post('/', async (req, res) => {
  try {
    const newMethodId = await paymentService.addUserPaymentMethod(req.user.userId, req.body);
    res.status(201).json({ id: newMethodId });
  } catch (error) { res.status(500).json({ message: 'Error adding payment method' }); }
});

// PUT /api/payment-methods/:id
router.put('/:id', async (req, res) => {
  try {
    const success = await paymentService.updateUserPaymentMethod(req.params.id, req.user.userId, req.body);
    if (success) res.json({ message: 'Payment method updated' });
    else res.status(404).json({ message: 'Payment method not found' });
  } catch (error) { res.status(500).json({ message: 'Error updating payment method' }); }
});

// DELETE /api/payment-methods/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await paymentService.deleteUserPaymentMethod(req.params.id, req.user.userId);
    if (success) res.json({ message: 'Payment method deleted' });
    else res.status(404).json({ message: 'Payment method not found' });
  } catch (error) { res.status(500).json({ message: 'Error deleting payment method' }); }
});

// UPDATE /api/payment-methods/:id/default
router.patch('/:id/default', async (req, res) => {
  try {
    const success = await paymentService.setDefaultUserPaymentMethod(req.user.userId, req.params.id);
    if (success) res.json({ message: 'Default payment method set' });
    else res.status(404).json({ message: 'Payment method not found' });
  } catch (error) { res.status(500).json({ message: 'Error setting default payment method' }); }
});

module.exports = router;