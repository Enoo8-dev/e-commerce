const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');

router.get('/', async (req, res) => {
  try {
    const options = {
      languageCode: req.query.lang || 'en-US',
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    const categories = await categoryService.getAllCategories(options);
    res.json(categories);
  } catch (error) { res.status(500).json({ message: 'Error fetching categories' }); }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json(category);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (error) { res.status(500).json({ message: 'Error creating category' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const success = await categoryService.updateCategory(req.params.id, req.body);
    if (success) res.json({ message: 'Category updated' });
    else res.status(404).json({ message: 'Category not found' });
  } catch (error) { res.status(500).json({ message: 'Error updating category' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await categoryService.deleteCategory(req.params.id);
    if (success) res.json({ message: 'Category deleted' });
    else res.status(404).json({ message: 'Category not found' });
  } catch (error) { res.status(500).json({ message: 'Error deleting category' }); }
});

module.exports = router;