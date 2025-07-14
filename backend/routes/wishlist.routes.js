const express = require('express');
const router = express.Router();
const wishlistService = require('../services/wishlistService');

// GET /api/wishlist - Recupera la wishlist dell'utente
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'en-US';
    const wishlist = await wishlistService.getUserWishlist(req.user.userId, lang);
    res.json(wishlist);
  } catch (error) { res.status(500).json({ message: 'Error fetching wishlist' }); }
});

// POST /api/wishlist - Aggiunge un articolo alla wishlist
router.post('/', async (req, res) => {
  try {
    const { variantId } = req.body;
    await wishlistService.addToWishlist(req.user.userId, variantId);
    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (error) { res.status(500).json({ message: 'Error adding to wishlist' }); }
});

// DELETE /api/wishlist/:variantId - Rimuove un articolo dalla wishlist
router.delete('/:variantId', async (req, res) => {
  try {
    await wishlistService.removeFromWishlist(req.user.userId, req.params.variantId);
    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) { res.status(500).json({ message: 'Error removing from wishlist' }); }
});

module.exports = router;