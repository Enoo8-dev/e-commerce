const wishlistDAO = require('../dao/wishlistDAO');

const wishlistService = {
  /**
   * Recupera la wishlist di un utente
   * @param {string} userId - ID dell'utente di cui recuperare la wishlist
   * @param {string} languageCode - Codice della lingua per i dettagli del prodotto
   * @returns {Promise<Array>} - Lista degli articoli nella wishlist
   */
  async getUserWishlist(userId, languageCode) {
    return await wishlistDAO.getByUserId(userId, languageCode);
  },

  /**
   * Aggiunge un articolo alla wishlist di un utente
   * @param {string} userId - ID dell'utente a cui aggiungere l'articolo
   * @param {string} variantId - ID della variante del prodotto da aggiungere
   * @returns {Promise<Object>} - Dettagli dell'articolo aggiunto alla wishlist
   */
  async addToWishlist(userId, variantId) {
    return await wishlistDAO.add(userId, variantId);
  },

  /**
   * Rimuove un articolo dalla wishlist di un utente
   * @param {string} userId - ID dell'utente da cui rimuovere l'articolo
   * @param {string} variantId - ID della variante del prodotto da rimuovere
   * @returns {Promise<void>}
   */
  async removeFromWishlist(userId, variantId) {
    return await wishlistDAO.remove(userId, variantId);
  }
};

module.exports = wishlistService;