const dbPool = require('../config/database');

const addressDAO = {
    
    /** Recupera tutti gli indirizzi di un utente
     * @param {number} userId ID dell'utente
     * @returns {Promise<Array>} Lista degli indirizzi dell'utente
     */
    async getByUserId(userId) {
        const sql = 'SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
        const [rows] = await dbPool.query(sql, [userId]);
        return rows;
    },

    /** Recupera un indirizzo specifico per ID
     * @param {number} id ID dell'indirizzo
     * @param {number} userId ID dell'utente proprietario dell'indirizzo
     * @returns {Promise<Object|null>} Indirizzo trovato o null se non esiste
     */
    async create(userId, addressData) {
        const { street, city, postal_code, province, country, is_default = false } = addressData;
        const sql = 'INSERT INTO Addresses (user_id, street, city, postal_code, province, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await dbPool.query(sql, [userId, street, city, postal_code, province, country, is_default]);
        return result.insertId;
    },

    /** Aggiorna un indirizzo esistente
     * @param {number} id ID dell'indirizzo da aggiornare
     * @param {number} userId ID dell'utente proprietario dell'indirizzo
     * @param {Object} addressData Nuovi dati dell'indirizzo
     * @returns {Promise<boolean>} true se l'aggiornamento è riuscito, false altrimenti
     */
    async update(id, userId, addressData) {
        const { street, city, postal_code, province, country } = addressData;
        const sql = 'UPDATE Addresses SET street = ?, city = ?, postal_code = ?, province = ?, country = ? WHERE id = ? AND user_id = ?';
        const [result] = await dbPool.query(sql, [street, city, postal_code, province, country, id, userId]);
        return result.affectedRows > 0;
    },

    /** Elimina un indirizzo specifico
     * @param {number} id ID dell'indirizzo da eliminare
     * @param {number} userId ID dell'utente proprietario dell'indirizzo
     * @returns {Promise<boolean>} true se l'eliminazione è riuscita, false altrimenti
     */
    async delete(id, userId) {
        const sql = 'DELETE FROM Addresses WHERE id = ? AND user_id = ?';
        const [result] = await dbPool.query(sql, [id, userId]);
        return result.affectedRows > 0;
    },

    /** Imposta un indirizzo come predefinito per l'utente
     * @param {number} userId ID dell'utente
     * @param {number} addressId ID dell'indirizzo da impostare come predefinito
     * @returns {Promise<boolean>} true se l'operazione è riuscita, false altrimenti
     */
    async setDefault(userId, addressId) {
        const connection = await dbPool.getConnection();
        try {
            await connection.beginTransaction();
            // set all other addresses to not default
            await connection.query('UPDATE Addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
            // set the specified address to default
            await connection.query('UPDATE Addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [addressId, userId]);
            await connection.commit();
        return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = addressDAO;