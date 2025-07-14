const dbPool = require('../config/database');

const wishlistDAO = {
  /**
   * Fetches all wishlist items for a given user, along with product details.
   */
  async getByUserId(userId, languageCode = 'en-US') {
    const sql = `
      SELECT
        p.id AS productId,
        pv.id AS variantId,
        pt.name AS productName,
        pv.price AS originalPrice,
        (SELECT image_url FROM Product_Images WHERE variant_id = pv.id ORDER BY display_order ASC LIMIT 1) AS imageUrl
      FROM Wishlist_Items wi
      JOIN Product_Variants pv ON wi.variant_id = pv.id
      JOIN Products p ON pv.product_id = p.id
      JOIN Product_Translations pt ON p.id = pt.product_id AND pt.language_code = ?
      WHERE wi.user_id = ?
      ORDER BY wi.added_at DESC;
    `;
    const [rows] = await dbPool.query(sql, [languageCode, userId]);
    return rows;
  },

  /**
   * Adds an item to a user's wishlist.
   */
  async add(userId, variantId) {
    const sql = 'INSERT IGNORE INTO Wishlist_Items (user_id, variant_id) VALUES (?, ?)';
    const [result] = await dbPool.query(sql, [userId, variantId]);
    return result.affectedRows > 0;
  },

  /**
   * Removes an item from a user's wishlist.
   */
  async remove(userId, variantId) {
    const sql = 'DELETE FROM Wishlist_Items WHERE user_id = ? AND variant_id = ?';
    const [result] = await dbPool.query(sql, [userId, variantId]);
    return result.affectedRows > 0;
  }
};

module.exports = wishlistDAO;