const categoryDAO = require('../dao/categoryDAO');

const categoryService = {
  async getAllCategories(options) {
    return await categoryDAO.getAll(options);
  },
  async getCategoryById(id) {
    const category = await categoryDAO.getById(id);
    if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
    }
    return category;
  },
  async createCategory(data) {
    return await categoryDAO.create(data);
  },
  async updateCategory(id, data) {
    return await categoryDAO.update(id, data);
  },
  async deleteCategory(id) {
    return await categoryDAO.delete(id);
  }
};

module.exports = categoryService;
