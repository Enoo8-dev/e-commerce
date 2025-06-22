const dbPool = require('../config/database');


const userDAO = {
    /**
     * Creates a new user in the database.
     * @param {Object} user - The user data to insert.
     * @param {string} user.email - The user's email address.
     * @param {string} user.passwordHash - The hashed password of the user.
     * @param {string} user.firstName - The user's first name.
     * @param {string} user.lastName - The user's last name.
     * @returns {Promise<number>} The ID of the newly created user.
     */
    async createUser({ email, passwordHash, firstName, lastName }) {
        const sql = 'INSERT INTO Users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)';
        try {
            const [result] = await dbPool.query(sql, [email, passwordHash, firstName, lastName]);
            return result.insertId; // Return the ID of the newly created user
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Database error while creating user');
        }
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
     * @returns {Promise<Object>} The user object if found, otherwise undefined.
     */
    async getUserById(userId) {
        const sql = "SELECT id, email, first_name, last_name, role, created_at FROM Users WHERE id = ?";
        try {
            const [rows] = await dbPool.query(sql, [userId]);
            return rows[0]; // Return the user object if found
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Database error while fetching user');
        }
    }
}

// Export the userDAO object so it can be used in other files (like services)
module.exports = userDAO;