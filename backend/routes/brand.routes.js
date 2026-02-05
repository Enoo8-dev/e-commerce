const express = require('express');
const multer = require('multer');
const path = require('path');
const brandService = require('../services/brandService');
const demoGuard = require('../middleware/demoGuard.middleware');


const router = express.Router();
router.use(demoGuard); // Applichiamo il middleware demoGuard a tutte le rotte di questo router

const storage = multer.diskStorage({
  destination: './public/images/logos',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'brand-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/admin/brands
router.get('/', 
  // Middleware per disabilitare la cache solo per questa rotta
  (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  },
  async (req, res) => {
    try {
      const options = {
        languageCode: req.query.languageCode || 'en-US',
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      const brands = await brandService.getAllBrands(options);
      res.json(brands);
    } catch (error) { res.status(500).json({ message: 'Error fetching brands' }); }
});

// GET /api/admin/brands/:id
router.get('/:id', async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    res.json(brand);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// POST /api/admin/brands
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const logoPath = req.file ? `/images/logos/${req.file.filename}` : null;
    const newBrand = await brandService.createBrand(req.body, logoPath);
    res.status(201).json(newBrand);
  } catch (error) { res.status(500).json({ message: 'Error creating brand' }); }
});

// PUT /api/admin/brands/:id
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const dataToUpdate = { ...req.body };
    if (req.file) {
      dataToUpdate.logo_url = `/images/logos/${req.file.filename}`;
    }
    const success = await brandService.updateBrand(req.params.id, dataToUpdate);
    if (success) res.json({ message: 'Brand updated successfully' });
    else res.status(404).json({ message: 'Brand not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand' });
  }
});

// DELETE /api/admin/brands/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await brandService.deleteBrand(req.params.id);
    if (success) res.json({ message: 'Brand deleted' });
    else res.status(404).json({ message: 'Brand not found' });
  } catch (error) { res.status(500).json({ message: 'Error deleting brand' }); }
});

module.exports = router;