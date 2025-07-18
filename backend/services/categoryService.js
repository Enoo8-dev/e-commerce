const categoryDAO = require('../dao/categoryDAO');

const categoryService = {

  /**
   * Recupera tutte le categorie con opzioni di paginazione e ordinamento
   * @param {Object} options - Opzioni per la paginazione e l'ordinamento
   * @param {number} options.page - Numero della pagina (default: 1)
   * @param {number} options.limit - Numero di elementi per pagina (default: 10)
   * @param {string} options.sort - Campo per ordinare (default: 'name')
   * @param {string} options.order - Ordine di ordinamento ('asc' o 'desc', default: 'asc')
   * @returns {Promise<Array>} - Lista di categorie
   */
  async getAllCategories(options) {
    return await categoryDAO.getAll(options);
  },

  /**
   * Recupera una categoria per ID
   * @param {string} id - ID della categoria da recuperare
   * @returns {Promise<Object>} - Dettagli della categoria
   * @throws {Error} Se la categoria non viene trovata
   */
  async getCategoryById(id) {
    const category = await categoryDAO.getById(id);
    if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
    }
    return category;
  },

  /**
   * Crea una nuova categoria
   * @param {Object} data - Dati della categoria da creare
   * @returns {Promise<Object>} - Dettagli della categoria creata
   */
  async createCategory(data) {
    return await categoryDAO.create(data);
  },

  /**
   * Aggiorna una categoria esistente
   * @param {string} id - ID della categoria da aggiornare
   * @param {Object} data - Dati della categoria da aggiornare
   * @returns {Promise<Object>} - Dettagli della categoria aggiornata
   */
  async updateCategory(id, data) {
    return await categoryDAO.update(id, data);
  },

  /**
   * Elimina una categoria per ID
   * @param {string} id - ID della categoria da eliminare
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    return await categoryDAO.delete(id);
  }
};

module.exports = categoryService;
