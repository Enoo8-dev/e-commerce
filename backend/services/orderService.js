const orderDAO = require('../dao/orderDAO');

const orderService = {
  async createNewOrder(userId, orderData) {
    // Qui in futuro potremmo validare lo stock, calcolare i totali, applicare coupon, etc.
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Cannot create an empty order.');
    }
    return await orderDAO.createOrder(userId, orderData);
  },

  async getUserAddresses(userId) {
    return await orderDAO.getAddressesByUserId(userId);
  },

  async addUserAddress(userId, addressData) {
    return await orderDAO.addAddress(userId, addressData);
  }
};

module.exports = orderService;