// Import the Express library to create a router
const express = require('express');
// Import the productService to use its functions
const productService = require('../services/productService');

// Create a new router instance
const router = express.Router();

router.get('/products/newest', async (req, res) => {
  try {
    const languageCode = req.query.lang || 'en-US';
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await productService.getNewestProducts(languageCode, limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching newest products' });
  }
});

router.get('/products/offers', async (req, res) => {
  try {
    const languageCode = req.query.lang || 'en-US';
    const limit = parseInt(req.query.limit, 10) || 4;
    const products = await productService.getLatestOffers(languageCode, limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest offers' });
  }
});

router.get('/products/featured', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const limit = parseInt(req.query.limit, 10) || 9; // Default to 9 if not specified
        const products = await productService.getFeaturedProducts(languageCode, limit);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error in featured products route:', error);
        res.status(500).json({ message: 'Error fetching featured products' });
    }
});

router.get('/products/:id', async (req, res) => {
  try {
    const languageCode = req.query.lang || 'en-US';
    const productId = req.params.id;
    const product = await productService.getProductById(productId, languageCode);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Define the route for GET /api/products
router.get('/products', async (req, res) => {
    try {
        // We can get the desired language from a query parameter, e.g., /api/products?lang=it-IT
        // We'll provide a default value ('en-US') if it's not specified.
        const languageCode = req.query.lang || 'en-US';

        // Call the service layer to get the products
        const products = await productService.getAllProducts(languageCode);

        // If successful, send the products back to the client with a 200 OK status
        res.status(200).json(products);

    } catch (error) {
        // If any error occurs in the service or DAO layer, it will be caught here.
        // We send a generic 500 Internal Server Error status and a message.
        console.error('Error in product route:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// ... other routes for products (e.g., GET /products/:id) will be added here.

// Export the router so it can be used in the main app.js file
module.exports = router;
