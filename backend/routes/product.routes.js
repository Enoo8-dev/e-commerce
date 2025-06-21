// Import the Express library to create a router
const express = require('express');
// Import the productService to use its functions
const productService = require('../services/productService');

// Create a new router instance
const router = express.Router();

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
