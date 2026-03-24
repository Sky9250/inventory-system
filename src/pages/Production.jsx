import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, AlertTriangle, CheckCircle, Download, Factory, ChevronDown, ChevronUp, X, Edit2, Check } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/Production.css';

const today = () => new Date().toISOString().split('T')[0];
const emptyRow = () => ({ id: Date.now() + Math.random(), productId: '', qty: '', operator: '', notes: '' });

export default function Production() {
  const products = useStore(s => s.products);
  const productionLogs = useStore(s => s.productionLogs);
  const addProductionEntry = useStore(s => s.addProductionEntry);
  const deleteProductionLog = useStore(s => s.deleteProductionLog);
  const editProductionLog = useStore(s => s.editProductionLog);
  const user = useStore(s => s.user);

  const [rows, setRows] = useState([emptyRow()]);
  const [shift, setShift] = useState('Morning');
  const [date, setDate] = useState(today());
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({});

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const updateRow = (id, field, value) => setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));
  const addRow = () => setRows(rs => [...rs, emptyRow()]);
  const removeRow = (id) => { if (rows.length > 1) setRows(rs => rs.filter(r => r.id !== id)); };

  const validRows = rows.filter(r => r.productId && r.qty > 0);

  const handleSubmit = () => {
    if (validRows.length === 0) { showToast('Add at least one product with quantity', 'error'); return; }
    setSubmitting(true);
    let successCount = 0;
    validRows.forEach(row => {
      const result = addProductionEntry({ productId: row.productId, quantityProduced: parseInt(row.qty), shift, date, operator: row.operator, notes: row.notes });
      if (result.success) successCount++;
    });
    setTimeout(() => {
      showToast(`✅ ${successCount} entries submitted! Stock updated automatically.`);
      setRows([emptyRow()]);
      setSubmitting(false);
    }, 300);
  };

  const handleExport = (type) => {
    let logs = productionLogs;
    const fname = type === 'today'
      ? `production-today-${today()}.csv`
      : `production-${filterDate || 'all'}.csv`;
    if (type === 'today') logs = productionLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    else if (type === 'date' && filterDate) logs = productionLogs.filter(l => l.enteredAt.startsWith(filterDate));
    if (logs.length === 0) { showToast('No data to export for this period', 'error'); return; }
    exportToCSV(logs.map(l => ({
      Date: new Date(l.enteredAt).toLocaleDateString(),
      Time: new Date(l.enteredAt).toLocaleTimeString(),
      Product: l.productName, SKU: l.productSku,
      'Qty Produced': l.quantityProduced, Shift: l.shift,
      Operator: l.operator || '', 'Stock Before': l.stockBefore,
      'Stock After': l.stockAfter, 'Entered By': l.enteredBy, Notes: l.notes || '',
    })), fname);
    showToast('Exported to Excel/CSV!');
  };

  const todayStats = useMemo(() => {
    const tl = productionLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    return { units: tl.reduce((s, l) => s + l.quantityProduced, 0), entries: tl.length };
  }, [productionLogs]);

  const filteredLogs = useMemo(() => {
    if (!filterDate) return productionLogs;
    return productionLogs.filter(l => l.enteredAt.startsWith(filterDate));
  }, [productionLogs, filterDate]);

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="bulk-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bulk-header">
        <div>
          <h1><Factory size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Production Entry</h1>
          <p>Enter all products produced — stock updates automatically</p>
        </div>
      </div>

      {/* Today Stats */}
      <div className="bulk-stats">
        <div className="bulk-stat bulk-stat-green">
          <div className="bulk-stat-num">{todayStats.units}</div>
          <div className="bulk-stat-label">Units Produced Today</div>
        </div>
        <div className="bulk-stat bulk-stat-blue">
          <div className="bulk-stat-num">{todayStats.entries}</div>
          <div className="bulk-stat-label">Entries Today</div>
        </div>
        <div className="bulk-stat bulk-stat-purple">
          <div className="bulk-stat-num">{productionLogs.length}</div>
          <div className="bulk-stat-label">Total All Time</div>
        </div>
      </div>

      {/* Bulk Entry Form */}
      <div className="bulk-card">
        <button className="bulk-toggle" onClick={() => setShowForm(v => !v)}>
          <span><Plus size={18} /> Bulk Production Entry</span>
          {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showForm && (
          <div className="bulk-form">
            {/* Common fields */}
            <div className="bulk-common">
              <div className="form-group">
                <label className="label">📅 Date</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">⏰ Shift (applies to all rows)</label>
                <select className="select" value={shift} onChange={e => setShift(e.target.value)}>
                  <option>Morning</option><option>Afternoon</option><option>Night</option>
                </select>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="bulk-table-wrap desktop-only">
              <table className="bulk-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Product</th>
                    <th style={{ width: '15%' }}>Qty Produced</th>
                    <th style={{ width: '20%' }}>Operator / Worker</th>
                    <th style={{ width: '20%' }}>Notes</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const prod = products.find(p => p.id === row.productId);
                    return (
                      <tr key={row.id} className={row.productId && row.qty > 0 ? 'row-valid' : ''}>
                        <td>
                          <select className="select" value={row.productId} onChange={e => updateRow(row.id, 'productId', e.target.value)}>
                            <option value="">-- Select Product --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" className="input" placeholder="0" min="1" value={row.qty}
                            onChange={e => updateRow(row.id, 'qty', e.target.value)} />
                          {prod && row.qty > 0 && <div className="row-preview">→ {prod.quantity + parseInt(row.qty || 0)}</div>}
                        </td>
                        <td><input type="text" className="input" placeholder="Name" value={row.operator} onChange={e => updateRow(row.id, 'operator', e.target.value)} /></td>
                        <td><input type="text" className="input" placeholder="Optional" value={row.notes} onChange={e => updateRow(row.id, 'notes', e.target.value)} /></td>
                        <td>
                          <button className="btn-icon btn-icon-delete" onClick={() => removeRow(row.id)} disabled={rows.length === 1}><X size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-only bulk-mobile-rows">
              {rows.map((row, idx) => {
                const prod = products.find(p => p.id === row.productId);
                return (
                  <div key={row.id} className="mobile-row-card">
                    <div className="mobile-row-header">
                      <span className="mobile-row-num">Row {idx + 1}</span>
                      {rows.length > 1 && <button className="btn-icon btn-icon-delete" onClick={() => removeRow(row.id)}><X size={15} /></button>}
                    </div>
                    <div className="form-group">
                      <label className="label">Product</label>
                      <select className="select" value={row.productId} onChange={e => updateRow(row.id, 'productId', e.target.value)}>
                        <option value="">-- Select Product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                      </select>
                    </div>
                    <div className="mobile-row-2col">
                      <div className="form-group">
                        <label className="label">Qty Produced</label>
                        <input type="number" className="input" placeholder="0" min="1" value={row.qty} onChange={e => updateRow(row.id, 'qty', e.target.value)} />
                        {prod && row.qty > 0 && <div className="row-preview">Stock: {prod.quantity} → {prod.quantity + parseInt(row.qty || 0)}</div>}
                      </div>
                      <div className="form-group">
                        <label className="label">Operator</label>
                        <input type="text" className="input" placeholder="Name" value={row.operator} onChange={e => updateRow(row.id, 'operator', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Notes (optional)</label>
                      <input type="text" className="input" placeholder="Any remarks" value={row.notes} onChange={e => updateRow(row.id, 'notes', e.target.value)} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bulk-actions">
              <button className="btn btn-secondary" onClick={addRow}><Plus size={16} /> Add Another Product</button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {validRows.length > 0 && <span className="valid-count">{validRows.length} product{validRows.length > 1 ? 's' : ''} ready</span>}
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting || validRows.length === 0}>
                  <CheckCircle size={18} />
                  {submitting ? 'Submitting...' : `Submit ${validRows.length > 0 ? validRows.length : ''} Entr${validRows.length === 1 ? 'y' : 'ies'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bulk-card">
        <div className="export-section">
          <h3><Download size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Production Data</h3>
          <div className="export-row">
            <button className="btn btn-secondary" onClick={() => handleExport('today')}>
              <Download size={16} /> Today's Report
            </button>
            <div className="export-date-group">
              <input type="date" className="input" value={filterDate} onChange={e => setFilterDate(e.target.value)} placeholder="Pick date" />
              <button className="btn btn-secondary" onClick={() => handleExport('date')} disabled={!filterDate}>
                <Download size={16} /> Export Date
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('all')}>
              <Download size={16} /> Full History
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bulk-card">
        <button className="bulk-toggle" onClick={() => setShowHistory(v => !v)}>
          <span>Production History ({filteredLogs.length} entries{filterDate ? ` on ${filterDate}` : ''})</span>
          {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showHistory && (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="input" style={{ maxWidth: '180px' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              {filterDate && <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>Clear Filter</button>}
            </div>

            {filteredLogs.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No entries found</p>
              : <>
                {/* Desktop table */}
                <div className="bulk-table-wrap desktop-only">
                  <table className="bulk-table history-table">
                    <thead><tr><th>Date/Time</th><th>Product</th><th>SKU</th><th>Produced</th><th>Stock Before</th><th>Stock After</th><th>Shift</th><th>Operator</th><th>By</th><th>Notes</th>{canDelete && <th></th>}</tr></thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td><div>{new Date(log.enteredAt).toLocaleDateString()}</div><div className="time-text">{new Date(log.enteredAt).toLocaleTimeString()}</div></td>
                          <td><strong>{log.productName}</strong></td>
                          <td><span className="sku-badge">{log.productSku}</span></td>
                          <td><span className="qty-badge qty-green">+{log.quantityProduced}</span></td>
                          <td>{log.stockBefore}</td>
                          <td><strong>{log.stockAfter}</strong></td>
                          <td><span className="shift-badge">{log.shift}</span></td>
                          <td>{log.operator || '—'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{log.enteredBy}</td>
                          <td>{log.notes || '—'}</td>
                          {canDelete && <td style={{ whiteSpace: 'nowrap' }}><button className="btn-icon btn-icon-edit" title="Edit entry" onClick={() => { setEditingLog(log); setEditForm({ quantityProduced: log.quantityProduced, okWeight: log.okWeight || '', rejectedQty: log.rejectedQty || 0, rejectedWeight: log.rejectedWeight || '', shift: log.shift || 'Morning', date: log.date || '' }); }}><Edit2 size={14} /></button><button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /></button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="mobile-only history-mobile">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="history-mobile-card">
                      <div className="history-mobile-top">
                        <div>
                          <div className="history-mobile-name">{log.productName}</div>
                          <div className="history-mobile-meta">{log.productSku} • {log.shift} • {new Date(log.enteredAt).toLocaleDateString()}</div>
                        </div>
                        <span className="qty-badge qty-green">+{log.quantityProduced}</span>
                      </div>
                      <div className="history-mobile-details">
                        <span>Before: {log.stockBefore}</span>
                        <span>→</span>
                        <span><strong>After: {log.stockAfter}</strong></span>
                        {log.operator && <span>👤 {log.operator}</span>}
                      </div>
                      {canDelete && <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}><button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditingLog(log); setEditForm({ quantityProduced: log.quantityProduced, okWeight: log.okWeight || '', rejectedQty: log.rejectedQty || 0, rejectedWeight: log.rejectedWeight || '', shift: log.shift || 'Morning', date: log.date || '' }); }}><Edit2 size={14} /> Edit</button><button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /> Delete & Reverse</button></div>}
                    </div>
                  ))}
                </div>
              </>
            }
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete & Reverse Stock?</h3></div>
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
                <strong>{editingLog.productName}</strong> ({editingLog.productSku})
              </p>
              <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="label">Qty Produced</label>
                  <input type="number" className="input" min="0" value={editForm.quantityProduced} onChange={e => setEditForm(f => ({ ...f, quantityProduced: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Shift</label>
                  <select className="select" value={editForm.shift} onChange={e => setEditForm(f => ({ ...f, shift: e.target.value }))}>
                    <option>Morning</option><option>Afternoon</option><option>Night</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Date</label>
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
