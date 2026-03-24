import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Download,
  FileText,
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  formatCurrency,
  exportToCSV,
  generateInventoryReport,
  calculateStats,
} from '../utils/helpers';
import '../styles/Reports.css';

export default function Reports() {
  const products = useStore((state) => state.products);

  const stats = useMemo(() => calculateStats(products), [products]);

  const categoryData = useMemo(() => {
    const categoryMap = {};
    products.forEach((product) => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          products: 0,
          totalValue: 0,
          quantity: 0,
        };
      }
      categoryMap[product.category].products++;
      categoryMap[product.category].totalValue += product.price * product.quantity;
      categoryMap[product.category].quantity += product.quantity;
    });
    return Object.values(categoryMap);
  }, [products]);

  const locationData = useMemo(() => {
    const locationMap = {};
    products.forEach((product) => {
      if (!locationMap[product.location]) {
        locationMap[product.location] = {
          location: product.location,
          products: 0,
          totalValue: 0,
        };
      }
      locationMap[product.location].products++;
      locationMap[product.location].totalValue += product.price * product.quantity;
    });
    return Object.values(locationMap);
  }, [products]);

  const stockTrendData = useMemo(() => {
    // Simulated trend data - in a real app, this would come from historical data
    return [
      { month: 'Jan', inStock: 45, lowStock: 8, outOfStock: 2 },
      { month: 'Feb', inStock: 52, lowStock: 6, outOfStock: 1 },
      { month: 'Mar', inStock: 48, lowStock: 10, outOfStock: 3 },
      { month: 'Apr', inStock: 55, lowStock: 7, outOfStock: 2 },
      { month: 'May', inStock: 58, lowStock: 5, outOfStock: 1 },
      { month: 'Jun', inStock: stats.inStock, lowStock: stats.lowStock, outOfStock: stats.outOfStock },
    ];
  }, [stats]);

  const handleExportFull = () => {
    const reportData = generateInventoryReport(products);
    exportToCSV(reportData, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportLowStock = () => {
    const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock);
    const reportData = generateInventoryReport(lowStockProducts);
    exportToCSV(reportData, `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportByCategory = () => {
    exportToCSV(
      categoryData.map((item) => ({
        Category: item.category,
        'Product Count': item.products,
        'Total Quantity': item.quantity,
        'Total Value': item.totalValue.toFixed(2),
      })),
      `category-report-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="animate-fade-in">Reports & Analytics</h1>
          <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Export data and view inventory insights
          </p>
        </div>
      </div>

      {/* Export Actions */}
      <div className="export-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2>Export Reports</h2>
        <div className="export-grid">
          <button className="export-card" onClick={handleExportFull}>
            <FileText size={32} />
            <h3>Full Inventory</h3>
            <p>Export all products with complete details</p>
            <div className="export-btn">
              <Download size={16} />
              Export CSV
            </div>
          </button>

          <button className="export-card" onClick={handleExportLowStock}>
            <AlertTriangle size={32} />
            <h3>Low Stock Items</h3>
            <p>Export products that need reordering</p>
            <div className="export-btn">
              <Download size={16} />
              Export CSV
            </div>
          </button>

          <button className="export-card" onClick={handleExportByCategory}>
            <Package size={32} />
            <h3>By Category</h3>
            <p>Export summary grouped by categories</p>
            <div className="export-btn">
              <Download size={16} />
              Export CSV
            </div>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2>Inventory Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon summary-icon-primary">
              <Package size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Products</div>
              <div className="summary-value">{stats.totalProducts}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-success">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">In Stock</div>
              <div className="summary-value">{stats.inStock}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-warning">
              <AlertTriangle size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Low Stock</div>
              <div className="summary-value">{stats.lowStock}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-accent">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Value</div>
              <div className="summary-value">{formatCurrency(stats.totalValue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="chart-container">
          <h2>Value by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="category" stroke="#9ba3af" />
              <YAxis stroke="#9ba3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e2530',
                  border: '1px solid #2d3748',
                  borderRadius: '0.5rem',
                }}
                formatter={(value, name) => {
                  if (name === 'totalValue') return [formatCurrency(value), 'Total Value'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="products" fill="#00d9ff" name="Products" radius={[8, 8, 0, 0]} />
              <Bar dataKey="totalValue" fill="#ff6b35" name="Total Value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Stock Status Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#9ba3af" />
              <YAxis stroke="#9ba3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e2530',
                  border: '1px solid #2d3748',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="inStock" stroke="#10b981" strokeWidth={2} name="In Stock" />
              <Line type="monotone" dataKey="lowStock" stroke="#f59e0b" strokeWidth={2} name="Low Stock" />
              <Line type="monotone" dataKey="outOfStock" stroke="#ef4444" strokeWidth={2} name="Out of Stock" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Products by Location</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="location" stroke="#9ba3af" />
              <YAxis stroke="#9ba3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e2530',
                  border: '1px solid #2d3748',
                  borderRadius: '0.5rem',
                }}
                formatter={(value, name) => {
                  if (name === 'totalValue') return [formatCurrency(value), 'Total Value'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="products" fill="#f7931e" name="Products" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
