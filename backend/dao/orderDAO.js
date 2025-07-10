const dbPool = require('../config/database');

const orderDAO = {
  /**
   * Creates a new order in the database using a transaction.
   * @param {number} userId - The ID of the user placing the order.
   * @param {object} orderData - Object containing order details.
   * @param {number} orderData.addressId - The ID of the shipping address.
   * @param {Array<object>} orderData.items - Array of items in the cart.
   * @param {number} orderData.totalAmount - The total amount of the order.
   * @param {string} orderData.paymentMethod - The chosen payment method.
   * @returns {Promise<number>} The ID of the newly created order.
   */
  async createOrder(userId, { addressId, items, totalAmount, paymentMethod }) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();

      const orderSql = 'INSERT INTO Orders (user_id, shipping_address_id, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?)';
      const [orderResult] = await connection.query(orderSql, [userId, addressId, totalAmount, paymentMethod, 'processing']);
      const orderId = orderResult.insertId;

      const itemSql = 'INSERT INTO Order_Items (order_id, variant_id, quantity, price_per_unit) VALUES ?';
      const orderItemsData = items.map(item => [orderId, item.variantId, item.quantity, item.price]);
      if (orderItemsData.length > 0) {
        await connection.query(itemSql, [orderItemsData]);
      }

      for (const item of items) {
        await connection.query('UPDATE Product_Variants SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.variantId]);
      }

      const paymentSql = 'INSERT INTO Payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)';
      const [paymentResult] = await connection.query(paymentSql, [orderId, totalAmount, paymentMethod, 'pending']);
      
      await connection.commit();
      // *** CORREZIONE QUI: Restituisce un oggetto con entrambi gli ID ***
      return { orderId: orderId, paymentId: paymentResult.insertId };

    } catch (error) {
      await connection.rollback();
      console.error('Error in createOrder DAO transaction:', error);
      throw new Error('Failed to create order in database.');
    } finally {
      connection.release();
    }
  },

  async getOrderById(orderId) {
    const sql = 'SELECT * FROM Orders WHERE id = ?';
    const [rows] = await dbPool.query(sql, [orderId]);
    return rows[0] || null;
  },

  async getOrderItems(orderId, languageCode) {
    const sql = `
      SELECT oi.quantity, oi.price_per_unit, pt.name as productName, 
             (SELECT image_url FROM Product_Images WHERE variant_id = pv.id ORDER BY display_order ASC LIMIT 1) as imageUrl
      FROM Order_Items oi
      JOIN Product_Variants pv ON oi.variant_id = pv.id
      JOIN Products p ON pv.product_id = p.id
      JOIN Product_Translations pt ON p.id = pt.product_id AND pt.language_code = ?
      WHERE oi.order_id = ?;
    `;
    const [rows] = await dbPool.query(sql, [languageCode, orderId]);
    return rows;
  },

  async getOrderTrackingHistory(orderId) {
    const sql = 'SELECT * FROM Order_Tracking_History WHERE order_id = ? ORDER BY changed_at ASC';
    const [rows] = await dbPool.query(sql, [orderId]);
    return rows;
  },

  async updatePaymentStatus(paymentId, status, transactionId = null) {
    await dbPool.query('UPDATE Payments SET status = ?, transaction_id = ? WHERE id = ?', [status, transactionId, paymentId]);
  },

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    await dbPool.query('UPDATE Orders SET status = ?, tracking_number = ? WHERE id = ?', [status, trackingNumber, orderId]);
  },

  async addTrackingEvent(orderId, status, notes = '') {
    await dbPool.query('INSERT INTO Order_Tracking_History (order_id, status, notes) VALUES (?, ?, ?)', [orderId, status, notes]);
  },

  /**
   * Fetches all addresses for a specific user.
   */
  async getAddressesByUserId(userId) {
    const sql = 'SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
    const [rows] = await dbPool.query(sql, [userId]);
    return rows;
  },

  /**
   * Adds a new address for a user.
   */
  async addAddress(userId, addressData) {
    const { street, city, postal_code, province, country, is_default } = addressData;
    const sql = 'INSERT INTO Addresses (user_id, street, city, postal_code, province, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await dbPool.query(sql, [userId, street, city, postal_code, province, country, is_default || false]);
    return result.insertId;
  }
};

module.exports = orderDAO;