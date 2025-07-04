const dbPool = require('../config/database');

const addressDAO = {
    async getByUserId(userId) {
        const sql = 'SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
        const [rows] = await dbPool.query(sql, [userId]);
        return rows;
    },

    async create(userId, addressData) {
        const { street, city, postal_code, province, country, is_default = false } = addressData;
        const sql = 'INSERT INTO Addresses (user_id, street, city, postal_code, province, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await dbPool.query(sql, [userId, street, city, postal_code, province, country, is_default]);
        return result.insertId;
    },

    async update(id, userId, addressData) {
        const { street, city, postal_code, province, country } = addressData;
        const sql = 'UPDATE Addresses SET street = ?, city = ?, postal_code = ?, province = ?, country = ? WHERE id = ? AND user_id = ?';
        const [result] = await dbPool.query(sql, [street, city, postal_code, province, country, id, userId]);
        return result.affectedRows > 0;
    },

    async delete(id, userId) {
        const sql = 'DELETE FROM Addresses WHERE id = ? AND user_id = ?';
        const [result] = await dbPool.query(sql, [id, userId]);
        return result.affectedRows > 0;
    },

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