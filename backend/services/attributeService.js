const attributeDAO = require('../dao/attributeDAO');

const attributeService = {
  /**
   * Recupera tutti gli attributi con opzioni di filtro e paginazione
   * @param {Object} options - Opzioni di filtro e paginazione
   * @returns {Promise<Array>} Lista degli attributi
   */
  async getAllAttributes(options) {
    return await attributeDAO.getAll(options);
  },

  /**
   * Recupera un attributo specifico per ID
   * @param {number} id - ID dell'attributo
   * @returns {Promise<Object>} Attributo specifico
   */
  async getAttributeById(id) {
    return await attributeDAO.getAttributeById(id);
  },

  /**
   * Recupera tutti i valori di un attributo specifico
   * @param {number} attributeId - ID dell'attributo
   * @returns {Promise<Array>} Lista dei valori dell'attributo
   */
  async getAttributeValueById(id) {
    return await attributeDAO.getAttributeValueById(id);
  },

  /**
   * Crea un nuovo attributo
   * @param {string} name - Nome dell'attributo
   * @returns {Promise<Object>} Attributo creato
   */ 
  async createAttribute(name) {
    return await attributeDAO.createAttribute(name);
  },

  /**
   * Crea un nuovo valore per un attributo specifico
   * @param {number} attributeId - ID dell'attributo
   * @param {Object} valueData - Dati del valore da creare
   * @returns {Promise<Object>} Valore dell'attributo creato
   */
  async createAttributeValue(attributeId, valueData) {
    return await attributeDAO.createAttributeValue(attributeId, valueData);
  },

  /**
   * Aggiorna un attributo specifico
   * @param {number} id - ID dell'attributo
   * @param {Object} data - Nuovi dati dell'attributo
   * @returns {Promise<Object>} Attributo aggiornato
   */
  async updateAttribute(id, data) {
    return await attributeDAO.updateAttribute(id, data);
  },

  /**
   * Aggiorna un valore di attributo specifico
   * @param {number} id - ID del valore dell'attributo
   * @param {Object} data - Nuovi dati del valore dell'attributo  
   * @returns {Promise<Object>} Valore dell'attributo aggiornato
   */
  async updateAttributeValue(id, data) {
    return await attributeDAO.updateAttributeValue(id, data);
  },

  /**
   * Elimina un attributo specifico
   * @param {number} id - ID dell'attributo
   * @returns {Promise<void>}
   */
  async deleteAttribute(id) {
    return await attributeDAO.deleteAttribute(id);
  },

  /**
   * Elimina un valore di attributo specifico
   * @param {number} id - ID del valore dell'attributo
   * @returns {Promise<void>}
   */
  async deleteAttributeValue(id) {
    return await attributeDAO.deleteAttributeValue(id);
  }
};

module.exports = attributeService;
