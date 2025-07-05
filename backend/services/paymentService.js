const paymentDAO = require('../dao/paymentDAO');

const paymentService = {
  async getUserPaymentMethods(userId) {
    return await paymentDAO.getByUserId(userId);
  },
  async addUserPaymentMethod(userId, cardData) {
    const paymentMethodDetails = {
      card_type: 'Visa', // Simulato
      last_four_digits: cardData.cardNumber.slice(-4),
      cardholder_name: cardData.cardName,
      expiry_date: cardData.expiryDate
    };
    return await paymentDAO.create(userId, paymentMethodDetails);
  },
  async updateUserPaymentMethod(id, userId, cardData) {
    return await paymentDAO.update(id, userId, cardData);
  },
  async deleteUserPaymentMethod(id, userId) {
    return await paymentDAO.delete(id, userId);
  },
  async setDefaultUserPaymentMethod(userId, paymentMethodId) {
    return await paymentDAO.setDefault(userId, paymentMethodId);
  }
};

module.exports = paymentService;
