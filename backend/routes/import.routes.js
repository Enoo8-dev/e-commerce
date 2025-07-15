const express = require('express');
const multer = require('multer');
const importService = require('../services/importService');
const router = express.Router();

// Configura multer per salvare i file temporaneamente
const upload = multer({ dest: 'uploads/' });

// POST /api/admin/import/products
router.post('/products', upload.single('csvfile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nessun file caricato.' });
  }
  try {
    const result = await importService.processProductCsv(req.file.path);
    res.json(result);
  } catch (error) {
    console.error('Import error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
