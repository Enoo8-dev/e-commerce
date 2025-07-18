const addressDAO = require('../dao/addressDAO');

const addressService = {
  /**
   * Recupera gli indirizzi dell'utente
   * @param {number} userId - ID dell'utente
   * @returns {Promise<Array>} Lista degli indirizzi dell'utente
   */
  async getUserAddresses(userId) {
    return await addressDAO.getByUserId(userId);
  },

  /**
   * Recupera un indirizzo specifico dell'utente
   * @param {number} id - ID dell'indirizzo
   * @param {number} userId - ID dell'utente
   * @returns {Promise<Object>} Indirizzo specifico
   */
  async addUserAddress(userId, addressData) {
    return await addressDAO.create(userId, addressData);
  },

  /**
   * Aggiorna un indirizzo specifico dell'utente
   * @param {number} id - ID dell'indirizzo
   * @param {number} userId - ID dell'utente
   * @param {Object} addressData - Nuovi dati dell'indirizzo
   * @returns {Promise<Object>} Indirizzo aggiornato
   */
  async updateUserAddress(id, userId, addressData) {
    return await addressDAO.update(id, userId, addressData);
  },

  /**
   * Elimina un indirizzo specifico dell'utente
   * @param {number} id - ID dell'indirizzo
   * @param {number} userId - ID dell'utente
   * @returns {Promise<void>}
   */
  async deleteUserAddress(id, userId) {
    return await addressDAO.delete(id, userId);
  },

  /**
   * Imposta un indirizzo come predefinito per l'utente
   * @param {number} userId - ID dell'utente    
   * @param {number} addressId - ID dell'indirizzo da impostare come predefinito
   * @returns {Promise<void>}
   */
  async setDefaultUserAddress(userId, addressId) {
    return await addressDAO.setDefault(userId, addressId);
  }
};

module.exports = addressService;