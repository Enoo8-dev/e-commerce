const wishlistDAO = require('../dao/wishlistDAO');

const wishlistService = {
  async getUserWishlist(userId, languageCode) {
    return await wishlistDAO.getByUserId(userId, languageCode);
  },
  async addToWishlist(userId, variantId) {
    return await wishlistDAO.add(userId, variantId);
  },
  async removeFromWishlist(userId, variantId) {
    return await wishlistDAO.remove(userId, variantId);
  }
};

module.exports = wishlistService;