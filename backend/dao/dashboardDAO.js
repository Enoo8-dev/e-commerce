const dbPool = require('../config/database');

const dashboardDAO = {

  /**
   * 
   * @returns {Promise<Object>} Returns an object with KPI statistics:
   * - totalRevenue: Total revenue from delivered orders
   * - totalOrders: Total number of orders
   * - newUsers: Number of new users in the last 30 days
   * - activeProducts: Number of active products
   */
  async getKpiStats() {
    const sql = `
      SELECT
        (SELECT SUM(total_amount) FROM Orders WHERE status = 'delivered') as totalRevenue,
        (SELECT COUNT(id) FROM Orders) as totalOrders,
        (SELECT COUNT(id) FROM Users WHERE role = 'customer' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as newUsers,
        (SELECT COUNT(id) FROM Products WHERE is_active = TRUE) as activeProducts
    `;
    const [rows] = await dbPool.query(sql);
    return rows[0];
  },

  /**
   * Gets sales data for the last 30 days, grouped by date.
   * @returns {Promise<Array>} Returns an array of objects with date and daily revenue.
   */
  async getSalesLast30Days() {
    const sql = `
      SELECT 
        DATE(order_date) as date, 
        SUM(total_amount) as dailyRevenue
      FROM Orders
      WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(order_date)
      ORDER BY date ASC;
    `;
    const [rows] = await dbPool.query(sql);
    return rows;
  },

  /**
   * Gets the most popular products based on order count.
   * @param {number} limit - Maximum number of products to return.
   * @returns {Promise<Array>} Returns an array of objects with product name, SKU, and order count.
   */
  async getRecentOrders(limit = 5) {
    const sql = `
      SELECT o.id, o.total_amount, o.status, o.order_date, u.first_name, u.last_name
      FROM Orders o
      JOIN Users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
      LIMIT ?;
    `;
    const [rows] = await dbPool.query(sql, [limit]);
    return rows;
  },

  /**
   * 
   * @param {string} languageCode ISO language code for product names (default 'en-US')
   * @param {number} limit Maximum number of low stock products to return (default 5)
   * @return {Promise<Array>} Returns an array of objects with product name, SKU, and stock quantity for low stock products.
   */
  async getLowStockProducts(languageCode = 'en-US', limit = 5) {
      const sql = `
        SELECT pt.name, pv.sku, pv.stock_quantity
        FROM Product_Variants pv
        JOIN Products p ON pv.product_id = p.id
        JOIN Product_Translations pt ON p.id = pt.product_id AND pt.language_code = ?
        WHERE pv.stock_quantity < 10 AND pv.is_active = TRUE
        ORDER BY pv.stock_quantity ASC
        LIMIT ?;
      `;
      const [rows] = await dbPool.query(sql, [languageCode, limit]);
      return rows;
  }
};

module.exports = dashboardDAO;