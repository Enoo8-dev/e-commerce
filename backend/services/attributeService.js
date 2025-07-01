const attributeDAO = require('../dao/attributeDAO');

const attributeService = {
  async getAllAttributes(options) {
    return await attributeDAO.getAll(options);
  },
  async getAttributeById(id) {
    return await attributeDAO.getAttributeById(id);
  },
  async getAttributeValueById(id) {
    return await attributeDAO.getAttributeValueById(id);
  },
  async createAttribute(name) {
    return await attributeDAO.createAttribute(name);
  },
  async createAttributeValue(attributeId, valueData) {
    return await attributeDAO.createAttributeValue(attributeId, valueData);
  },
  async updateAttribute(id, data) {
    return await attributeDAO.updateAttribute(id, data);
  },
  async updateAttributeValue(id, data) {
    return await attributeDAO.updateAttributeValue(id, data);
  },
  async deleteAttribute(id) {
    return await attributeDAO.deleteAttribute(id);
  },
  async deleteAttributeValue(id) {
    return await attributeDAO.deleteAttributeValue(id);
  }
};

module.exports = attributeService;
