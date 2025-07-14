const userDAO = require('../dao/userDAO');
const bcrypt = require('bcryptjs');

const userService = {
  async getAllUsers(options) {
    return await userDAO.getAllByRole(options);
  },
  async createAdmin(userData) {
    const { email, password, firstName, lastName } = userData;
    const existingUser = await userDAO.getUserByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists.');
      error.statusCode = 409;
      throw error;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return await userDAO.createUser({ email, passwordHash, firstName, lastName, role: 'admin' });
  },
  async updateUserStatus(userId, isActive) {
    return await userDAO.updateUserStatus(userId, isActive);
  },
  async deleteUser(userId) {
    return await userDAO.deleteUser(userId);
  },
  async getUserProfile(userId) {
    const user = await userDAO.getUserById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

   async changePassword(userId, oldPassword, newPassword) {
    const user = await userDAO.getUserById(userId, true); // Passa true per ottenere anche l'hash
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    return await userDAO.updatePassword(userId, newPasswordHash);
  }
};

module.exports = userService;