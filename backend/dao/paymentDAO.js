const dbPool = require('../config/database');

const paymentDAO = {
  async getByUserId(userId) {
    const [rows] = await dbPool.query('SELECT * FROM User_Payment_Methods WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    return rows;
  },

  async create(userId, data) {
    const { card_type, last_four_digits, cardholder_name, expiry_date } = data;
    const sql = 'INSERT INTO User_Payment_Methods (user_id, card_type, last_four_digits, cardholder_name, expiry_date) VALUES (?, ?, ?, ?, ?)';
    const [result] = await dbPool.query(sql, [userId, card_type, last_four_digits, cardholder_name, expiry_date]);
    return result.insertId;
  },

  async update(id, userId, data) {
    const { cardholder_name, expiry_date } = data;
    const sql = 'UPDATE User_Payment_Methods SET cardholder_name = ?, expiry_date = ? WHERE id = ? AND user_id = ?';
    const [result] = await dbPool.query(sql, [cardholder_name, expiry_date, id, userId]);
    return result.affectedRows > 0;
  },

  async delete(id, userId) {
    const sql = 'DELETE FROM User_Payment_Methods WHERE id = ? AND user_id = ?';
    const [result] = await dbPool.query(sql, [id, userId]);
    return result.affectedRows > 0;
  },

  async setDefault(userId, paymentMethodId) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE User_Payment_Methods SET is_default = FALSE WHERE user_id = ?', [userId]);
      await connection.query('UPDATE User_Payment_Methods SET is_default = TRUE WHERE id = ? AND user_id = ?', [paymentMethodId, userId]);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = paymentDAO;