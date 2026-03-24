import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Plus, X, CheckCircle, AlertTriangle, Download, ChevronDown, ChevronUp,
  Settings, Package, Trash2, Edit2, Check, Factory
} from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/MachineProduction.css';

const todayStr = () => new Date().toISOString().split('T')[0];
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); };

// ─── Quick Add Product Modal ───────────────────────────────────────────────
function QuickAddProduct({ onClose, onAdded }) {
  const addProduct = useStore(s => s.addProduct);
  const categories = useStore(s => s.categories);
  const [form, setForm] = useState({ name: '', sku: '', category: categories[0] || '', quantity: '0', minStock: '0', price: '0', supplier: '', description: '' });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.sku.trim()) { setError('SKU is required'); return; }
    addProduct({ ...form, quantity: parseInt(form.quantity) || 0, minStock: parseInt(form.minStock) || 0, price: parseFloat(form.price) || 0 });
    onAdded(form.name);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Package size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Quick Add New Product</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="quick-error">{error}</div>}
          <div className="quick-grid">
            <div className="form-group">
              <label className="label">Product Name <span className="required">*</span></label>
              <input className="input" placeholder="e.g. Panel Float" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">SKU <span className="required">*</span></label>
              <input className="input" placeholder="e.g. PF-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Starting Stock</label>
              <input type="number" className="input" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Min Stock Alert</label>
              <input type="number" className="input" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Price</label>
              <input type="number" className="input" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="label">Supplier</label>
              <input className="input" placeholder="Supplier name" value={form.supplier} onChange={e => set('supplier', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}><Plus size={16} /> Add Product</button>
        </div>
      </div>
    </div>
  );
}

// ─── Machine Manager ────────────────────────────────────────────────────────
function MachineManager({ onClose }) {
  const machines = useStore(s => s.machines);
  const addMachine = useStore(s => s.addMachine);
  const updateMachine = useStore(s => s.updateMachine);
  const deleteMachine = useStore(s => s.deleteMachine);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) { setError('Enter machine name'); return; }
    const ok = addMachine({ name: newName });
    if (ok) { setNewName(''); setError(''); }
    else setError('Machine name already exists');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Settings size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Manage Machines ({machines.length})</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="mgr-add-row">
            <input className="input" placeholder="New machine name, e.g. Machine 6" value={newName}
              onChange={e => { setNewName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} />Add</button>
          </div>
          {error && <p className="mgr-error">{error}</p>}
          <div className="mgr-list">
            {machines.map(m => (
              <div key={m.id} className="mgr-item">
                {editId === m.id ? (
                  <div className="mgr-edit-row">
                    <input className="input" value={editVal} onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { updateMachine(m.id, { name: editVal }); setEditId(null); } if (e.key === 'Escape') setEditId(null); }}
                      autoFocus />
                    <button className="btn-icon btn-icon-success" onClick={() => { updateMachine(m.id, { name: editVal }); setEditId(null); }}><Check size={15} /></button>
                    <button className="btn-icon btn-icon-cancel" onClick={() => setEditId(null)}><X size={15} /></button>
                  </div>
                ) : (
                  <div className="mgr-item-row">
                    <div className="mgr-dot" style={{ background: m.status === 'Active' ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
                    <span className="mgr-name">{m.name}</span>
                    <select className="select mgr-status" value={m.status} onChange={e => updateMachine(m.id, { status: e.target.value })}>
                      <option>Active</option><option>Maintenance</option><option>Inactive</option>
                    </select>
                    <button className="btn-icon btn-icon-edit" onClick={() => { setEditId(m.id); setEditVal(m.name); }}><Edit2 size={14} /></button>
                    <button className="btn-icon btn-icon-delete" onClick={() => { if (window.confirm(`Delete ${m.name}?`)) deleteMachine(m.id); }}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MachineProduction() {
  const products = useStore(s => s.products);
  const machines = useStore(s => s.machines);
  const productionLogs = useStore(s => s.productionLogs);
  const addProductionEntry = useStore(s => s.addProductionEntry);
  const deleteProductionLog = useStore(s => s.deleteProductionLog);
  const editProductionLog = useStore(s => s.editProductionLog);
  const user = useStore(s => s.user);

  // Each machine gets its own row in the entry form
  const makeRows = () => machines.map(m => ({
    machineId: m.id, machineName: m.name,
    productId: '', okQty: '', okWeight: '', rejQty: '', rejWeight: '',
  }));

  const [rows, setRows] = useState(() => makeRows());
  const [date, setDate] = useState(todayStr());
  const [shift, setShift] = useState('Morning');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [showMachineManager, setShowMachineManager] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({});

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const updateRow = (machineId, field, value) =>
    setRows(rs => rs.map(r => r.machineId === machineId ? { ...r, [field]: value } : r));

  // Sync rows when machines change
  const syncRows = () => setRows(makeRows());

  const validRows = rows.filter(r => r.productId && (parseInt(r.okQty) > 0 || parseInt(r.rejQty) > 0));

  const handleSubmit = () => {
    if (validRows.length === 0) { showToast('Fill at least one machine row with product & quantity', 'error'); return; }
    setSubmitting(true);
    let count = 0;
    validRows.forEach(row => {
      const result = addProductionEntry({
        machineId: row.machineId,
        productId: row.productId,
        quantityProduced: parseInt(row.okQty) || 0,
        okWeight: row.okWeight,
        rejectedQty: parseInt(row.rejQty) || 0,
        rejectedWeight: row.rejWeight,
        shift, date,
        source: 'machine', // Mark as from machine entry
      });
      if (result.success) count++;
    });
    setTimeout(() => {
      showToast(`✅ ${count} machine entr${count === 1 ? 'y' : 'ies'} submitted! Stock updated.`);
      setRows(makeRows());
      setSubmitting(false);
    }, 300);
  };

  const handleExport = (type) => {
    let logs = productionLogs;
    if (type === 'today') logs = productionLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    else if (type === 'yesterday') logs = productionLogs.filter(l => new Date(l.enteredAt).toDateString() === yesterdayStr());
    else if (type === 'date' && filterDate) logs = productionLogs.filter(l => l.enteredAt.startsWith(filterDate));
    if (logs.length === 0) { showToast('No data for this period', 'error'); return; }
    exportToCSV(logs.map(l => ({
      'Date': new Date(l.enteredAt).toLocaleDateString(),
      'Time': new Date(l.enteredAt).toLocaleTimeString(),
      'Machine': l.machineName || '',
      'Product': l.productName,
      'SKU': l.productSku,
      'OK Qty': l.quantityProduced,
      'OK Weight (kg)': l.okWeight || '',
      'Rejected Qty': l.rejectedQty || 0,
      'Rejected Weight (kg)': l.rejectedWeight || '',
      'Shift': l.shift,
      'Stock Before': l.stockBefore,
      'Stock After': l.stockAfter,
      'Entered By': l.enteredBy,
    })), `machine-production-${type}-${todayStr()}.csv`);
    showToast('Exported! Open in Excel.');
  };

  // ─── Stats ───────────────────────────────────────────────────────────────
  const todayLogs = useMemo(() => productionLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString()), [productionLogs]);
  const yesterdayLogs = useMemo(() => productionLogs.filter(l => new Date(l.enteredAt).toDateString() === yesterdayStr()), [productionLogs]);

  const todayStats = useMemo(() => ({
    okQty: todayLogs.reduce((s, l) => s + (l.quantityProduced || 0), 0),
    okWeight: todayLogs.reduce((s, l) => s + (parseFloat(l.okWeight) || 0), 0).toFixed(2),
    rejQty: todayLogs.reduce((s, l) => s + (l.rejectedQty || 0), 0),
    rejWeight: todayLogs.reduce((s, l) => s + (parseFloat(l.rejectedWeight) || 0), 0).toFixed(2),
    entries: todayLogs.length,
  }), [todayLogs]);

  const yesterdayStats = useMemo(() => ({
    okQty: yesterdayLogs.reduce((s, l) => s + (l.quantityProduced || 0), 0),
    okWeight: yesterdayLogs.reduce((s, l) => s + (parseFloat(l.okWeight) || 0), 0).toFixed(2),
    rejQty: yesterdayLogs.reduce((s, l) => s + (l.rejectedQty || 0), 0),
    entries: yesterdayLogs.length,
  }), [yesterdayLogs]);

  const filteredLogs = useMemo(() => {
    if (!filterDate) return productionLogs;
    return productionLogs.filter(l => l.enteredAt.startsWith(filterDate));
  }, [productionLogs, filterDate]);

  const canDelete = user?.role === 'admin' || user?.role === 'manager';


  return (
    <div className="mp-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mp-header">
        <div>
          <h1><Factory size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Machine Production</h1>
          <p>All 20 machines • Stock updates automatically</p>
        </div>
        <div className="mp-header-btns">
          <button className="btn btn-secondary" onClick={() => setShowQuickAdd(true)}>
            <Plus size={16} /> New Product
          </button>
          <button className="btn btn-secondary" onClick={() => { setShowMachineManager(true); }}>
            <Settings size={16} /> Manage Machines
          </button>
        </div>
      </div>

      {/* ── Today Summary ── */}
      <div className="mp-summary-grid">
        <div className="mp-summary-card mp-today">
          <div className="mp-summary-title">📅 Today</div>
          <div className="mp-summary-stats">
            <div className="mp-ss"><span className="mp-ss-num mp-green">{todayStats.okQty}</span><span className="mp-ss-label">OK Qty</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num mp-green">{todayStats.okWeight} kg</span><span className="mp-ss-label">OK Weight</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num mp-red">{todayStats.rejQty}</span><span className="mp-ss-label">Rejected</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num">{todayStats.entries}</span><span className="mp-ss-label">Entries</span></div>
          </div>
        </div>
        <div className="mp-summary-card mp-yesterday">
          <div className="mp-summary-title">📆 Yesterday</div>
          <div className="mp-summary-stats">
            <div className="mp-ss"><span className="mp-ss-num mp-green">{yesterdayStats.okQty}</span><span className="mp-ss-label">OK Qty</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num mp-green">{yesterdayStats.okWeight} kg</span><span className="mp-ss-label">OK Weight</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num mp-red">{yesterdayStats.rejQty}</span><span className="mp-ss-label">Rejected</span></div>
            <div className="mp-ss-divider" />
            <div className="mp-ss"><span className="mp-ss-num">{yesterdayStats.entries}</span><span className="mp-ss-label">Entries</span></div>
          </div>
        </div>
      </div>

      {/* ── Entry Form ── */}
      <div className="mp-card">
        <button className="bulk-toggle" onClick={() => setShowForm(v => !v)}>
          <span><Plus size={18} /> Daily Machine Production Entry</span>
          {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showForm && (
          <div className="mp-form">
            {/* Date + Shift */}
            <div className="mp-common">
              <div className="form-group">
                <label className="label">📅 Date</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">⏰ Shift</label>
                <select className="select" value={shift} onChange={e => setShift(e.target.value)}>
                  <option>Morning</option><option>Afternoon</option><option>Night</option>
                </select>
              </div>
              <div className="form-group mp-hint-box">
                <span>💡 Fill only the machines that ran today. Leave empty rows blank — they won't be submitted.</span>
              </div>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="mp-table-wrap desktop-only">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th className="th-machine">Machine</th>
                    <th className="th-product">Product Name</th>
                    <th className="th-num">✅ OK Qty</th>
                    <th className="th-num">✅ OK Weight (kg)</th>
                    <th className="th-num">📊 Avg Weight</th>
                    <th className="th-num">❌ Rej. Qty</th>
                    <th className="th-num">❌ Rej. Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const prod = products.find(p => p.id === row.productId);
                    const hasData = row.productId && (parseInt(row.okQty) > 0 || parseInt(row.rejQty) > 0);
                    return (
                      <tr key={row.machineId} className={hasData ? 'row-valid' : ''}>
                        <td><div className="mp-machine-name">{row.machineName}</div></td>
                        <td>
                          <div className="mp-product-cell">
                            <select className="select" value={row.productId} onChange={e => updateRow(row.machineId, 'productId', e.target.value)}>
                              <option value="">-- Select --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {prod && <div className="row-preview">Stock: {prod.quantity}{parseInt(row.okQty) > 0 ? ` → ${prod.quantity + (parseInt(row.okQty) || 0)}` : ''}</div>}
                          </div>
                        </td>
                        <td><input type="number" className="input mp-num-input" placeholder="0" min="0" value={row.okQty} onChange={e => updateRow(row.machineId, 'okQty', e.target.value)} /></td>
                        <td><input type="number" className="input mp-num-input" placeholder="0.00" min="0" step="0.01" value={row.okWeight} onChange={e => updateRow(row.machineId, 'okWeight', e.target.value)} /></td>
                        <td>
                          {row.okQty && row.okWeight ? (
                            <span className="mp-avg-weight">{(parseFloat(row.okWeight) / parseFloat(row.okQty)).toFixed(2)} kg</span>
                          ) : <span className="mp-inactive-text">—</span>}
                        </td>
                        <td><input type="number" className="input mp-num-input" placeholder="0" min="0" value={row.rejQty} onChange={e => updateRow(row.machineId, 'rejQty', e.target.value)} /></td>
                        <td><input type="number" className="input mp-num-input" placeholder="0.00" min="0" step="0.01" value={row.rejWeight} onChange={e => updateRow(row.machineId, 'rejWeight', e.target.value)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="mobile-only mp-mobile-rows">
              {rows.map(row => {
                const prod = products.find(p => p.id === row.productId);
                return (
                  <div key={row.machineId} className="mp-mobile-card">
                    <div className="mp-mobile-head">
                      <strong>{row.machineName}</strong>
                    </div>
                    <div className="form-group">
                      <label className="label">Product Name</label>
                      <select className="select" value={row.productId} onChange={e => updateRow(row.machineId, 'productId', e.target.value)}>
                        <option value="">-- Select Product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                      </select>
                      {prod && row.okQty > 0 && <div className="row-preview">Stock: {prod.quantity} → {prod.quantity + (parseInt(row.okQty) || 0)}</div>}
                    </div>
                    <div className="mp-mobile-2col">
                      <div className="form-group"><label className="label">✅ OK Qty</label><input type="number" className="input" placeholder="0" min="0" value={row.okQty} onChange={e => updateRow(row.machineId, 'okQty', e.target.value)} /></div>
                      <div className="form-group"><label className="label">✅ OK Weight kg</label><input type="number" className="input" placeholder="0.00" step="0.01" min="0" value={row.okWeight} onChange={e => updateRow(row.machineId, 'okWeight', e.target.value)} /></div>
                    </div>
                    {row.okQty && row.okWeight && (
                      <div className="mp-avg-display">
                        📊 Average Weight: <strong>{(parseFloat(row.okWeight) / parseFloat(row.okQty)).toFixed(2)} kg</strong> per unit
                      </div>
                    )}
                    <div className="mp-mobile-2col">
                      <div className="form-group"><label className="label">❌ Rejected Qty</label><input type="number" className="input" placeholder="0" min="0" value={row.rejQty} onChange={e => updateRow(row.machineId, 'rejQty', e.target.value)} /></div>
                      <div className="form-group"><label className="label">❌ Rej. Weight kg</label><input type="number" className="input" placeholder="0.00" step="0.01" min="0" value={row.rejWeight} onChange={e => updateRow(row.machineId, 'rejWeight', e.target.value)} /></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <div className="mp-submit-row">
              <span className="mp-ready-count">
                {validRows.length > 0 ? `${validRows.length} machine${validRows.length > 1 ? 's' : ''} ready to submit` : 'Fill machine rows above'}
              </span>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting || validRows.length === 0}>
                <CheckCircle size={18} />
                {submitting ? 'Submitting...' : `Submit ${validRows.length || ''} Machine Entr${validRows.length === 1 ? 'y' : 'ies'}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Export ── */}
      <div className="mp-card">
        <div className="mp-export">
          <h3><Download size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Machine Production</h3>
          <div className="mp-export-row">
            <button className="btn btn-secondary" onClick={() => handleExport('today')}><Download size={15} /> Today</button>
            <button className="btn btn-secondary" onClick={() => handleExport('yesterday')}><Download size={15} /> Yesterday</button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="input" style={{ maxWidth: '160px' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => handleExport('date')} disabled={!filterDate}><Download size={15} /> Export Date</button>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('all')}><Download size={15} /> Full History</button>
          </div>
        </div>
      </div>

      {/* ── History ── */}
      <div className="mp-card">
        <button className="bulk-toggle" onClick={() => setShowHistory(v => !v)}>
          <span>Production History ({filteredLogs.length} entries{filterDate ? ` — ${filterDate}` : ''})</span>
          {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showHistory && (
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="date" className="input" style={{ maxWidth: '180px' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              {filterDate && <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>Clear</button>}
            </div>
            {filteredLogs.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No entries found</p>
              : <>
                {/* Desktop */}
                <div className="mp-table-wrap desktop-only">
                  <table className="mp-table history-table">
                    <thead><tr>
                      <th>Date</th><th>Machine</th><th>Product</th>
                      <th>✅ OK Qty</th><th>✅ OK Wt.</th>
                      <th>❌ Rej Qty</th><th>❌ Rej Wt.</th>
                      <th>Stock→</th><th>Shift</th><th>By</th>
                      {canDelete && <th></th>}
                    </tr></thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td><div>{new Date(log.enteredAt).toLocaleDateString()}</div><div className="time-text">{new Date(log.enteredAt).toLocaleTimeString()}</div></td>
                          <td><strong>{log.machineName || '—'}</strong></td>
                          <td>{log.productName}</td>
                          <td><span className="qty-badge qty-green">+{log.quantityProduced}</span></td>
                          <td>{log.okWeight ? `${log.okWeight} kg` : '—'}</td>
                          <td>{log.rejectedQty > 0 ? <span className="qty-badge qty-red">{log.rejectedQty}</span> : '—'}</td>
                          <td>{log.rejectedWeight ? `${log.rejectedWeight} kg` : '—'}</td>
                          <td><span style={{ fontSize: '0.8rem' }}>{log.stockBefore}→<strong>{log.stockAfter}</strong></span></td>
                          <td><span className="shift-badge">{log.shift}</span></td>
                          <td style={{ fontSize: '0.8rem' }}>{log.enteredBy}</td>
                          {canDelete && <td style={{ whiteSpace: 'nowrap' }}><button className="btn-icon btn-icon-edit" title="Edit entry" onClick={() => { setEditingLog(log); setEditForm({ quantityProduced: log.quantityProduced, okWeight: log.okWeight || '', rejectedQty: log.rejectedQty || 0, rejectedWeight: log.rejectedWeight || '', shift: log.shift || 'Morning', date: log.date || '' }); }}><Edit2 size={13} /></button><button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm(log.id)}><Trash2 size={13} /></button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile */}
                <div className="mobile-only history-mobile">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="history-mobile-card">
                      <div className="history-mobile-top">
                        <div>
                          <div className="history-mobile-name">{log.machineName || '—'} — {log.productName}</div>
                          <div className="history-mobile-meta">{log.shift} • {new Date(log.enteredAt).toLocaleDateString()}</div>
                        </div>
                        <span className="qty-badge qty-green">+{log.quantityProduced}</span>
                      </div>
                      <div className="history-mobile-details">
                        {log.okWeight && <span>✅ {log.okWeight} kg</span>}
                        {log.rejectedQty > 0 && <span>❌ Rej: {log.rejectedQty}</span>}
                        {log.rejectedWeight && <span>❌ {log.rejectedWeight} kg</span>}
                        <span>Stock: {log.stockBefore}→<strong>{log.stockAfter}</strong></span>
                      </div>
                      {canDelete && <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}><button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditingLog(log); setEditForm({ quantityProduced: log.quantityProduced, okWeight: log.okWeight || '', rejectedQty: log.rejectedQty || 0, rejectedWeight: log.rejectedWeight || '', shift: log.shift || 'Morning', date: log.date || '' }); }}><Edit2 size={14} /> Edit</button><button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /> Delete</button></div>}
                    </div>
                  ))}
                </div>
              </>
            }
          </div>
        )}
      </div>

      {/* Modals */}
      {showMachineManager && <MachineManager onClose={() => { setShowMachineManager(false); setRows(makeRows()); }} />}
      {showQuickAdd && <QuickAddProduct onClose={() => setShowQuickAdd(false)} onAdded={(name) => showToast(`✅ "${name}" added to products!`)} />}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Entry?</h3></div>
            <div className="modal-body"><p>This will <strong>reverse the stock</strong> back. Are you sure?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteProductionLog(deleteConfirm); setDeleteConfirm(null); showToast('Deleted & stock reversed'); }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {editingLog && (
        <div className="modal-overlay" onClick={() => setEditingLog(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit2 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Edit Production Entry</h3>
              <button className="btn-icon" onClick={() => setEditingLog(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <strong>{editingLog.machineName || '—'}</strong> — {editingLog.productName} ({editingLog.productSku})
              </p>
              <div className="quick-grid">
                <div className="form-group">
                  <label className="label">✅ OK Qty</label>
                  <input type="number" className="input" min="0" value={editForm.quantityProduced} onChange={e => setEditForm(f => ({ ...f, quantityProduced: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">✅ OK Weight (kg)</label>
                  <input type="number" className="input" min="0" step="0.01" value={editForm.okWeight} onChange={e => setEditForm(f => ({ ...f, okWeight: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">❌ Rejected Qty</label>
                  <input type="number" className="input" min="0" value={editForm.rejectedQty} onChange={e => setEditForm(f => ({ ...f, rejectedQty: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">❌ Rejected Weight (kg)</label>
                  <input type="number" className="input" min="0" step="0.01" value={editForm.rejectedWeight} onChange={e => setEditForm(f => ({ ...f, rejectedWeight: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">⏰ Shift</label>
                  <select className="select" value={editForm.shift} onChange={e => setEditForm(f => ({ ...f, shift: e.target.value }))}>
                    <option>Morning</option><option>Afternoon</option><option>Night</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">📅 Date</label>
                  <input type="date" className="input" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              {editForm.quantityProduced != editingLog.quantityProduced && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--color-warning-bg,#fff8e1)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-warning-text,#f57f17)' }}>
                  ⚠️ Stock will adjust: {editingLog.quantityProduced} → {editForm.quantityProduced} (diff: {(parseInt(editForm.quantityProduced) || 0) - editingLog.quantityProduced > 0 ? '+' : ''}{(parseInt(editForm.quantityProduced) || 0) - editingLog.quantityProduced})
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingLog(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const result = editProductionLog(editingLog.id, editForm);
                if (result?.success) { showToast('✅ Entry updated & stock adjusted'); setEditingLog(null); }
                else showToast(result?.message || 'Failed to update', 'error');
              }}><Check size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
