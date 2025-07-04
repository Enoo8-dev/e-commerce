const addressDAO = require('../dao/addressDAO');

const addressService = {
  async getUserAddresses(userId) {
    return await addressDAO.getByUserId(userId);
  },
  async addUserAddress(userId, addressData) {
    return await addressDAO.create(userId, addressData);
  },
  async updateUserAddress(id, userId, addressData) {
    return await addressDAO.update(id, userId, addressData);
  },
  async deleteUserAddress(id, userId) {
    return await addressDAO.delete(id, userId);
  },
  async setDefaultUserAddress(userId, addressId) {
    return await addressDAO.setDefault(userId, addressId);
  }
};

module.exports = addressService;