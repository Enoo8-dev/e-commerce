const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// POST /api/orders - Crea un nuovo ordine
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId; // ID utente dal token JWT
        const orderId = await orderService.createNewOrder(userId, req.body);
        res.status(201).json({ message: 'Order created successfully', orderId: orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
});

// GET /api/orders/addresses - Recupera gli indirizzi dell'utente
router.get('/addresses', async (req, res) => {
    try {
        const userId = req.user.userId;
        const addresses = await orderService.getUserAddresses(userId);
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve addresses.' });
    }
});

// POST /api/orders/addresses - Aggiunge un nuovo indirizzo per l'utente
router.post('/addresses', async (req, res) => {
    try {
        const userId = req.user.userId;
        const newAddressId = await orderService.addUserAddress(userId, req.body);
        res.status(201).json({ message: 'Address added successfully', addressId: newAddressId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add address.' });
    }
});

module.exports = router;