import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Package, Search, Download, ChevronDown, ChevronUp, AlertTriangle, TrendingDown } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/Stock.css';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function Stock() {
    const products = useStore(s => s.products);
    const dispatchLogs = useStore(s => s.dispatchLogs);
    const productionLogs = useStore(s => s.productionLogs);

    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showDispatches, setShowDispatches] = useState(true);
    const [sortBy, setSortBy] = useState('name'); // name, quantity, category
    const [sortDir, setSortDir] = useState('asc');

    // Categories from products
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return cats.sort();
    }, [products]);

    // Filtered & sorted products
    const filteredProducts = useMemo(() => {
        let list = products.filter(p => {
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q) ||
                (p.supplier || '').toLowerCase().includes(q);

            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

            let matchesStock = true;
            if (stockFilter === 'In Stock') matchesStock = p.quantity > p.minStock;
            else if (stockFilter === 'Low Stock') matchesStock = p.quantity > 0 && p.quantity <= p.minStock;
            else if (stockFilter === 'Out of Stock') matchesStock = p.quantity === 0;

            return matchesSearch && matchesCategory && matchesStock;
        });

        list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortBy === 'quantity') cmp = a.quantity - b.quantity;
            else if (sortBy === 'category') cmp = (a.category || '').localeCompare(b.category || '');
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return list;
    }, [products, search, stockFilter, categoryFilter, sortBy, sortDir]);

    // Stats
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalStock = products.reduce((s, p) => s + p.quantity, 0);
        const totalValue = products.reduce((s, p) => s + p.quantity * p.price, 0);
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
        const outOfStock = products.filter(p => p.quantity === 0).length;
        return { totalProducts, totalStock, totalValue, lowStock, outOfStock };
    }, [products]);

    // Recent dispatches (last 15)
    const recentDispatches = useMemo(() => dispatchLogs.slice(0, 15), [dispatchLogs]);

    // Today's production & dispatch totals
    const todayActivity = useMemo(() => {
        const todayDate = new Date().toDateString();
        const produced = productionLogs
            .filter(l => new Date(l.enteredAt).toDateString() === todayDate)
            .reduce((s, l) => s + l.quantityProduced, 0);
        const dispatched = dispatchLogs
            .filter(l => new Date(l.enteredAt).toDateString() === todayDate)
            .reduce((s, l) => s + l.quantityDispatched, 0);
        return { produced, dispatched };
    }, [productionLogs, dispatchLogs]);

    const getStockStatus = (product) => {
        if (product.quantity === 0) return { label: 'Out of Stock', color: 'red' };
        if (product.quantity <= product.minStock) return { label: 'Low Stock', color: 'orange' };
        return { label: 'In Stock', color: 'green' };
    };

    const getStockPercent = (product) => {
        if (product.minStock === 0) return 100;
        return Math.min(100, Math.round((product.quantity / (product.minStock * 2)) * 100));
    };

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
    };

    const handleExport = () => {
        if (filteredProducts.length === 0) return;
        exportToCSV(filteredProducts.map(p => {
            const status = getStockStatus(p);
            return {
                'Product Name': p.name,
                'SKU': p.sku,
                'Category': p.category || '',
                'Current Stock': p.quantity,
                'Min Stock': p.minStock,
                'Status': status.label,
                'Price': p.price,
                'Value': (p.quantity * p.price).toFixed(2),
                'Location': p.location || '',
                'Supplier': p.supplier || '',
            };
        }), `stock-report-${todayStr()}.csv`);
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return null;
        return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    return (
        <div className="stock-page">
            <div className="stock-header">
                <div>
                    <h1><Package size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Stock Overview</h1>
                    <p>Real-time view of all product stock levels</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExport} disabled={filteredProducts.length === 0}>
                    <Download size={16} /> Export Stock Report
                </button>
            </div>

            {/* Stats */}
            <div className="stock-stats">
                <div className="stock-stat stock-stat-blue">
                    <div className="stock-stat-num">{stats.totalProducts}</div>
                    <div className="stock-stat-label">Total Products</div>
                </div>
                <div className="stock-stat stock-stat-green">
                    <div className="stock-stat-num">{stats.totalStock}</div>
                    <div className="stock-stat-label">Total Stock Units</div>
                </div>
                <div className="stock-stat stock-stat-purple">
                    <div className="stock-stat-num">₹{stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <div className="stock-stat-label">Inventory Value</div>
                </div>
                <div className="stock-stat stock-stat-orange">
                    <div className="stock-stat-num">{stats.lowStock}</div>
                    <div className="stock-stat-label">Low Stock Items</div>
                </div>
                <div className="stock-stat stock-stat-red">
                    <div className="stock-stat-num">{stats.outOfStock}</div>
                    <div className="stock-stat-label">Out of Stock</div>
                </div>
            </div>

            {/* Today Activity */}
            <div className="stock-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <div className="stock-stat stock-stat-green">
                    <div className="stock-stat-num">+{todayActivity.produced}</div>
                    <div className="stock-stat-label">Produced Today</div>
                </div>
                <div className="stock-stat stock-stat-red">
                    <div className="stock-stat-num">{todayActivity.dispatched}</div>
                    <div className="stock-stat-label">Dispatched Today</div>
                </div>
            </div>

            {/* Filters */}
            <div className="stock-filters">
                <div style={{ position: 'relative', flex: '1', maxWidth: '280px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.25rem' }} />
                </div>
                <select className="select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                    <option value="All">All Stock</option>
                    <option value="In Stock">✅ In Stock</option>
                    <option value="Low Stock">⚠️ Low Stock</option>
                    <option value="Out of Stock">❌ Out of Stock</option>
                </select>
                <select className="select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Stock Table */}
            <div className="stock-card">
                <div className="stock-table-wrap desktop-only">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Product <SortIcon col="name" /></th>
                                <th>SKU</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>Category <SortIcon col="category" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('quantity')}>Current Stock <SortIcon col="quantity" /></th>
                                <th>Min Stock</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>No products found</td></tr>
                            ) : filteredProducts.map(product => {
                                const status = getStockStatus(product);
                                const percent = getStockPercent(product);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className={`stock-dot stock-dot-${status.color}`} />
                                                <div>
                                                    <div className="stock-product-name">{product.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="stock-product-sku" style={{ fontSize: '0.85rem' }}>{product.sku}</span></td>
                                        <td>{product.category ? <span className="stock-product-cat">{product.category}</span> : '—'}</td>
                                        <td><strong style={{ fontSize: '1.05rem' }}>{product.quantity}</strong></td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{product.minStock}</td>
                                        <td>
                                            <div className="stock-bar-wrap">
                                                <div className={`stock-bar stock-bar-${status.color}`} style={{ width: `${percent}%` }} />
                                            </div>
                                        </td>
                                        <td><span className={`stock-badge stock-badge-${status.color}`}>{status.label}</span></td>
                                        <td style={{ fontWeight: 600 }}>₹{(product.quantity * product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="stock-mobile-cards">
                    {filteredProducts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No products found</p>
                    ) : filteredProducts.map(product => {
                        const status = getStockStatus(product);
                        return (
                            <div key={product.id} className="stock-mobile-card">
                                <div className="stock-mobile-card-header">
                                    <div>
                                        <div className="stock-mobile-card-name">
                                            <span className={`stock-dot stock-dot-${status.color}`} />
                                            {product.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{product.sku}</div>
                                    </div>
                                    <span className={`stock-badge stock-badge-${status.color}`}>{status.label}</span>
                                </div>
                                <div className="stock-mobile-card-details">
                                    <span>Stock: <strong>{product.quantity}</strong></span>
                                    <span>Min: <strong>{product.minStock}</strong></span>
                                    {product.category && <span>Cat: <strong>{product.category}</strong></span>}
                                    <span>Value: <strong>₹{(product.quantity * product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Dispatches */}
            <div className="stock-card">
                <button className="stock-toggle" onClick={() => setShowDispatches(v => !v)}>
                    <span><TrendingDown size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Recent Dispatches ({recentDispatches.length})</span>
                    {showDispatches ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showDispatches && (
                    <div>
                        {recentDispatches.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No dispatches yet</p>
                        ) : recentDispatches.map(log => (
                            <div key={log.id} className="stock-dispatch-item">
                                <div className="stock-dispatch-left">
                                    <span className="stock-dispatch-qty">{log.quantityDispatched}</span>
                                    <div>
                                        <div className="stock-dispatch-product">{log.productName}</div>
                                        <div className="stock-dispatch-customer">👤 {log.customerName}{log.vehicleType ? ` • 🚛 ${log.vehicleType}` : ''}</div>
                                    </div>
                                </div>
                                <span className="stock-dispatch-date">{new Date(log.enteredAt).toLocaleDateString()} {new Date(log.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Low Stock Alerts */}
            {stats.lowStock > 0 && (
                <div className="stock-card" style={{ borderColor: 'rgba(245,158,11,0.4)' }}>
                    <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontWeight: 700 }}>
                        <AlertTriangle size={18} /> Low Stock Alerts
                    </div>
                    <div style={{ padding: '0 1rem 1rem' }}>
                        {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                                <div>
                                    <strong>{p.name}</strong>
                                    <span style={{ color: 'var(--color-text-tertiary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{p.sku}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>{p.quantity} left</span>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Min: {p.minStock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
