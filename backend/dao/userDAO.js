const dbPool = require('../config/database');


const userDAO = {
    /**
     * Retrieves all users with optional filtering, sorting, and pagination.
     * @param {Object} options - Options for filtering, sorting, and pagination.
     * @param {string} options.role - The role of the users to filter by (default is 'customer').
     * @param {string} options.search - Search term for first name, last name, or email.
     * @param {string} options.sortBy - Column to sort by (default is 'created_at').
     * @param {string} options.sortOrder - Sort order, either 'ASC' or 'DESC' (default is 'DESC').
     * @param {string} options.status - Filter by user status ('active' or 'inactive').
     * @returns {Promise<Array>} A promise that resolves to an array of user objects.
     */
    async getAllByRole({ role = 'customer', search = '', sortBy = 'created_at', sortOrder = 'DESC', status = '' }) {
        let sql = `
            SELECT id, email, first_name, last_name, role, is_active, created_at
            FROM Users
        `;
        const params = [];
        const whereClauses = ['role = ?'];
        params.push(role);

        if (search) {
            whereClauses.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // *** NUOVA LOGICA PER IL FILTRO DELLO STATO ***
        if (status === 'active') {
            whereClauses.push('is_active = TRUE');
        } else if (status === 'inactive') {
            whereClauses.push('is_active = FALSE');
        }

        sql += ` WHERE ${whereClauses.join(' AND ')}`;

        const validSortColumns = { name: 'last_name, first_name', email: 'email', created_at: 'created_at' };
        const orderByColumn = validSortColumns[sortBy] || 'created_at';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${orderByColumn} ${orderDirection}`;

        const [rows] = await dbPool.query(sql, params);
        return rows;
    },

    /**
     * Creates a new user in the database.
     * @param {Object} user - The user data to insert.
     * @param {string} user.email - The user's email address.
     * @param {string} user.passwordHash - The hashed password of the user.
     * @param {string} user.firstName - The user's first name.
     * @param {string} user.lastName - The user's last name.
     * @param {string} user.role - The user's role (default is 'customer').
     * @returns {Promise<number>} The ID of the newly created user.
     */
    async createUser({ email, passwordHash, firstName, lastName, role = 'customer' }) {
        const sql = 'INSERT INTO Users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await dbPool.query(sql, [email, passwordHash, firstName, lastName, role]);
        return result.insertId;
    },

    /**
     * Updates the status of a user (active/inactive).
     * @param {number} userId - The ID of the user to update.
     * @param {boolean} isActive - The new status of the user (true for active, false for inactive).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    async updateUserStatus(userId, isActive) {
        const sql = 'UPDATE Users SET is_active = ? WHERE id = ?';
        const [result] = await dbPool.query(sql, [isActive, userId]);
        return result.affectedRows > 0;
    },

    /**
     * Deletes a user from the database.
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
     */
    async deleteUser(userId) {
        const [result] = await dbPool.query('DELETE FROM Users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    },

    /**
     * Retrieves a user by their email address.
     * @param {string} email - The email address of the user to retrieve.
     * @returns {Promise<Object>} The user object if found, otherwise undefined.
     */
    async getUserByEmail(email) {
        const sql = 'SELECT * FROM Users WHERE email = ?';
        try {
            const [rows] = await dbPool.query(sql, [email]);
            return rows[0]; // Return the first user found
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Database error while fetching user');
        }
    },

    /**
     * Retrieves a user by their ID.
     * @param {number} userId - The ID of the user to retrieve.
     * @param {boolean} includePassword - Whether to include the password hash in the result.
     * @returns {Promise<Object>} The user object if found, otherwise undefined.
     */
    async getUserById(userId, includePassword = false) {
        const columns = 'id, email, first_name, last_name, role, is_active';
        const sql = `SELECT ${includePassword ? columns + ', password_hash' : columns} FROM Users WHERE id = ?`;        
        try {
            const [rows] = await dbPool.query(sql, [userId]);            
            return rows[0]; // Return the user object if found
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Database error while fetching user');
        }
    },

    /**
     * Updates the password of a user.
     * @param {number} userId - The ID of the user whose password is to be updated.
     * @param {string} passwordHash - The new hashed password.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    async updatePassword(userId, passwordHash) {
        const sql = 'UPDATE Users SET password_hash = ? WHERE id = ?';
        const [result] = await dbPool.query(sql, [passwordHash, userId]);
        return result.affectedRows > 0;
    }
}

// Export the userDAO object so it can be used in other files (like services)
module.exports = userDAO;