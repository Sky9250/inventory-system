import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Package, TrendingUp, AlertTriangle, XCircle, IndianRupee, ArrowRight, Factory, Truck, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency, getStockStatus } from '../utils/helpers';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const products = useStore(s => s.products);
  const productionLogs = useStore(s => s.productionLogs);
  const dispatchLogs = useStore(s => s.dispatchLogs);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: products.length,
      inStock: products.filter(p => p.quantity > p.minStock).length,
      lowStock: products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length,
      outOfStock: products.filter(p => p.quantity === 0).length,
      totalValue: products.reduce((t, p) => t + p.price * p.quantity, 0),
      todayProduced: productionLogs.filter(l => new Date(l.enteredAt).toDateString() === today).reduce((s, l) => s + l.quantityProduced, 0),
      todayDispatched: dispatchLogs.filter(l => new Date(l.enteredAt).toDateString() === today).reduce((s, l) => s + l.quantityDispatched, 0),
    };
  }, [products, productionLogs, dispatchLogs]);

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);

  const stockStatusData = [
    { name: 'In Stock', value: stats.inStock, color: '#10b981' },
    { name: 'Low Stock', value: stats.lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: stats.outOfStock, color: '#ef4444' },
  ];

  const recentActivity = useMemo(() => {
    const prod = productionLogs.slice(0, 6).map(l => ({ ...l, type: 'production' }));
    const disp = dispatchLogs.slice(0, 6).map(l => ({ ...l, type: 'dispatch' }));
    return [...prod, ...disp].sort((a, b) => new Date(b.enteredAt) - new Date(a.enteredAt)).slice(0, 8);
  }, [productionLogs, dispatchLogs]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toDateString();
      return {
        label: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
        produced: productionLogs.filter(l => new Date(l.enteredAt).toDateString() === ds).reduce((s, l) => s + l.quantityProduced, 0),
        dispatched: dispatchLogs.filter(l => new Date(l.enteredAt).toDateString() === ds).reduce((s, l) => s + l.quantityDispatched, 0),
      };
    });
  }, [productionLogs, dispatchLogs]);

  const topProducts = useMemo(() => [...products].sort((a, b) => b.price * b.quantity - a.price * a.quantity).slice(0, 5), [products]);

  const TT = { contentStyle: { backgroundColor: '#1e2530', border: '1px solid #2d3748', borderRadius: '0.5rem' } };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="animate-fade-in">Dashboard</h1>
          <p className="animate-fade-in">Full overview — Inventory, Production & Dispatch</p>
        </div>
      </div>

      <div className="stats-grid animate-fade-in">
        {[
          { title: 'Total Products', value: stats.total, icon: Package, color: 'info', link: '/products' },
          { title: 'In Stock', value: stats.inStock, icon: TrendingUp, color: 'success', link: '/products' },
          { title: 'Low Stock Alert', value: stats.lowStock, icon: AlertTriangle, color: 'warning', link: '/products' },
          { title: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'danger', link: '/products' },
        ].map((s, i) => {
          const Icon = s.icon; return (
            <Link key={i} to={s.link} className={`stat-card stat-card-${s.color}`}>
              <div className="stat-icon"><Icon size={24} /></div>
              <div className="stat-content"><div className="stat-title">{s.title}</div><div className="stat-value">{s.value}</div></div>
            </Link>
          );
        })}
      </div>

      <div className="today-activity animate-fade-in">
        <Link to="/production" className="today-card today-card-green">
          <div className="today-icon"><Factory size={28} /></div>
          <div className="today-content"><div className="today-label">Today's Production</div><div className="today-value">{stats.todayProduced} <span>units</span></div></div>
          <ArrowRight size={20} className="today-arrow" />
        </Link>
        <Link to="/dispatch" className="today-card today-card-orange">
          <div className="today-icon"><Truck size={28} /></div>
          <div className="today-content"><div className="today-label">Today's Dispatch</div><div className="today-value">{stats.todayDispatched} <span>units</span></div></div>
          <ArrowRight size={20} className="today-arrow" />
        </Link>
        <div className="today-card today-card-accent">
          <div className="today-icon"><IndianRupee size={28} /></div>
          <div className="today-content"><div className="today-label">Total Inventory Value</div><div className="today-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats.totalValue)}</div></div>
        </div>
      </div>

      <div className="charts-grid animate-fade-in">
        <div className="chart-card chart-wide">
          <h3><Activity size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Production vs Dispatch — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="label" stroke="#9ba3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ba3af" />
              <Tooltip {...TT} />
              <Legend />
              <Bar dataKey="produced" name="Produced" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="dispatched" name="Dispatched" fill="#ff6b35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Stock Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stockStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={90} dataKey="value">
                {stockStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>By Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#9ba3af" />
              <YAxis dataKey="name" type="category" stroke="#9ba3af" width={110} tick={{ fontSize: 11 }} />
              <Tooltip {...TT} />
              <Bar dataKey="value" name="Products" fill="#00d9ff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tables-grid animate-fade-in">
        <div className="table-card">
          <div className="table-header">
            <h3>Recent Activity</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/production" className="table-link">Production</Link>
              <span style={{ color: 'var(--color-text-tertiary)' }}>|</span>
              <Link to="/dispatch" className="table-link">Dispatch</Link>
            </div>
          </div>
          {recentActivity.length === 0
            ? <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No activity yet. Add production or dispatch entries.</p>
            : <div className="table-responsive"><table className="data-table">
              <thead><tr><th>Type</th><th>Product</th><th>Qty</th><th>By</th><th>Time</th></tr></thead>
              <tbody>
                {recentActivity.map(a => (
                  <tr key={a.id + a.type}>
                    <td><span className={`badge ${a.type === 'production' ? 'badge-success' : 'badge-warning'}`}>{a.type === 'production' ? '🏭 Produced' : '🚚 Dispatched'}</span></td>
                    <td><div className="product-name">{a.productName}</div></td>
                    <td><span className={`qty-badge ${a.type === 'production' ? 'qty-green' : 'qty-red'}`}>{a.type === 'production' ? '+' : '-'}{a.quantityProduced || a.quantityDispatched}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{a.enteredBy}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{new Date(a.enteredAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          }
        </div>
        <div className="table-card">
          <div className="table-header">
            <h3>Top Products by Value</h3>
            <Link to="/products" className="table-link">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="table-responsive"><table className="data-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Status</th><th>Value</th></tr></thead>
            <tbody>
              {topProducts.map(p => {
                const st = getStockStatus(p.quantity, p.minStock); return (
                  <tr key={p.id}>
                    <td><div className="product-cell"><div className="product-name">{p.name}</div><div className="product-category">{p.sku}</div></div></td>
                    <td>{p.quantity}</td>
                    <td><span className={`badge badge-${st.color}`}>{st.status}</span></td>
                    <td className="value-cell">{formatCurrency(p.price * p.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
