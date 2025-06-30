const brandDAO = require('../dao/brandDAO');

const brandService = {
  async getAllBrands(options) {
    return await brandDAO.getAll(options);
  },
  async getBrandById(id) {
    const brand = await brandDAO.getById(id);
    if (!brand) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }
    return brand;
  },
  async createBrand(data, logoPath) {
    return await brandDAO.create(data, logoPath);
  },
  async updateBrand(id, data) {
    return await brandDAO.update(id, data);
  },
  async deleteBrand(id) {
    return await brandDAO.delete(id);
  }
};

module.exports = brandService;