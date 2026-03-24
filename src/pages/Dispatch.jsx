import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, AlertTriangle, CheckCircle, Download, Truck, ChevronDown, ChevronUp, X, Edit2 } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/Production.css';

const today = () => new Date().toISOString().split('T')[0];
const emptyRow = () => ({ id: Date.now() + Math.random(), productId: '', qty: '' });

export default function Dispatch() {
  const products = useStore(s => s.products);
  const dispatchLogs = useStore(s => s.dispatchLogs);
  const addDispatchEntry = useStore(s => s.addDispatchEntry);
  const deleteDispatchLog = useStore(s => s.deleteDispatchLog);
  const editDispatchLog = useStore(s => s.editDispatchLog);
  const user = useStore(s => s.user);

  const [rows, setRows] = useState([emptyRow()]);
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [driverName, setDriverName] = useState('');
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [editForm, setEditForm] = useState({});

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); };

  const updateRow = (id, field, value) => setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));
  const addRow = () => setRows(rs => [...rs, emptyRow()]);
  const removeRow = (id) => { if (rows.length > 1) setRows(rs => rs.filter(r => r.id !== id)); };

  const validRows = rows.filter(r => r.productId && r.qty > 0);

  const stockCheck = useMemo(() => {
    return rows.map(row => {
      const p = products.find(x => x.id === row.productId);
      if (!p || !row.qty) return null;
      const qty = parseInt(row.qty) || 0;
      const after = p.quantity - qty;
      return { productId: row.productId, available: p.quantity, after, insufficient: after < 0, low: after >= 0 && after <= p.minStock };
    });
  }, [rows, products]);

  const hasInsufficientStock = stockCheck.some(s => s && s.insufficient);

  const handleSubmit = () => {
    if (!customerName.trim()) { showToast('Customer name is required', 'error'); return; }
    if (validRows.length === 0) { showToast('Add at least one product with quantity', 'error'); return; }
    if (hasInsufficientStock) { showToast('Some products have insufficient stock!', 'error'); return; }

    setSubmitting(true);
    let successCount = 0;
    let alerts = [];

    validRows.forEach(row => {
      const result = addDispatchEntry({
        productId: row.productId, quantityDispatched: parseInt(row.qty),
        customerName, orderNumber, deliveryAddress, vehicleType, vehicleDetails, driverName, date, notes,
      });
      if (result.success) { successCount++; if (result.alert) alerts.push(result.alert); }
    });

    setTimeout(() => {
      showToast(`✅ ${successCount} items dispatched to ${customerName}! Stock updated.`);
      if (alerts.length > 0) setTimeout(() => showToast(alerts[0], 'warning'), 700);
      setRows([emptyRow()]);
      setCustomerName(''); setOrderNumber(''); setDeliveryAddress('');
      setVehicleType(''); setVehicleDetails(''); setDriverName(''); setNotes('');
      setSubmitting(false);
    }, 300);
  };

  const handleExport = (type) => {
    let logs = dispatchLogs;
    const fname = type === 'today' ? `dispatch-today-${today()}.csv` : `dispatch-${filterDate || 'all'}.csv`;
    if (type === 'today') logs = dispatchLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    else if (type === 'date' && filterDate) logs = dispatchLogs.filter(l => l.enteredAt.startsWith(filterDate));
    if (logs.length === 0) { showToast('No data to export', 'error'); return; }
    exportToCSV(logs.map(l => ({
      Date: new Date(l.enteredAt).toLocaleDateString(), Time: new Date(l.enteredAt).toLocaleTimeString(),
      Product: l.productName, SKU: l.productSku, 'Qty Dispatched': l.quantityDispatched,
      Customer: l.customerName, 'Order#': l.orderNumber || '', Address: l.deliveryAddress || '',
      'Vehicle Type': l.vehicleType || '', Vehicle: l.vehicleDetails || '', Driver: l.driverName || '',
      'Stock Before': l.stockBefore, 'Stock After': l.stockAfter,
      'Entered By': l.enteredBy, Notes: l.notes || '',
    })), fname);
    showToast('Exported to Excel/CSV!');
  };

  const todayStats = useMemo(() => {
    const tl = dispatchLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    return {
      units: tl.reduce((s, l) => s + l.quantityDispatched, 0),
      entries: tl.length,
      customers: [...new Set(tl.map(l => l.customerName))].length,
    };
  }, [dispatchLogs]);

  const filteredLogs = useMemo(() => {
    if (!filterDate) return dispatchLogs;
    return dispatchLogs.filter(l => l.enteredAt.startsWith(filterDate));
  }, [dispatchLogs, filterDate]);

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="bulk-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : toast.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="bulk-header">
        <div>
          <h1><Truck size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Dispatch Entry</h1>
          <p>Enter dispatch details — stock updates automatically</p>
        </div>
      </div>

      <div className="bulk-stats">
        <div className="bulk-stat bulk-stat-orange">
          <div className="bulk-stat-num">{todayStats.units}</div>
          <div className="bulk-stat-label">Units Dispatched Today</div>
        </div>
        <div className="bulk-stat bulk-stat-blue">
          <div className="bulk-stat-num">{todayStats.entries}</div>
          <div className="bulk-stat-label">Dispatch Entries Today</div>
        </div>
        <div className="bulk-stat bulk-stat-green">
          <div className="bulk-stat-num">{todayStats.customers}</div>
          <div className="bulk-stat-label">Customers Served Today</div>
        </div>
      </div>

      {/* Form */}
      <div className="bulk-card">
        <button className="bulk-toggle" onClick={() => setShowForm(v => !v)}>
          <span><Truck size={18} /> Bulk Dispatch Entry</span>
          {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showForm && (
          <div className="bulk-form">
            {/* Customer Details */}
            <div className="bulk-section-label">🧑‍💼 Customer Details</div>
            <div className="bulk-common bulk-common-3">
              <div className="form-group">
                <label className="label">Customer / Party Name <span className="required">*</span></label>
                <input type="text" className="input" placeholder="e.g. Rahul Traders" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Order / Invoice Number</label>
                <input type="text" className="input" placeholder="e.g. INV-001" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">📅 Date</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Delivery Address</label>
                <input type="text" className="input" placeholder="Where to deliver" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">🚛 Vehicle Type</label>
                <select className="select" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                  <option value="">-- Select Vehicle Type --</option>
                  <option value="Rented Vehicle">Rented Vehicle</option>
                  <option value="Per Trip Vehicle">Per Trip Vehicle</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">🚛 Vehicle Number</label>
                <input type="text" className="input" placeholder="e.g. GJ-01-AB-1234" value={vehicleDetails} onChange={e => setVehicleDetails(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Driver Name</label>
                <input type="text" className="input" placeholder="Driver's name" value={driverName} onChange={e => setDriverName(e.target.value)} />
              </div>
            </div>

            {/* Products */}
            <div className="bulk-section-label" style={{ marginTop: '1.25rem' }}>📦 Products to Dispatch</div>

            {/* Desktop Table */}
            <div className="bulk-table-wrap desktop-only">
              <table className="bulk-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Product</th>
                    <th style={{ width: '20%' }}>Qty to Dispatch</th>
                    <th style={{ width: '25%' }}>Stock Status</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const check = stockCheck[idx];
                    const prod = products.find(p => p.id === row.productId);
                    return (
                      <tr key={row.id} className={check?.insufficient ? 'row-error' : row.productId && row.qty > 0 ? 'row-valid' : ''}>
                        <td>
                          <select className="select" value={row.productId} onChange={e => updateRow(row.id, 'productId', e.target.value)}>
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} — Available: {p.quantity} {p.quantity === 0 ? '❌' : p.quantity <= p.minStock ? '⚠️' : '✅'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input type="number" className="input" placeholder="0" min="1" value={row.qty}
                            onChange={e => updateRow(row.id, 'qty', e.target.value)} />
                        </td>
                        <td>
                          {check && prod && (
                            <div className={`stock-check ${check.insufficient ? 'stock-check-error' : check.low ? 'stock-check-warn' : 'stock-check-ok'}`}>
                              {check.insufficient
                                ? `❌ Need ${row.qty}, only ${check.available} available`
                                : check.low
                                  ? `⚠️ After: ${check.after} (Low!)`
                                  : `✅ After dispatch: ${check.after}`}
                            </div>
                          )}
                        </td>
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
                const check = stockCheck[idx];
                return (
                  <div key={row.id} className={`mobile-row-card ${check?.insufficient ? 'mobile-row-error' : ''}`}>
                    <div className="mobile-row-header">
                      <span className="mobile-row-num">Product {idx + 1}</span>
                      {rows.length > 1 && <button className="btn-icon btn-icon-delete" onClick={() => removeRow(row.id)}><X size={15} /></button>}
                    </div>
                    <div className="form-group">
                      <label className="label">Product</label>
                      <select className="select" value={row.productId} onChange={e => updateRow(row.id, 'productId', e.target.value)}>
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} — Available: {p.quantity}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Quantity to Dispatch</label>
                      <input type="number" className="input" placeholder="0" min="1" value={row.qty} onChange={e => updateRow(row.id, 'qty', e.target.value)} />
                    </div>
                    {check && (
                      <div className={`stock-check ${check.insufficient ? 'stock-check-error' : check.low ? 'stock-check-warn' : 'stock-check-ok'}`}>
                        {check.insufficient ? `❌ Insufficient! Available: ${check.available}` : check.low ? `⚠️ After: ${check.after} (Low stock)` : `✅ After dispatch: ${check.after}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bulk-actions">
              <button className="btn btn-secondary" onClick={addRow}><Plus size={16} /> Add Another Product</button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {hasInsufficientStock && <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>⚠️ Fix stock issues first</span>}
                {validRows.length > 0 && !hasInsufficientStock && <span className="valid-count">{validRows.length} product{validRows.length > 1 ? 's' : ''} ready</span>}
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting || validRows.length === 0 || hasInsufficientStock}>
                  <Truck size={18} />
                  {submitting ? 'Dispatching...' : `Dispatch ${validRows.length > 0 ? validRows.length : ''} Product${validRows.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="bulk-card">
        <div className="export-section">
          <h3><Download size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Dispatch Data</h3>
          <div className="export-row">
            <button className="btn btn-secondary" onClick={() => handleExport('today')}><Download size={16} /> Today's Report</button>
            <div className="export-date-group">
              <input type="date" className="input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => handleExport('date')} disabled={!filterDate}><Download size={16} /> Export Date</button>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('all')}><Download size={16} /> Full History</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bulk-card">
        <button className="bulk-toggle" onClick={() => setShowHistory(v => !v)}>
          <span>Dispatch History ({filteredLogs.length} entries{filterDate ? ` on ${filterDate}` : ''})</span>
          {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showHistory && (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="input" style={{ maxWidth: '180px' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              {filterDate && <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>Clear</button>}
            </div>

            {filteredLogs.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>No entries found</p>
              : <>
                <div className="bulk-table-wrap desktop-only">
                  <table className="bulk-table history-table">
                    <thead><tr><th>Date/Time</th><th>Product</th><th>Dispatched</th><th>Stock After</th><th>Customer</th><th>Order#</th><th>Vehicle Type</th><th>Vehicle</th><th>Driver</th><th>By</th><th></th></tr></thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td><div>{new Date(log.enteredAt).toLocaleDateString()}</div><div className="time-text">{new Date(log.enteredAt).toLocaleTimeString()}</div></td>
                          <td><strong>{log.productName}</strong></td>
                          <td><span className="qty-badge qty-red">{log.quantityDispatched}</span></td>
                          <td><strong>{log.stockAfter}</strong></td>
                          <td><strong>{log.customerName}</strong></td>
                          <td>{log.orderNumber || '—'}</td>
                          <td>{log.vehicleType ? <span className={`qty-badge ${log.vehicleType === 'Rented Vehicle' ? 'qty-blue' : 'qty-green'}`}>{log.vehicleType}</span> : '—'}</td>
                          <td>{log.vehicleDetails || '—'}</td>
                          <td>{log.driverName || '—'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{log.enteredBy}</td>
                          <td style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon btn-icon-edit" onClick={() => { setEditEntry(log); setEditForm({ quantityDispatched: log.quantityDispatched, customerName: log.customerName || '', orderNumber: log.orderNumber || '', deliveryAddress: log.deliveryAddress || '', vehicleType: log.vehicleType || '', vehicleDetails: log.vehicleDetails || '', driverName: log.driverName || '', date: log.date || '', notes: log.notes || '' }); }}><Edit2 size={13} /></button>
                            {canDelete && <button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /></button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mobile-only history-mobile">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="history-mobile-card">
                      <div className="history-mobile-top">
                        <div>
                          <div className="history-mobile-name">{log.productName}</div>
                          <div className="history-mobile-meta">{log.productSku} • {new Date(log.enteredAt).toLocaleDateString()}</div>
                        </div>
                        <span className="qty-badge qty-red">{log.quantityDispatched}</span>
                      </div>
                      <div className="history-mobile-details">
                        <span>👤 {log.customerName}</span>
                        {log.orderNumber && <span>📋 {log.orderNumber}</span>}
                        {log.vehicleType && <span>🚛 {log.vehicleType}</span>}
                        {log.vehicleDetails && <span>🔢 {log.vehicleDetails}</span>}
                        <span>Stock after: <strong>{log.stockAfter}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditEntry(log); setEditForm({ quantityDispatched: log.quantityDispatched, customerName: log.customerName || '', orderNumber: log.orderNumber || '', deliveryAddress: log.deliveryAddress || '', vehicleType: log.vehicleType || '', vehicleDetails: log.vehicleDetails || '', driverName: log.driverName || '', date: log.date || '', notes: log.notes || '' }); }}><Edit2 size={14} /> Edit</button>
                        {canDelete && <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /> Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            }
          </div>
        )}
      </div>

      {/* Edit Dispatch Modal */}
      {editEntry && (
        <div className="modal-overlay" onClick={() => setEditEntry(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit2 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Edit Dispatch Entry</h3>
              <button className="btn-icon" onClick={() => setEditEntry(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Product: <strong>{editEntry.productName}</strong></p>
              <div className="bulk-common bulk-common-3">
                <div className="form-group">
                  <label className="label">Customer / Party Name</label>
                  <input type="text" className="input" value={editForm.customerName} onChange={e => setEditForm(f => ({ ...f, customerName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Order / Invoice Number</label>
                  <input type="text" className="input" value={editForm.orderNumber} onChange={e => setEditForm(f => ({ ...f, orderNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">📅 Date</label>
                  <input type="date" className="input" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Qty Dispatched</label>
                  <input type="number" className="input" min="1" value={editForm.quantityDispatched} onChange={e => setEditForm(f => ({ ...f, quantityDispatched: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Delivery Address</label>
                  <input type="text" className="input" value={editForm.deliveryAddress} onChange={e => setEditForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">🚛 Vehicle Type</label>
                  <select className="select" value={editForm.vehicleType} onChange={e => setEditForm(f => ({ ...f, vehicleType: e.target.value }))}>
                    <option value="">-- Select Vehicle Type --</option>
                    <option value="Rented Vehicle">Rented Vehicle</option>
                    <option value="Per Trip Vehicle">Per Trip Vehicle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">🚛 Vehicle Number</label>
                  <input type="text" className="input" value={editForm.vehicleDetails} onChange={e => setEditForm(f => ({ ...f, vehicleDetails: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Driver Name</label>
                  <input type="text" className="input" value={editForm.driverName} onChange={e => setEditForm(f => ({ ...f, driverName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Notes</label>
                  <input type="text" className="input" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              {parseInt(editForm.quantityDispatched) !== editEntry.quantityDispatched && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg-tertiary)', fontSize: '0.85rem' }}>
                  ⚠️ Stock will adjust: dispatched <strong>{editEntry.quantityDispatched}</strong> → <strong>{parseInt(editForm.quantityDispatched) || 0}</strong>
                  (diff: {((parseInt(editForm.quantityDispatched) || 0) - editEntry.quantityDispatched) > 0 ? '+' : ''}{(parseInt(editForm.quantityDispatched) || 0) - editEntry.quantityDispatched})
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditEntry(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const result = editDispatchLog(editEntry.id, editForm);
                if (result?.success) {
                  showToast('✅ Dispatch entry updated! Stock adjusted.');
                  setEditEntry(null);
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
            <div className="modal-header"><h3>Delete & Restore Stock?</h3></div>
            <div className="modal-body"><p>This will <strong>add the stock back</strong> to inventory.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteDispatchLog(deleteConfirm); setDeleteConfirm(null); showToast('Deleted & stock restored'); }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
