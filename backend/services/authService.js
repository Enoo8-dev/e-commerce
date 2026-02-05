const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDAO = require('../dao/userDAO');

const authService = {
    /**
     * Registers a new user by creating a new user record in the database.
     * @param {Object} userData - The user data to register.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.password - The user's password.
     * @param {string} userData.firstName - The user's first name.
     * @param {string} userData.lastName - The user's last name.
     * @returns {Promise<Object>} The newly created user's ID.
     */
    async registerUser(userData) {
        const { email, password, firstName, lastName } = userData;

        // Check if the user already exists
        const existingUser = await userDAO.getUserByEmail(email);
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409; // Conflict
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        // Hash the password
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user in the database
        const newUserId = await userDAO.createUser({ email, passwordHash, firstName, lastName });

        return { userId: newUserId };
    },
    /**
     * Logs in a user by verifying their email and password, and generating a JWT token.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's password.
     * @returns {Promise<string>} The generated JWT token.
     */
    async loginUser(email, password) {
        const user = await userDAO.getUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        if (!user.is_active) {
            const error = new Error('Il tuo account è stato disabilitato. Contatta il supporto.');
            error.statusCode = 403; // 403 Forbidden, not active
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        const payload = {
            userId: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expiration time
        );

        return token;
    },

    async loginAsDemoUser(role) {
        // 1. Genera una mail casuale per evitare conflitti
        const randomString = crypto.randomBytes(4).toString('hex');
        const email = `demo_${role}_${randomString}@demo.local`;

        // 2. Hash della password
        const salt = await bcrypt.genSalt(10);
        const dummyPassword = crypto.randomBytes(10).toString('hex');
        const passwordHash = await bcrypt.hash(dummyPassword, salt);

        // 3. Crea l'utente effimero
        const userId = await userDAO.createUser({ 
            email, 
            passwordHash, 
            firstName: 'Demo', 
            lastName: role === 'admin' ? 'Admin' : 'User', 
            role: role,
            isEphemeral: true 
        });

        // 4. Genera il token classico
        const payload = { userId: userId, role: role };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        return token;
    },
}

module.exports = authService;