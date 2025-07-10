const orderDAO = require('../dao/orderDAO');
const userDAO = require('../dao/userDAO');
const emailService = require('./emailService');
const productDAO = require('../dao/productDAO');

const orderService = {
  async createNewOrder(userId, orderData) {
    const { orderId, paymentId } = await orderDAO.createOrder(userId, orderData);

    await orderDAO.addTrackingEvent(orderId, 'Ordine Confermato', 'Il tuo pagamento è in fase di elaborazione.');
    this.simulateShippingProcess(orderId, paymentId);

    const user = await userDAO.getUserById(userId);
    const variantIds = orderData.items.map(item => item.variantId);
    const itemDetailsMap = await productDAO.getOrderItemDetails(variantIds, user.language_code || 'it-IT');

    const itemsForEmail = orderData.items.map(item => {
        const details = itemDetailsMap.get(item.variantId);
        return { ...item, productName: details?.productName, imageUrl: details?.imageUrl };
    });

    const emailDetails = { orderId, userName: user.first_name, items: itemsForEmail, totalAmount: orderData.totalAmount };
    emailService.sendOrderConfirmation(user.email, emailDetails).catch(console.error);

    return orderId;
  },

  simulateShippingProcess(orderId, paymentId) {
    // Simula la conferma del pagamento dopo 10 secondi
    setTimeout(async () => {
      const transactionId = `txn_${Date.now()}`;
      await orderDAO.updatePaymentStatus(paymentId, 'succeeded', transactionId);
      await orderDAO.addTrackingEvent(orderId, 'Pagamento Approvato', `Transazione ${transactionId} completata.`);
      console.log(`Payment for order ${orderId} confirmed.`);
    }, 10 * 1000); // 10 secondi

    // Simula la spedizione dopo 1 minuto
    setTimeout(async () => {
      const trackingNumber = `BRT${Date.now()}`;
      await orderDAO.updateOrderStatus(orderId, 'shipped', trackingNumber);
      await orderDAO.addTrackingEvent(orderId, 'Spedito', `Il pacco è in viaggio. Tracking: ${trackingNumber}`);
      console.log(`Order ${orderId} has been shipped.`);
    }, 60 * 1000); // 1 minuto

    // Simula la consegna dopo 3 minuti
    setTimeout(async () => {
      await orderDAO.updateOrderStatus(orderId, 'delivered');
      await orderDAO.addTrackingEvent(orderId, 'Consegnato', 'Il tuo pacco è stato consegnato.');
      console.log(`Order ${orderId} has been delivered.`);
    }, 3 * 60 * 1000); // 3 minuti
  },

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

  async getUserAddresses(userId) {
    return await orderDAO.getAddressesByUserId(userId);
  },

  async addUserAddress(userId, addressData) {
    return await orderDAO.addAddress(userId, addressData);
  }
};

module.exports = orderService;