const userDAO = require('../dao/userDAO');

const userService = {
    async getUserProfile(userId) {
        const user = await userDAO.getUserById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404; // Not Found
            throw error;
        }
        return user;
    }
};

module.exports = userService;