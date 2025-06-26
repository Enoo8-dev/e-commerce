const express = require('express');
const productService = require('../services/productService');

// Creiamo due router separati con nomi descrittivi
const publicRouter = express.Router();
const adminRouter = express.Router();

// --- ROTTE PUBBLICHE (associate a publicRouter) ---

// GET /api/products/featured
publicRouter.get('/products/featured', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const limit = parseInt(req.query.limit, 10) || 8;
        const products = await productService.getFeaturedProducts(languageCode, limit);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching featured products' });
    }
});

// GET /api/products/offers
publicRouter.get('/products/offers', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const limit = parseInt(req.query.limit, 10) || 4;
        const products = await productService.getLatestOffers(languageCode, limit);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching latest offers' });
    }
});

// GET /api/products/newest
publicRouter.get('/products/newest', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const limit = parseInt(req.query.limit, 10) || 8;
        const products = await productService.getNewestProducts(languageCode, limit);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching newest products' });
    }
});

// GET /api/products/:id
publicRouter.get('/products/:id', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const productId = req.params.id;
        const product = await productService.getProductById(productId, languageCode);
        res.status(200).json(product);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// GET /api/products
publicRouter.get('/products', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const products = await productService.getAllProducts(languageCode);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});


// --- ROTTE ADMIN (associate ad adminRouter) ---
// GET /api/admin/products
adminRouter.get('/products', async (req, res) => {
    try {
      const options = {
        lang: req.query.lang || 'en-US',
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        status: req.query.status
      };
      const products = await productService.getAdminProductList(options);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product list for admin' });
    }
});

// PATCH /api/admin/variants/:variantId/status
adminRouter.patch('/variants/:variantId/status', async (req, res) => {
  try {
    const { variantId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid "isActive" value.' });
    }

    const success = await productService.updateVariantStatus(variantId, isActive);
    if (success) {
      res.status(200).json({ message: 'Variant status updated successfully.' });
    } else {
      res.status(404).json({ message: 'Variant not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating variant status' });
  }
});

// Esportiamo entrambi i router con i nomi corretti
module.exports = { publicRouter, adminRouter };