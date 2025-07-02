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

      // 1. Inserisce l'ordine nella tabella Orders
      const orderSql = 'INSERT INTO Orders (user_id, shipping_address_id, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?)';
      const [orderResult] = await connection.query(orderSql, [userId, addressId, totalAmount, paymentMethod, 'processing']);
      const orderId = orderResult.insertId;

      // 2. Inserisce ogni articolo nella tabella Order_Items
      const itemSql = 'INSERT INTO Order_Items (order_id, variant_id, quantity, price_per_unit) VALUES ?';

      const orderItemsData = items.map(item => [
        orderId,
        item.variantId,
        item.quantity,
        item.price // Prezzo al momento dell'acquisto
      ]);

      if (orderItemsData.length > 0) {
        await connection.query(itemSql, [orderItemsData]);
      }

      // 3. Aggiorna lo stock dei prodotti
      for (const item of items) {
        await connection.query(
          'UPDATE Product_Variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variantId]
        );
      }

      // 4. Crea un record di pagamento iniziale
      const paymentSql = 'INSERT INTO Payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)';
      await connection.query(paymentSql, [orderId, totalAmount, paymentMethod, 'pending']);

      await connection.commit();
      return orderId;

    } catch (error) {
      await connection.rollback();
      console.error('Error in createOrder DAO transaction:', error);
      throw new Error('Failed to create order in database.');
    } finally {
      connection.release();
    }
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