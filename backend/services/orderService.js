const orderDAO = require('../dao/orderDAO');
const userDAO = require('../dao/userDAO');
const emailService = require('./emailService');
const productDAO = require('../dao/productDAO');

const orderService = {
  /**
   * Crea un nuovo ordine per un utente
   * @param {string} userId - ID dell'utente che effettua l'ordine
   * @param {Object} orderData - Dati dell'ordine
   * @param {Array} orderData.items - Lista degli articoli nell'ordine
   * @param {number} orderData.totalAmount - Importo totale dell'ordine
   * @returns {Promise<string>} - ID dell'ordine creato
   * @throws {Error} - Se si verifica un errore durante la creazione dell'ordine
   */
  async createNewOrder(userId, orderData) {
    const { orderId, paymentId } = await orderDAO.createOrder(userId, orderData);

    await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.ORDER_CONFIRMED', 'ORDER_TRACKING.PAYMENT_PROCESSING');
    this.simulateShippingProcess(orderId, paymentId);

    const user = await userDAO.getUserById(userId);
    const lang = user.language_code || 'en-US';
    const variantIds = orderData.items.map(item => item.variantId);
    const itemDetailsMap = await productDAO.getOrderItemDetails(variantIds, lang);

    const itemsForEmail = orderData.items.map(item => {
        const details = itemDetailsMap.get(item.variantId);
        return { ...item, productName: details?.productName, imageUrl: details?.imageUrl };
    });

    const emailDetails = { orderId, userName: user.first_name, items: itemsForEmail, totalAmount: orderData.totalAmount };
    emailService.sendOrderConfirmation(user.email, emailDetails).catch(console.error);

    return orderId;
  },

  /**
   * Simula il processo di spedizione dell'ordine, inclusa la conferma del pagamento,
   * la spedizione e la consegna.
   * @param {string} orderId - ID dell'ordine da processare
   * @param {string} paymentId - ID del pagamento associato all'ordine
   */
  simulateShippingProcess(orderId, paymentId) {
    // Simula la conferma del pagamento
    setTimeout(async () => {
      const transactionId = `txn_${Date.now()}`;
      await orderDAO.updatePaymentStatus(paymentId, 'succeeded', transactionId);
      const notes = JSON.stringify({ key: 'ORDER_TRACKING.NOTE_PAYMENT_APPROVED', params: { transactionId } });
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.PAYMENT_APPROVED', notes);
      console.log(`Payment for order ${orderId} confirmed.`);
    }, 10 * 1000); // dopo 10 secondi

    // Simula la spedizione
    setTimeout(async () => {
      const trackingNumber = `${Date.now()}`;
      await orderDAO.updateOrderStatus(orderId, 'shipped', trackingNumber);
      const notes = JSON.stringify({ key: 'ORDER_TRACKING.NOTE_SHIPPED', params: { trackingNumber } });
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.ORDER_SHIPPED', notes);
      console.log(`Order ${orderId} has been shipped.`);
    }, 60 * 1000); // dopo 1 minuto

    // Simula la consegna
    setTimeout(async () => {
      await orderDAO.updateOrderStatus(orderId, 'delivered');
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.DELIVRED', 'ORDER_TRACKING.NOTE_DELIVERED');
      console.log(`Order ${orderId} has been delivered.`);
    }, 3 * 60 * 1000); // dopo 3 minuti
  },

  /**
   * Recupera i dettagli di un ordine per ID
   * @param {string} orderId - ID dell'ordine da recuperare
   * @param {string} userId - ID dell'utente che ha effettuato l'ordine (opzionale)
   * @param {string} languageCode - Codice della lingua per i dettagli del prodotto
   * @returns {Promise<Object|null>} - Dettagli dell'ordine o null se non trovato
   */
  async getOrderDetails(orderId, userId, languageCode) {
    const order = await orderDAO.getOrderById(orderId);

    if (userId && order && order.user_id !== userId) {
        return null;
    }
    if (!order) return null;

    const items = await orderDAO.getOrderItems(orderId, languageCode);
    const history = await orderDAO.getOrderTrackingHistory(orderId);

    return { ...order, items, history };
  },

  /**
   * Recupera gli ordini di un utente
   * @param {string} userId - ID dell'utente di cui recuperare gli ordini
   * @param {string} languageCode - Codice della lingua per i dettagli del prodotto
   * @returns {Promise<Array>} - Lista degli ordini dell'utente
   */
  async getUserOrders(userId, languageCode) {
    return await orderDAO.getOrdersByUserId(userId, languageCode);
  },

  /**
   * Recupera gli indirizzi di un utente
   * @param {string} userId - ID dell'utente di cui recuperare gli indirizzi
   * @returns {Promise<Array>} - Lista degli indirizzi dell'utente
   */
  async getUserAddresses(userId) {
    return await orderDAO.getAddressesByUserId(userId);
  },

  /**
   * Aggiunge un nuovo indirizzo per un utente
   * @param {string} userId - ID dell'utente a cui aggiungere l'indirizzo
   * @param {Object} addressData - Dati dell'indirizzo
   * @param {string} addressData.street - Via dell'indirizzo
   * @param {string} addressData.city - Città dell'indirizzo
   * @param {string} addressData.state - Stato dell'indirizzo
   * @param {string} addressData.zip - CAP dell'indirizzo
   * @param {string} addressData.country - Paese dell'indirizzo
   * @returns {Promise<Object>} - Dettagli dell'indirizzo aggiunto
   */
  async addUserAddress(userId, addressData) {
    return await orderDAO.addAddress(userId, addressData);
  }
};

module.exports = orderService;