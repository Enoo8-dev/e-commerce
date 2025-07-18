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
      return { orderId: orderId, paymentId: paymentResult.insertId };

    } catch (error) {
      await connection.rollback();
      console.error('Error in createOrder DAO transaction:', error);
      throw new Error('Failed to create order in database.');
    } finally {
      connection.release();
    }
  },

  /**
   * Retrieves an order by its ID.
   * @param {number} orderId - The ID of the order to retrieve.
   * @returns {Promise<object>} The order details.
   */
  async getOrderById(orderId) {
    const sql = 'SELECT * FROM Orders WHERE id = ?';
    const [rows] = await dbPool.query(sql, [orderId]);
    return rows[0] || null;
  },

  /**
   * Retrieves items for a specific order.
   * @param {number} orderId - The ID of the order.
   * @param {string} languageCode - The language code for product translations.
   * @returns {Promise<Array>} Array of order items.
   */
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

  /** 
   * Retrieves the tracking history for a specific order.
   * @param {number} orderId - The ID of the order.
   * @returns {Promise<Array>} Array of tracking history events.
   */
  async getOrderTrackingHistory(orderId) {
    const sql = 'SELECT * FROM Order_Tracking_History WHERE order_id = ? ORDER BY changed_at ASC';
    const [rows] = await dbPool.query(sql, [orderId]);
    return rows;
  },

  /**
   * Updates the payment status for a specific payment.
   * @param {number} paymentId - The ID of the payment to update.
   * @param {string} status - The new status of the payment (e.g., 'completed', 'failed').
   * @param {string|null} transactionId - Optional transaction ID from the payment gateway.
   */
  async updatePaymentStatus(paymentId, status, transactionId = null) {
    await dbPool.query('UPDATE Payments SET status = ?, transaction_id = ? WHERE id = ?', [status, transactionId, paymentId]);
  },

  /**
   * Updates the status of an order and optionally adds a tracking number.
   * @param {number} orderId - The ID of the order to update.
   * @param {string} status - The new status of the order (e.g., 'shipped', 'delivered').
   * @param {string|null} trackingNumber - Optional tracking number for the order.
   */
  async updateOrderStatus(orderId, status, trackingNumber = null) {
    await dbPool.query('UPDATE Orders SET status = ?, tracking_number = ? WHERE id = ?', [status, trackingNumber, orderId]);
  },

  /**
   * Adds a tracking event to the order's tracking history.
   * @param {number} orderId - The ID of the order.
   * @param {string} status - The status of the order at this tracking event.
   * @param {string} [notes] - Optional notes for the tracking event.
   */ 
  async addTrackingEvent(orderId, status, notes = '') {
    await dbPool.query('INSERT INTO Order_Tracking_History (order_id, status, notes) VALUES (?, ?, ?)', [orderId, status, notes]);
  },

  /**
   * Fetches all orders for a specific user.
   * @param {number} userId - The ID of the user.
   * @param {string} languageCode - The language code for product translations.
   * @returns {Promise<Array>} Array of orders.
   */
  async getOrdersByUserId(userId, languageCode) {
    const sql = `
      SELECT 
        o.id,
        o.order_date,
        o.total_amount,
        o.status
      FROM Orders o
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC;
    `;
    const [orders] = await dbPool.query(sql, [userId]);
    return orders;
  },

  /**
   * Fetches all addresses for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} Array of addresses.  
   */
  async getAddressesByUserId(userId) {
    const sql = 'SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
    const [rows] = await dbPool.query(sql, [userId]);
    return rows;
  },

  /**
   * Adds a new address for a user.
   * @param {number} userId - The ID of the user.
   * @param {object} addressData - Object containing address details.
   * @param {string} addressData.street - The street address.
   * @param {string} addressData.city - The city of the address.
   * @param {string} addressData.postal_code - The postal code of the address.
   * @param {string} addressData.province - The province of the address.
   * @param {string} addressData.country - The country of the address.
   * @param {boolean} [addressData.is_default=false] - Whether this address is the default address.
   * @returns {Promise<number>} The ID of the newly created address.
   */
  async addAddress(userId, addressData) {
    const { street, city, postal_code, province, country, is_default } = addressData;
    const sql = 'INSERT INTO Addresses (user_id, street, city, postal_code, province, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await dbPool.query(sql, [userId, street, city, postal_code, province, country, is_default || false]);
    return result.insertId;
  }
};

module.exports = orderDAO;