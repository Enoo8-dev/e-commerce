const paymentDAO = require('../dao/paymentDAO');

const paymentService = {
  /**
   * Recupera i metodi di pagamento di un utente
   * @param {string} userId - ID dell'utente di cui recuperare i metodi di pagamento
   * @returns {Promise<Array>} - Lista dei metodi di pagamento
   */
  async getUserPaymentMethods(userId) {
    return await paymentDAO.getByUserId(userId);
  },
  
  /**
   * Aggiunge un nuovo metodo di pagamento per un utente
   * @param {string} userId - ID dell'utente a cui aggiungere il metodo di pagamento
   * @param {Object} cardData - Dati della carta di pagamento
   * @param {string} cardData.cardNumber - Numero della carta
   * @param {string} cardData.cardName - Nome del titolare della carta
   * @param {string} cardData.expiryDate - Data di scadenza della carta
   * @returns {Promise<Object>} - Dettagli del metodo di pagamento aggiunto
   */
  async addUserPaymentMethod(userId, cardData) {
    const paymentMethodDetails = {
      card_type: 'Visa', // Simulato
      last_four_digits: cardData.cardNumber.slice(-4),
      cardholder_name: cardData.cardName,
      expiry_date: cardData.expiryDate
    };
    return await paymentDAO.create(userId, paymentMethodDetails);
  },

  /**
   * Aggiorna un metodo di pagamento esistente per un utente
   * @param {string} id - ID del metodo di pagamento da aggiornare
   * @param {string} userId - ID dell'utente a cui appartiene il metodo di pagamento
   * @param {Object} cardData - Dati della carta di pagamento
   * @param {string} cardData.cardNumber - Numero della carta
   * @param {string} cardData.cardName - Nome del titolare della carta
   * @returns {Promise<Object>} - Dettagli del metodo di pagamento aggiornato
   */
  async updateUserPaymentMethod(id, userId, cardData) {
    return await paymentDAO.update(id, userId, cardData);
  },

  /**
   * Elimina un metodo di pagamento per un utente
   * @param {string} id - ID del metodo di pagamento da eliminare
   * @param {string} userId - ID dell'utente a cui appartiene il metodo di pagamento
   * @returns {Promise<void>}
   */
  async deleteUserPaymentMethod(id, userId) {
    return await paymentDAO.delete(id, userId);
  },

  /**
   * Imposta un metodo di pagamento come predefinito per un utente
   * @param {string} userId - ID dell'utente a cui impostare il metodo di pagamento predefinito
   * @param {string} paymentMethodId - ID del metodo di pagamento da impostare come predefinito
   * @returns {Promise<void>}
   */
  async setDefaultUserPaymentMethod(userId, paymentMethodId) {
    return await paymentDAO.setDefault(userId, paymentMethodId);
  }
};

module.exports = paymentService;
