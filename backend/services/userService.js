const userDAO = require('../dao/userDAO');
const bcrypt = require('bcryptjs');

const userService = {
  /**
   * Recupera tutti gli utenti con un ruolo specifico
   * @param {Object} options - Opzioni per la paginazione e l'ordinamento
   * @param {number} options.page - Numero della pagina (default: 1)
   * @param {number} options.limit - Numero di elementi per pagina (default: 10)
   * @param {string} options.sort - Campo per ordinare (default: 'email')
   * @param {string} options.order - Ordine di ordinamento ('asc' o 'desc', default: 'asc')
   * @returns {Promise<Array>} - Lista degli utenti
   */
  async getAllUsers(options) {
    return await userDAO.getAllByRole(options);
  },

  /**
   * Recupera un utente per ID
   * @param {string} id - ID dell'utente da recuperare
   * @returns {Promise<Object>} - Dettagli dell'utente
   * @throws {Error} Se esiste già un utente con quella mail
   */
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

  /**
   * Aggiorna un utente esistente
   * @param {string} id - ID dell'utente da aggiornare
   * @param {Object} data - Dati dell'utente da aggiornare
   * @returns {Promise<Object>} - Dettagli dell'utente aggiornato
   */
  async updateUserStatus(userId, isActive) {
    return await userDAO.updateUserStatus(userId, isActive);
  },

  /**
   * Elimina un utente per ID
   * @param {string} userId - ID dell'utente da eliminare
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    return await userDAO.deleteUser(userId);
  },

  /**
   * Recupera il profilo di un utente per ID
   * @param {string} userId - ID dell'utente di cui recuperare il profilo
   * @returns {Promise<Object>} - Dettagli del profilo dell'utente
   * @throws {Error} Se l'utente non viene trovato
   */
  async getUserProfile(userId) {
    const user = await userDAO.getUserById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Aggiorna il profilo di un utente
   * @param {string} userId - ID dell'utente di cui aggiornare il profilo
   * @param {Object} profileData - Dati del profilo da aggiornare
   * @returns {Promise<Object>} - Dettagli del profilo aggiornato
   */
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