const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productDAO = require('../dao/productDAO');

const router = express.Router();

// Configurazione di Multer
const storage = multer.diskStorage({
  destination: './public/images/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.body.sku + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /api/admin/images/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  try {
    const { variantId, altText } = req.body;
    const imageUrl = `/images/products/${req.file.filename}`;
    const newImage = await productDAO.addImage(variantId, imageUrl, altText);
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: 'Error saving image reference.' });
  }
});

// DELETE /api/admin/images/:imageId
router.delete('/:imageId', async (req, res) => {
  try {
    const image = await productDAO.getImageById(req.params.imageId);
    if (image && image.image_url) {
      const imagePath = path.join(process.cwd(), 'public', image.image_url);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Successfully deleted file: ${imagePath}`);
      } else {
        console.warn(`File not found, could not delete: ${imagePath}`);
      }
    }
    await productDAO.deleteImage(req.params.imageId);
    res.status(200).json({ message: 'Image deleted successfully.' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image.' });
  }
});

// POST /api/admin/images/reorder
router.post('/reorder', async (req, res) => {
  try {
    const { imageIds } = req.body;
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ message: 'Invalid payload: imageIds must be an array.' });
    }
    await productDAO.reorderImages(imageIds);
    res.status(200).json({ message: 'Image order updated successfully.' });
  } catch (error) {
    console.error('Error in reorder route:', error);
    res.status(500).json({ message: 'Error reordering images.' });
  }
});

module.exports = router;