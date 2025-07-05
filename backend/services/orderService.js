const orderDAO = require('../dao/orderDAO');
const userDAO = require('../dao/userDAO');
const emailService = require('./emailService');
const productDAO = require('../dao/productDAO');

const orderService = {
  async createNewOrder(userId, orderData) {
    // 1. Crea l'ordine nel DB
    const orderId = await orderDAO.createOrder(userId, orderData);

    // 2. Recupera i dettagli completi degli articoli per l'email
    const variantIds = orderData.items.map(item => item.variantId);
    const itemDetailsMap = await productDAO.getOrderItemDetails(variantIds, 'it-IT'); // O la lingua dell'utente

    // 3. Arricchisci gli articoli dell'ordine con nomi e immagini
    const itemsForEmail = orderData.items.map(item => {
      const details = itemDetailsMap.get(item.variantId);
      return {
        ...item,
        productName: details ? details.productName : 'Prodotto non trovato',
        imageUrl: details ? details.imageUrl : null // URL completo per l'email
      };
    });

    // 4. Prepara e invia l'email di conferma
    const user = await userDAO.getUserById(userId);
    const emailDetails = {
      orderId: orderId,
      userName: user.first_name,
      items: itemsForEmail,
      totalAmount: orderData.totalAmount
    };
    emailService.sendOrderConfirmation(user.email, emailDetails).catch(console.error);

    return orderId;
  },

  async getUserAddresses(userId) {
    return await orderDAO.getAddressesByUserId(userId);
  },

  async addUserAddress(userId, addressData) {
    return await orderDAO.addAddress(userId, addressData);
  }
};

module.exports = orderService;