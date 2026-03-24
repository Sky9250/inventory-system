import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, User, Factory, Truck, Cog, Zap, TrendingUp, Layers, Warehouse } from 'lucide-react';
import '../styles/Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore(s => s.user);
  const logout = useStore(s => s.logout);
  const getLowStockProducts = useStore(s => s.getLowStockProducts);

  const lowStockCount = getLowStockProducts().length;

  const handleLogout = () => { logout(); navigate('/'); };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
    { name: 'Stock', path: '/stock', icon: Warehouse },
    { name: 'Production Reports', path: '/production', icon: TrendingUp },
    { name: 'Machine Entry', path: '/machine-production', icon: Cog },
    { name: 'Electricity', path: '/electricity', icon: Zap },
    { name: 'Raw Materials', path: '/raw-materials', icon: Layers },
    { name: 'Dispatch', path: '/dispatch', icon: Truck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const roleColors = { admin: '#ff6b35', production: '#10b981', dispatch: '#3b82f6', manager: '#f59e0b' };

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"><Package size={28} /><span>Inventory</span></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={20} />
                <span>{item.name}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><User size={16} /></div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role" style={{ color: roleColors[user?.role] || 'var(--color-text-tertiary)' }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}><LogOut size={16} />Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="main-content">
        <header className="main-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="header-user">
            {lowStockCount > 0 && (
              <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-warning)', fontSize: '0.8125rem', textDecoration: 'none', padding: '0.375rem 0.75rem', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.3)' }}>
                ⚠️ {lowStockCount} low stock
              </Link>
            )}
            <div className="user-avatar"><User size={16} /></div>
            <span>{user?.name}</span>
          </div>
        </header>
        <main className="main-body">{children}</main>
      </div>
    </div>
  );
}
