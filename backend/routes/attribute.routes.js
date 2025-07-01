const express = require('express');
const router = express.Router();
const attributeService = require('../services/attributeService');

router.get('/', async (req, res) => {
  try {
    const options = {
      languageCode: req.query.lang || 'en-US',
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    const attributes = await attributeService.getAllAttributes(options);
    res.json(attributes);
  } catch (error) { res.status(500).json({ message: 'Error fetching attributes' }); }
});

router.get('/:id', async (req, res) => {
    try {
        const attribute = await attributeService.getAttributeById(req.params.id);
        if (attribute) res.json(attribute);
        else res.status(404).json({ message: 'Attribute not found' });
    } catch (error) { res.status(500).json({ message: 'Error fetching attribute' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const newAttribute = await attributeService.createAttribute(name);
    res.status(201).json(newAttribute);
  } catch (error) { res.status(500).json({ message: 'Error creating attribute' }); }
});

router.put('/:id', async (req, res) => {
    try {
        const success = await attributeService.updateAttribute(req.params.id, req.body);
        if (success) res.json({ message: 'Attribute updated' });
        else res.status(404).json({ message: 'Attribute not found' });
    } catch (error) { res.status(500).json({ message: 'Error updating attribute' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const success = await attributeService.deleteAttribute(req.params.id);
        if (success) res.json({ message: 'Attribute deleted' });
        else res.status(404).json({ message: 'Attribute not found' });
    } catch (error) { res.status(500).json({ message: 'Error deleting attribute' }); }
});

router.post('/:attributeId/values', async (req, res) => {
    try {
        const { attributeId } = req.params;
        const newValue = await attributeService.createAttributeValue(attributeId, req.body);
        res.status(201).json(newValue);
    } catch (error) { res.status(500).json({ message: 'Error creating attribute value' }); }
});

router.get('/values/:id', async (req, res) => {
  try {
    const value = await attributeService.getAttributeValueById(req.params.id);
    if (value) res.json(value);
    else res.status(404).json({ message: 'Attribute value not found' });
  } catch (error) { res.status(500).json({ message: 'Error fetching attribute value' }); }
});

router.put('/values/:id', async (req, res) => {
  try {
    const success = await attributeService.updateAttributeValue(req.params.id, req.body);
    if (success) res.json({ message: 'Attribute value updated' });
    else res.status(404).json({ message: 'Attribute value not found' });
  } catch (error) { res.status(500).json({ message: 'Error updating attribute value' }); }
});

router.delete('/values/:id', async (req, res) => {
    try {
        const success = await attributeService.deleteAttributeValue(req.params.id);
        if (success) res.json({ message: 'Attribute value deleted' });
        else res.status(404).json({ message: 'Attribute value not found' });
    } catch (error) { res.status(500).json({ message: 'Error deleting attribute value' }); }
});

module.exports = router;