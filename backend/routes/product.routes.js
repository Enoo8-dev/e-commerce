const express = require('express');
const productService = require('../services/productService');

// Creiamo due router separati con nomi descrittivi
const publicRouter = express.Router();
const adminRouter = express.Router();

// --- ROTTE PUBBLICHE (associate a publicRouter) ---

// GET /api/products/offers-layout
publicRouter.get('/products/offers-layout', async (req, res) => {
  try {
    const lang = req.query.lang || 'en-US';
    const layoutData = await productService.getOffersPageLayout(lang);
    res.json(layoutData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers page layout' });
  }
});

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

// POST /api/products/validate-cart
publicRouter.post('/products/validate-cart', async (req, res) => {
  try {
    const { variantIds } = req.body;
    const lang = req.query.lang || 'en-US';
    if (!Array.isArray(variantIds)) {
      return res.status(400).json({ message: 'variantIds must be an array.' });
    }
    const freshData = await productService.validateCartItems(variantIds, lang);
    res.json(freshData);
  } catch (error) {
    res.status(500).json({ message: 'Error validating cart items.', error: error.message });
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

// POST /api/admin/products
// create new product
adminRouter.post('/products', async (req, res) => {
  try {
    const newProductIds = await productService.createProduct(req.body);
    res.status(201).json(newProductIds);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// GET /api/admin/brands
adminRouter.get('/brands', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const brands = await productService.getAllBrands(languageCode);
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands' });
    }
});

// GET /api/admin/attributes
adminRouter.get('/attributes', async (req, res) => {
  try {
    const languageCode = req.query.lang || 'en-US';
    const attributes = await productService.getAttributesForForm(languageCode);
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attributes' });
  }
});

// GET /api/admin/categories
adminRouter.get('/categories', async (req, res) => {
    try {
        const languageCode = req.query.lang || 'en-US';
        const categories = await productService.getAllCategories(languageCode);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
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

// GET /api/admin/products/:productId
adminRouter.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const languageCode = req.query.lang || 'en-US';
    const product = await productService.getAdminProductDetails(productId, languageCode);
    res.json(product);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// PUT /api/admin/products/:productId
adminRouter.put('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const success = await productService.updateProduct(productId, req.body);
    if (success) {
      res.json({ message: 'Product updated successfully' });
    } else {
      res.status(404).json({ message: 'Product not found or update failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Esportiamo entrambi i router con i nomi corretti
module.exports = { publicRouter, adminRouter };