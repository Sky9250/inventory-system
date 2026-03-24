import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Download, Package, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X, Edit2, Settings } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/RawMaterials.css';

const todayStr = () => new Date().toISOString().split('T')[0];

// RM Item Manager Modal
function RMItemManager({ onClose }) {
  const rmItems = useStore(s => s.rmItems || []);
  const addRMItem = useStore(s => s.addRMItem);
  const updateRMItem = useStore(s => s.updateRMItem);
  const deleteRMItem = useStore(s => s.deleteRMItem);
  const rmCategories = useStore(s => s.rmCategories || []);
  const [form, setForm] = useState({ name: '', unit: 'kg', minStock: '0', category: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!form.name.trim()) { setError('Enter material name'); return; }
    const ok = addRMItem({ name: form.name, unit: form.unit, minStock: parseFloat(form.minStock) || 0, category: form.category });
    if (ok) { setForm({ name: '', unit: 'kg', minStock: '0', category: '' }); setError(''); }
    else setError('Material already exists');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Settings size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Manage Raw Materials</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="rm-add-form">
            <input className="input" placeholder="Material name (e.g. Steel Sheet)" value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }} />
            <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">-- Category --</option>
              {rmCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              <option>kg</option><option>ton</option><option>liter</option><option>meter</option><option>piece</option><option>box</option>
            </select>
            <input type="number" className="input" placeholder="Min stock" value={form.minStock}
              onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} />
            <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} />Add</button>
          </div>
          {error && <p className="rm-error">{error}</p>}
          <div className="rm-list">
            {rmItems.map(item => (
              <div key={item.id} className="rm-item">
                {editId === item.id ? (
                  <div className="rm-edit-row">
                    <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    <select className="select" value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">-- Category --</option>
                      {rmCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="select" value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}>
                      <option>kg</option><option>ton</option><option>liter</option><option>meter</option><option>piece</option><option>box</option>
                    </select>
                    <input type="number" className="input" value={editForm.minStock} onChange={e => setEditForm(f => ({ ...f, minStock: e.target.value }))} />
                    <button className="btn-icon btn-icon-success" onClick={() => { updateRMItem(item.id, { name: editForm.name, unit: editForm.unit, minStock: parseFloat(editForm.minStock), category: editForm.category || '' }); setEditId(null); }}><CheckCircle size={15} /></button>
                    <button className="btn-icon btn-icon-cancel" onClick={() => setEditId(null)}><X size={15} /></button>
                  </div>
                ) : (
                  <div className="rm-item-row">
                    <div className="rm-dot" style={{ background: item.quantity <= item.minStock ? 'var(--color-danger)' : 'var(--color-success)' }} />
                    <div style={{ flex: 1 }}>
                      <div className="rm-item-name">{item.name}{item.category && <span className="rm-cat-badge">{item.category}</span>}</div>
                      <div className="rm-item-meta">Stock: {item.quantity} {item.unit} • Min: {item.minStock} {item.unit}</div>
                    </div>
                    <button className="btn-icon btn-icon-edit" onClick={() => { setEditId(item.id); setEditForm({ name: item.name, unit: item.unit, minStock: item.minStock, category: item.category || '' }); }}><Edit2 size={14} /></button>
                    <button className="btn-icon btn-icon-delete" onClick={() => { if (window.confirm(`Delete ${item.name}?`)) deleteRMItem(item.id); }}><Trash2 size={14} /></button>
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

export default function RawMaterials() {
  const rmItems = useStore(s => s.rmItems || []);
  const rmInward = useStore(s => s.rmInward || []);
  const rmOutward = useStore(s => s.rmOutward || []);
  const addRMInward = useStore(s => s.addRMInward);
  const addRMOutward = useStore(s => s.addRMOutward);
  const deleteRMInward = useStore(s => s.deleteRMInward);
  const deleteRMOutward = useStore(s => s.deleteRMOutward);
  const editRMInward = useStore(s => s.editRMInward);
  const user = useStore(s => s.user);

  const [activeTab, setActiveTab] = useState('inward'); // inward, outward
  const [showManager, setShowManager] = useState(false);
  const [showInwardForm, setShowInwardForm] = useState(true);
  const [showOutwardForm, setShowOutwardForm] = useState(true);
  const [showInwardHistory, setShowInwardHistory] = useState(true);
  const [showOutwardHistory, setShowOutwardHistory] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editInwardEntry, setEditInwardEntry] = useState(null);
  const [editInwardForm, setEditInwardForm] = useState({});

  // Inward form
  const [inwardRows, setInwardRows] = useState([{ id: Date.now(), rmId: '', qty: '', rate: '', supplier: '', billNo: '', notes: '' }]);
  const [inwardDate, setInwardDate] = useState(todayStr());

  // Outward form
  const [outwardRows, setOutwardRows] = useState([{ id: Date.now(), rmId: '', qty: '', purpose: '', issuedTo: '', notes: '' }]);
  const [outwardDate, setOutwardDate] = useState(todayStr());

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const addInwardRow = () => setInwardRows(r => [...r, { id: Date.now() + Math.random(), rmId: '', qty: '', rate: '', supplier: '', billNo: '', notes: '' }]);
  const removeInwardRow = (id) => { if (inwardRows.length > 1) setInwardRows(r => r.filter(x => x.id !== id)); };
  const updateInwardRow = (id, field, value) => setInwardRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));

  const addOutwardRow = () => setOutwardRows(r => [...r, { id: Date.now() + Math.random(), rmId: '', qty: '', purpose: '', issuedTo: '', notes: '' }]);
  const removeOutwardRow = (id) => { if (outwardRows.length > 1) setOutwardRows(r => r.filter(x => x.id !== id)); };
  const updateOutwardRow = (id, field, value) => setOutwardRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));

  const validInwardRows = inwardRows.filter(r => r.rmId && parseFloat(r.qty) > 0);
  const validOutwardRows = outwardRows.filter(r => r.rmId && parseFloat(r.qty) > 0);

  const handleInwardSubmit = () => {
    if (validInwardRows.length === 0) { showToast('Add at least one material with quantity', 'error'); return; }
    let count = 0;
    validInwardRows.forEach(row => {
      const result = addRMInward({
        rmId: row.rmId,
        quantity: parseFloat(row.qty),
        rate: parseFloat(row.rate) || 0,
        supplier: row.supplier,
        billNo: row.billNo,
        date: inwardDate,
        notes: row.notes,
      });
      if (result.success) count++;
    });
    showToast(`✅ ${count} inward entr${count === 1 ? 'y' : 'ies'} recorded! Stock updated.`);
    setInwardRows([{ id: Date.now(), rmId: '', qty: '', rate: '', supplier: '', billNo: '', notes: '' }]);
  };

  const handleOutwardSubmit = () => {
    if (validOutwardRows.length === 0) { showToast('Add at least one material with quantity', 'error'); return; }
    let count = 0, errors = [];
    validOutwardRows.forEach(row => {
      const result = addRMOutward({
        rmId: row.rmId,
        quantity: parseFloat(row.qty),
        purpose: row.purpose,
        issuedTo: row.issuedTo,
        date: outwardDate,
        notes: row.notes,
      });
      if (result.success) count++;
      else errors.push(result.message);
    });
    if (count > 0) showToast(`✅ ${count} outward entr${count === 1 ? 'y' : 'ies'} recorded! Stock updated.`);
    if (errors.length > 0) setTimeout(() => showToast(errors[0], 'error'), 500);
    setOutwardRows([{ id: Date.now(), rmId: '', qty: '', purpose: '', issuedTo: '', notes: '' }]);
  };

  const handleExport = (type) => {
    const data = type === 'inward' ? rmInward : rmOutward;
    if (data.length === 0) { showToast('No data to export', 'error'); return; }
    const mapped = data.map(d => {
      const base = {
        'Date': d.date,
        'Material': d.rmName,
        'Quantity': `${d.quantity} ${d.unit}`,
        'Stock Before': d.stockBefore,
        'Stock After': d.stockAfter,
      };
      if (type === 'inward') return { ...base, 'Rate': d.rate, 'Amount': (d.quantity * d.rate).toFixed(2), 'Supplier': d.supplier || '', 'Bill No': d.billNo || '', 'Notes': d.notes || '' };
      return { ...base, 'Purpose': d.purpose || '', 'Issued To': d.issuedTo || '', 'Notes': d.notes || '' };
    });
    exportToCSV(mapped, `rm-${type}-${todayStr()}.csv`);
    showToast('Exported to Excel!');
  };

  const todayInward = useMemo(() => rmInward.filter(i => new Date(i.enteredAt).toDateString() === new Date().toDateString()), [rmInward]);
  const todayOutward = useMemo(() => rmOutward.filter(o => new Date(o.enteredAt).toDateString() === new Date().toDateString()), [rmOutward]);

  const lowStockItems = useMemo(() => rmItems.filter(i => i.quantity <= i.minStock), [rmItems]);

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="rm-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}<span>{toast.msg}</span></div>}

      <div className="rm-header">
        <div>
          <h1><Package size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Raw Materials</h1>
          <p>Track inward purchases and outward issues • Stock updates automatically</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowManager(true)}><Settings size={16} /> Manage Materials</button>
      </div>

      {/* Stats */}
      <div className="rm-stats">
        <div className="rm-stat rm-stat-green">
          <div className="rm-stat-num">{todayInward.length}</div>
          <div className="rm-stat-label">Inward Today</div>
        </div>
        <div className="rm-stat rm-stat-orange">
          <div className="rm-stat-num">{todayOutward.length}</div>
          <div className="rm-stat-label">Outward Today</div>
        </div>
        <div className="rm-stat rm-stat-red">
          <div className="rm-stat-num">{lowStockItems.length}</div>
          <div className="rm-stat-label">Low Stock Items</div>
        </div>
        <div className="rm-stat rm-stat-blue">
          <div className="rm-stat-num">{rmItems.length}</div>
          <div className="rm-stat-label">Total Materials</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rm-tabs">
        <button className={`rm-tab ${activeTab === 'inward' ? 'rm-tab-active' : ''}`} onClick={() => setActiveTab('inward')}>📥 Inward (Purchase)</button>
        <button className={`rm-tab ${activeTab === 'outward' ? 'rm-tab-active' : ''}`} onClick={() => setActiveTab('outward')}>📤 Outward (Issue)</button>
      </div>

      {/* Inward Section */}
      {activeTab === 'inward' && (
        <>
          <div className="rm-card">
            <button className="bulk-toggle" onClick={() => setShowInwardForm(v => !v)}>
              <span><Plus size={18} /> Raw Material Inward Entry</span>
              {showInwardForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showInwardForm && (
              <div className="rm-form">
                <div className="form-group" style={{ maxWidth: '200px', marginBottom: '1rem' }}>
                  <label className="label">📅 Purchase Date</label>
                  <input type="date" className="input" value={inwardDate} onChange={e => setInwardDate(e.target.value)} />
                </div>

                {/* Desktop */}
                <div className="rm-table-wrap desktop-only">
                  <table className="rm-table">
                    <thead><tr><th>Material</th><th>Quantity</th><th>Rate</th><th>Amount</th><th>Supplier</th><th>Bill No</th><th>Notes</th><th></th></tr></thead>
                    <tbody>
                      {inwardRows.map(row => {
                        const rm = rmItems.find(i => i.id === row.rmId);
                        const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0);
                        return (
                          <tr key={row.id} className={row.rmId && row.qty > 0 ? 'row-valid' : ''}>
                            <td>
                              <select className="select" value={row.rmId} onChange={e => updateInwardRow(row.id, 'rmId', e.target.value)}>
                                <option value="">-- Select --</option>
                                {rmItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                              </select>
                              {rm && row.qty > 0 && <div className="row-preview">Stock: {rm.quantity} → {rm.quantity + (parseFloat(row.qty) || 0)} {rm.unit}</div>}
                            </td>
                            <td><input type="number" className="input rm-num-input" placeholder="0" min="0" step="0.01" value={row.qty} onChange={e => updateInwardRow(row.id, 'qty', e.target.value)} /></td>
                            <td><input type="number" className="input rm-num-input" placeholder="0.00" min="0" step="0.01" value={row.rate} onChange={e => updateInwardRow(row.id, 'rate', e.target.value)} /></td>
                            <td><strong>{amount.toFixed(2)}</strong></td>
                            <td><input type="text" className="input" placeholder="Supplier" value={row.supplier} onChange={e => updateInwardRow(row.id, 'supplier', e.target.value)} /></td>
                            <td><input type="text" className="input" placeholder="Bill#" value={row.billNo} onChange={e => updateInwardRow(row.id, 'billNo', e.target.value)} /></td>
                            <td><input type="text" className="input" placeholder="Notes" value={row.notes} onChange={e => updateInwardRow(row.id, 'notes', e.target.value)} /></td>
                            <td><button className="btn-icon btn-icon-delete" onClick={() => removeInwardRow(row.id)} disabled={inwardRows.length === 1}><X size={14} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="mobile-only rm-mobile-rows">
                  {inwardRows.map((row, idx) => {
                    const rm = rmItems.find(i => i.id === row.rmId);
                    const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0);
                    return (
                      <div key={row.id} className="rm-mobile-card">
                        <div className="rm-mobile-header">
                          <span>Entry {idx + 1}</span>
                          {inwardRows.length > 1 && <button className="btn-icon btn-icon-delete" onClick={() => removeInwardRow(row.id)}><X size={14} /></button>}
                        </div>
                        <div className="form-group">
                          <label className="label">Material</label>
                          <select className="select" value={row.rmId} onChange={e => updateInwardRow(row.id, 'rmId', e.target.value)}>
                            <option value="">-- Select --</option>
                            {rmItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                          </select>
                          {rm && row.qty > 0 && <div className="row-preview">→ {rm.quantity + (parseFloat(row.qty) || 0)} {rm.unit}</div>}
                        </div>
                        <div className="rm-mobile-2col">
                          <div className="form-group"><label className="label">Quantity</label><input type="number" className="input" placeholder="0" step="0.01" value={row.qty} onChange={e => updateInwardRow(row.id, 'qty', e.target.value)} /></div>
                          <div className="form-group"><label className="label">Rate</label><input type="number" className="input" placeholder="0.00" step="0.01" value={row.rate} onChange={e => updateInwardRow(row.id, 'rate', e.target.value)} /></div>
                        </div>
                        {amount > 0 && <div className="rm-amount-display">Amount: ₹{amount.toFixed(2)}</div>}
                        <div className="rm-mobile-2col">
                          <div className="form-group"><label className="label">Supplier</label><input type="text" className="input" placeholder="Name" value={row.supplier} onChange={e => updateInwardRow(row.id, 'supplier', e.target.value)} /></div>
                          <div className="form-group"><label className="label">Bill No</label><input type="text" className="input" placeholder="INV-001" value={row.billNo} onChange={e => updateInwardRow(row.id, 'billNo', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="label">Notes</label><input type="text" className="input" placeholder="Optional" value={row.notes} onChange={e => updateInwardRow(row.id, 'notes', e.target.value)} /></div>
                      </div>
                    );
                  })}
                </div>

                <div className="rm-actions">
                  <button className="btn btn-secondary" onClick={addInwardRow}><Plus size={16} /> Add Row</button>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {validInwardRows.length > 0 && <span className="valid-count">{validInwardRows.length} ready</span>}
                    <button className="btn btn-primary btn-lg" onClick={handleInwardSubmit} disabled={validInwardRows.length === 0}>
                      <CheckCircle size={18} /> Submit Inward
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rm-card">
            <div className="rm-export">
              <h3><Download size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Inward</h3>
              <button className="btn btn-secondary" onClick={() => handleExport('inward')}><Download size={15} /> Export All</button>
            </div>
          </div>

          <div className="rm-card">
            <button className="bulk-toggle" onClick={() => setShowInwardHistory(v => !v)}>
              <span>Inward History ({rmInward.length} entries)</span>
              {showInwardHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showInwardHistory && (
              <div style={{ padding: '1rem' }}>
                {rmInward.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No entries</p> :
                  <div className="rm-table-wrap">
                    <table className="rm-table history-table">
                      <thead><tr><th>Date</th><th>Material</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Supplier</th><th>Bill No</th><th>Stock→</th><th></th></tr></thead>
                      <tbody>
                        {rmInward.map(log => (
                          <tr key={log.id}>
                            <td>{log.date}</td>
                            <td><strong>{log.rmName}</strong></td>
                            <td><span className="rm-badge rm-badge-green">+{log.quantity} {log.unit}</span></td>
                            <td>{log.rate}</td>
                            <td>₹{(log.quantity * log.rate).toFixed(2)}</td>
                            <td>{log.supplier || '—'}</td>
                            <td>{log.billNo || '—'}</td>
                            <td><span style={{ fontSize: '0.8rem' }}>{log.stockBefore}→<strong>{log.stockAfter}</strong></span></td>
                            <td style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn-icon btn-icon-edit" onClick={() => { setEditInwardEntry(log); setEditInwardForm({ date: log.date, quantity: log.quantity, rate: log.rate, supplier: log.supplier || '', billNo: log.billNo || '', notes: log.notes || '' }); }}><Edit2 size={13} /></button>
                              {canDelete && <button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm({ id: log.id, type: 'inward' })}><Trash2 size={13} /></button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}
          </div>
        </>
      )}

      {/* Outward Section */}
      {activeTab === 'outward' && (
        <>
          <div className="rm-card">
            <button className="bulk-toggle" onClick={() => setShowOutwardForm(v => !v)}>
              <span><Plus size={18} /> Raw Material Outward Entry</span>
              {showOutwardForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showOutwardForm && (
              <div className="rm-form">
                <div className="form-group" style={{ maxWidth: '200px', marginBottom: '1rem' }}>
                  <label className="label">📅 Issue Date</label>
                  <input type="date" className="input" value={outwardDate} onChange={e => setOutwardDate(e.target.value)} />
                </div>

                <div className="rm-table-wrap desktop-only">
                  <table className="rm-table">
                    <thead><tr><th>Material</th><th>Quantity</th><th>Purpose</th><th>Issued To</th><th>Notes</th><th></th></tr></thead>
                    <tbody>
                      {outwardRows.map(row => {
                        const rm = rmItems.find(i => i.id === row.rmId);
                        const insufficient = rm && parseFloat(row.qty) > rm.quantity;
                        return (
                          <tr key={row.id} className={insufficient ? 'row-error' : row.rmId && row.qty > 0 ? 'row-valid' : ''}>
                            <td>
                              <select className="select" value={row.rmId} onChange={e => updateOutwardRow(row.id, 'rmId', e.target.value)}>
                                <option value="">-- Select --</option>
                                {rmItems.map(i => <option key={i.id} value={i.id}>{i.name} - Available: {i.quantity} {i.unit}</option>)}
                              </select>
                              {rm && row.qty > 0 && (
                                insufficient
                                  ? <div className="row-error-msg">❌ Only {rm.quantity} {rm.unit} available!</div>
                                  : <div className="row-preview">Stock: {rm.quantity} → {rm.quantity - (parseFloat(row.qty) || 0)} {rm.unit}</div>
                              )}
                            </td>
                            <td><input type="number" className="input rm-num-input" placeholder="0" min="0" step="0.01" value={row.qty} onChange={e => updateOutwardRow(row.id, 'qty', e.target.value)} /></td>
                            <td><input type="text" className="input" placeholder="e.g. Production" value={row.purpose} onChange={e => updateOutwardRow(row.id, 'purpose', e.target.value)} /></td>
                            <td><input type="text" className="input" placeholder="Person/Dept" value={row.issuedTo} onChange={e => updateOutwardRow(row.id, 'issuedTo', e.target.value)} /></td>
                            <td><input type="text" className="input" placeholder="Notes" value={row.notes} onChange={e => updateOutwardRow(row.id, 'notes', e.target.value)} /></td>
                            <td><button className="btn-icon btn-icon-delete" onClick={() => removeOutwardRow(row.id)} disabled={outwardRows.length === 1}><X size={14} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-only rm-mobile-rows">
                  {outwardRows.map((row, idx) => {
                    const rm = rmItems.find(i => i.id === row.rmId);
                    const insufficient = rm && parseFloat(row.qty) > rm.quantity;
                    return (
                      <div key={row.id} className="rm-mobile-card">
                        <div className="rm-mobile-header">
                          <span>Entry {idx + 1}</span>
                          {outwardRows.length > 1 && <button className="btn-icon btn-icon-delete" onClick={() => removeOutwardRow(row.id)}><X size={14} /></button>}
                        </div>
                        <div className="form-group">
                          <label className="label">Material</label>
                          <select className="select" value={row.rmId} onChange={e => updateOutwardRow(row.id, 'rmId', e.target.value)}>
                            <option value="">-- Select --</option>
                            {rmItems.map(i => <option key={i.id} value={i.id}>{i.name} - Avail: {i.quantity}</option>)}
                          </select>
                          {rm && row.qty > 0 && (insufficient ? <div className="row-error-msg">❌ Only {rm.quantity} available!</div> : <div className="row-preview">→ {rm.quantity - (parseFloat(row.qty) || 0)} {rm.unit}</div>)}
                        </div>
                        <div className="form-group"><label className="label">Quantity</label><input type="number" className="input" placeholder="0" step="0.01" value={row.qty} onChange={e => updateOutwardRow(row.id, 'qty', e.target.value)} /></div>
                        <div className="rm-mobile-2col">
                          <div className="form-group"><label className="label">Purpose</label><input type="text" className="input" placeholder="Production" value={row.purpose} onChange={e => updateOutwardRow(row.id, 'purpose', e.target.value)} /></div>
                          <div className="form-group"><label className="label">Issued To</label><input type="text" className="input" placeholder="Person" value={row.issuedTo} onChange={e => updateOutwardRow(row.id, 'issuedTo', e.target.value)} /></div>
                        </div>
                        <div className="form-group"><label className="label">Notes</label><input type="text" className="input" placeholder="Optional" value={row.notes} onChange={e => updateOutwardRow(row.id, 'notes', e.target.value)} /></div>
                      </div>
                    );
                  })}
                </div>

                <div className="rm-actions">
                  <button className="btn btn-secondary" onClick={addOutwardRow}><Plus size={16} /> Add Row</button>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {validOutwardRows.length > 0 && <span className="valid-count">{validOutwardRows.length} ready</span>}
                    <button className="btn btn-primary btn-lg" onClick={handleOutwardSubmit} disabled={validOutwardRows.length === 0}>
                      <CheckCircle size={18} /> Submit Outward
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rm-card">
            <div className="rm-export">
              <h3><Download size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Outward</h3>
              <button className="btn btn-secondary" onClick={() => handleExport('outward')}><Download size={15} /> Export All</button>
            </div>
          </div>

          <div className="rm-card">
            <button className="bulk-toggle" onClick={() => setShowOutwardHistory(v => !v)}>
              <span>Outward History ({rmOutward.length} entries)</span>
              {showOutwardHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showOutwardHistory && (
              <div style={{ padding: '1rem' }}>
                {rmOutward.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No entries</p> :
                  <div className="rm-table-wrap">
                    <table className="rm-table history-table">
                      <thead><tr><th>Date</th><th>Material</th><th>Qty</th><th>Purpose</th><th>Issued To</th><th>Stock→</th>{canDelete && <th></th>}</tr></thead>
                      <tbody>
                        {rmOutward.map(log => (
                          <tr key={log.id}>
                            <td>{log.date}</td>
                            <td><strong>{log.rmName}</strong></td>
                            <td><span className="rm-badge rm-badge-red">-{log.quantity} {log.unit}</span></td>
                            <td>{log.purpose || '—'}</td>
                            <td>{log.issuedTo || '—'}</td>
                            <td><span style={{ fontSize: '0.8rem' }}>{log.stockBefore}→<strong>{log.stockAfter}</strong></span></td>
                            {canDelete && <td><button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm({ id: log.id, type: 'outward' })}><Trash2 size={13} /></button></td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}
          </div>
        </>
      )}

      {showManager && <RMItemManager onClose={() => setShowManager(false)} />}

      {/* Edit Inward Modal */}
      {editInwardEntry && (
        <div className="modal-overlay" onClick={() => setEditInwardEntry(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit2 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Edit Inward Entry</h3>
              <button className="btn-icon" onClick={() => setEditInwardEntry(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Editing: <strong>{editInwardEntry.rmName}</strong></p>
              <div className="rm-mobile-2col">
                <div className="form-group">
                  <label className="label">📅 Date</label>
                  <input type="date" className="input" value={editInwardForm.date} onChange={e => setEditInwardForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Quantity ({editInwardEntry.unit})</label>
                  <input type="number" className="input" min="0" step="0.01" value={editInwardForm.quantity} onChange={e => setEditInwardForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="rm-mobile-2col">
                <div className="form-group">
                  <label className="label">Rate (₹)</label>
                  <input type="number" className="input" min="0" step="0.01" value={editInwardForm.rate} onChange={e => setEditInwardForm(f => ({ ...f, rate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Amount</label>
                  <div className="input" style={{ background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center' }}>₹{((parseFloat(editInwardForm.quantity) || 0) * (parseFloat(editInwardForm.rate) || 0)).toFixed(2)}</div>
                </div>
              </div>
              <div className="rm-mobile-2col">
                <div className="form-group">
                  <label className="label">Supplier</label>
                  <input type="text" className="input" value={editInwardForm.supplier} onChange={e => setEditInwardForm(f => ({ ...f, supplier: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Bill No</label>
                  <input type="text" className="input" value={editInwardForm.billNo} onChange={e => setEditInwardForm(f => ({ ...f, billNo: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Notes</label>
                <input type="text" className="input" value={editInwardForm.notes} onChange={e => setEditInwardForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              {parseFloat(editInwardForm.quantity) !== editInwardEntry.quantity && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg-tertiary)', fontSize: '0.85rem' }}>
                  ⚠️ Stock will adjust: <strong>{editInwardEntry.quantity}</strong> → <strong>{parseFloat(editInwardForm.quantity) || 0}</strong> {editInwardEntry.unit}
                  (diff: {((parseFloat(editInwardForm.quantity) || 0) - editInwardEntry.quantity) > 0 ? '+' : ''}{((parseFloat(editInwardForm.quantity) || 0) - editInwardEntry.quantity).toFixed(2)})
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditInwardEntry(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const result = editRMInward(editInwardEntry.id, editInwardForm);
                if (result?.success) {
                  showToast('✅ Inward entry updated! Stock adjusted.');
                  setEditInwardEntry(null);
                } else {
                  showToast(result?.message || 'Update failed', 'error');
                }
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Entry?</h3></div>
            <div className="modal-body"><p>This will reverse the stock. Are you sure?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => {
                if (deleteConfirm.type === 'inward') deleteRMInward(deleteConfirm.id);
                else deleteRMOutward(deleteConfirm.id);
                setDeleteConfirm(null);
                showToast('Deleted & stock reversed');
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
