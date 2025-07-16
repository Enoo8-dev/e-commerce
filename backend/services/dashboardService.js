const dashboardDAO = require('../dao/dashboardDAO');
const { subDays, format } = require('date-fns');

const dashboardService = {
  async getDashboardData(languageCode) {
    const kpiStats = await dashboardDAO.getKpiStats();
    const salesData = await dashboardDAO.getSalesLast30Days();
    const recentOrders = await dashboardDAO.getRecentOrders();
    const lowStockProducts = await dashboardDAO.getLowStockProducts(languageCode);

    // Prepara i dati per il grafico
    const salesChartData = {
      labels: [],
      data: []
    };
    const dateMap = new Map(salesData.map(item => [format(new Date(item.date), 'yyyy-MM-dd'), item.dailyRevenue]));

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM');

      salesChartData.labels.push(label);
      salesChartData.data.push(parseFloat(dateMap.get(formattedDate) || '0'));
    }

    return {
      kpiStats,
      salesChartData,
      recentOrders,
      lowStockProducts
    };
  }
};

module.exports = dashboardService;