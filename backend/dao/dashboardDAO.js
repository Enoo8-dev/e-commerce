const dbPool = require('../config/database');

const dashboardDAO = {
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