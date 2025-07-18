const brandDAO = require('../dao/brandDAO');

const brandService = {
  /**
   * Recupera tutti i marchi con opzioni di paginazione e ordinamento
   * @param {Object} options - Opzioni per la paginazione e l'ordinamento
   * @param {number} options.page - Numero della pagina (default: 1)
   * @param {number} options.limit - Numero di elementi per pagina (default: 10)
   * @param {string} options.sort - Campo per ordinare (default: 'name')
   * @param {string} options.order - Ordine di ordinamento ('asc' o 'desc', default: 'asc')
   * @returns {Promise<Array>} - Lista di marchi
   */
  async getAllBrands(options) {
    return await brandDAO.getAll(options);
  },

  /**
   * Recupera un marchio per ID
   * @param {string} id - ID del marchio da recuperare
   * @returns {Promise<Object>} - Dettagli del marchio
   */
  async getBrandById(id) {
    const brand = await brandDAO.getById(id);
    if (!brand) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }
    return brand;
  },

  /**
   * Crea un nuovo marchio
   * @param {Object} data - Dati del marchio da creare
   * @param {string} logoPath - Percorso del logo del marchio
   * @returns {Promise<Object>} - Dettagli del marchio creato
   */
  async createBrand(data, logoPath) {
    return await brandDAO.create(data, logoPath);
  },

  /**
   * Aggiorna un marchio esistente
   * @param {string} id - ID del marchio da aggiornare
   * @param {Object} data - Dati del marchio da aggiornare
   * @returns {Promise<Object>} - Dettagli del marchio aggiornato
   */
  async updateBrand(id, data) {
    return await brandDAO.update(id, data);
  },

  /**
   * Elimina un marchio per ID
   * @param {string} id - ID del marchio da eliminare
   * @returns {Promise<void>}
   */
  async deleteBrand(id) {
    return await brandDAO.delete(id);
  }
};

module.exports = brandService;