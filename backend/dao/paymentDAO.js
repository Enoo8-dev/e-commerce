const dbPool = require('../config/database');

const paymentDAO = {
  /**
   * Recupera tutti i metodi di pagamento per un utente specifico.
   * @param {number} userId - ID dell'utente
   * @returns {Promise<Array>} - Lista dei metodi di pagamento dell'utente
   */
  async getByUserId(userId) {
    const [rows] = await dbPool.query('SELECT * FROM User_Payment_Methods WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    return rows;
  },

  /**
   * Recupera un metodo di pagamento specifico per un utente.
   * @param {number} id - ID del metodo di pagamento
   * @param {number} userId - ID dell'utente
   * @returns {Promise<Object|null>} - Il metodo di pagamento se trovato, altrimenti null
   */
  async create(userId, data) {
    const { card_type, last_four_digits, cardholder_name, expiry_date } = data;
    const sql = 'INSERT INTO User_Payment_Methods (user_id, card_type, last_four_digits, cardholder_name, expiry_date) VALUES (?, ?, ?, ?, ?)';
    const [result] = await dbPool.query(sql, [userId, card_type, last_four_digits, cardholder_name, expiry_date]);
    return result.insertId;
  },

  /**
   * Aggiorna un metodo di pagamento esistente.
   * @param {number} id - ID del metodo di pagamento
   * @param {number} userId - ID dell'utente
   * @param {Object} data - Nuovi dati del metodo di pagamento
   * @returns {Promise<boolean>} - True se l'aggiornamento è riuscito, altrimenti false
   */
  async update(id, userId, data) {
    const { cardholder_name, expiry_date } = data;
    const sql = 'UPDATE User_Payment_Methods SET cardholder_name = ?, expiry_date = ? WHERE id = ? AND user_id = ?';
    const [result] = await dbPool.query(sql, [cardholder_name, expiry_date, id, userId]);
    return result.affectedRows > 0;
  },

  /**
   * Elimina un metodo di pagamento specifico per un utente.
   * @param {number} id - ID del metodo di pagamento
   * @param {number} userId - ID dell'utente
   * @returns {Promise<boolean>} - True se l'eliminazione è riuscita, altrimenti false
   */
  async delete(id, userId) {
    const sql = 'DELETE FROM User_Payment_Methods WHERE id = ? AND user_id = ?';
    const [result] = await dbPool.query(sql, [id, userId]);
    return result.affectedRows > 0;
  },

  /**
   * Imposta un metodo di pagamento come predefinito per un utente.
   * @param {number} userId - ID dell'utente
   * @param {number} paymentMethodId - ID del metodo di pagamento da impostare come predefinito
   * @returns {Promise<boolean>} - True se l'operazione è riuscita, altrimenti false
   */
  async setDefault(userId, paymentMethodId) {
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      // Rimuove il flag is_default da tutti i metodi di pagamento dell'utente
      await connection.query('UPDATE User_Payment_Methods SET is_default = FALSE WHERE user_id = ?', [userId]);
      // Imposta il metodo di pagamento specificato come predefinito
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