const orderDAO = require('../dao/orderDAO');
const userDAO = require('../dao/userDAO');
const emailService = require('./emailService');
const productDAO = require('../dao/productDAO');

const orderService = {
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

  simulateShippingProcess(orderId, paymentId) {
    // Simula la conferma del pagamento
    setTimeout(async () => {
      const transactionId = `txn_${Date.now()}`;
      await orderDAO.updatePaymentStatus(paymentId, 'succeeded', transactionId);
      const notes = JSON.stringify({ key: 'ORDER_TRACKING.NOTE_PAYMENT_APPROVED', params: { transactionId } });
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.PAYMENT_APPROVED', notes);
      console.log(`Payment for order ${orderId} confirmed.`);
    }, 10 * 1000);

    // Simula la spedizione
    setTimeout(async () => {
      const trackingNumber = `${Date.now()}`;
      await orderDAO.updateOrderStatus(orderId, 'shipped', trackingNumber);
      const notes = JSON.stringify({ key: 'ORDER_TRACKING.NOTE_SHIPPED', params: { trackingNumber } });
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.ORDER_SHIPPED', notes);
      console.log(`Order ${orderId} has been shipped.`);
    }, 60 * 1000);

    // Simula la consegna
    setTimeout(async () => {
      await orderDAO.updateOrderStatus(orderId, 'delivered');
      await orderDAO.addTrackingEvent(orderId, 'ORDER_TRACKING.DELIVRED', 'ORDER_TRACKING.NOTE_DELIVERED');
      console.log(`Order ${orderId} has been delivered.`);
    }, 3 * 60 * 1000);
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

  async getUserOrders(userId, languageCode) {
    return await orderDAO.getOrdersByUserId(userId, languageCode);
  },

  async getUserAddresses(userId) {
    return await orderDAO.getAddressesByUserId(userId);
  },

  async addUserAddress(userId, addressData) {
    return await orderDAO.addAddress(userId, addressData);
  }
};

module.exports = orderService;