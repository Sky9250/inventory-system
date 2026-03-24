import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Download, Zap, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Settings, X, Edit2, Check } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/Electricity.css';

const todayStr = () => new Date().toISOString().split('T')[0];

// Machine Manager Modal
function ElectricitySourceManager({ onClose }) {
  const electricitySources = useStore(s => s.electricitySources || []);
  const addElectricitySource = useStore(s => s.addElectricitySource);
  const updateElectricitySource = useStore(s => s.updateElectricitySource);
  const deleteElectricitySource = useStore(s => s.deleteElectricitySource);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) { setError('Enter source name'); return; }
    const ok = addElectricitySource({ name: newName });
    if (ok) { setNewName(''); setError(''); }
    else setError('Source already exists');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Settings size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Manage Electricity Sources</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="mgr-add-row">
            <input className="input" placeholder="e.g. Office, Grinder, Shredder" value={newName}
              onChange={e => { setNewName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} />Add</button>
          </div>
          {error && <p className="mgr-error">{error}</p>}
          <div className="mgr-list">
            {electricitySources.map(s => (
              <div key={s.id} className="mgr-item">
                {editId === s.id ? (
                  <div className="mgr-edit-row">
                    <input className="input" value={editVal} onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { updateElectricitySource(s.id, { name: editVal }); setEditId(null); } if (e.key === 'Escape') setEditId(null); }}
                      autoFocus />
                    <button className="btn-icon btn-icon-success" onClick={() => { updateElectricitySource(s.id, { name: editVal }); setEditId(null); }}><Check size={15} /></button>
                    <button className="btn-icon btn-icon-cancel" onClick={() => setEditId(null)}><X size={15} /></button>
                  </div>
                ) : (
                  <div className="mgr-item-row">
                    <div className="mgr-dot" style={{ background: 'var(--color-warning)' }} />
                    <span className="mgr-name">{s.name}</span>
                    <button className="btn-icon btn-icon-edit" onClick={() => { setEditId(s.id); setEditVal(s.name); }}><Edit2 size={14} /></button>
                    <button className="btn-icon btn-icon-delete" onClick={() => { if (window.confirm(`Delete ${s.name}?`)) deleteElectricitySource(s.id); }}><Trash2 size={14} /></button>
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

export default function Electricity() {
  const machines = useStore(s => s.machines);
  const electricitySources = useStore(s => s.electricitySources || []);
  const electricityLogs = useStore(s => s.electricityLogs || []);
  const addElectricityEntry = useStore(s => s.addElectricityEntry);
  const deleteElectricityLog = useStore(s => s.deleteElectricityLog);
  const editElectricityLog = useStore(s => s.editElectricityLog);
  const user = useStore(s => s.user);

  // Combine machines FIRST, then other sources (sorted)
  const allSources = useMemo(() => {
    // Sort machines by name (Machine 1, Machine 2, etc.)
    const machineSources = [...machines]
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '999');
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '999');
        return numA - numB;
      })
      .map(m => ({ id: m.id, name: m.name, type: 'machine' }));

    // Sort other sources alphabetically
    const otherSources = [...electricitySources]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => ({ id: s.id, name: s.name, type: 'other' }));

    return [...machineSources, ...otherSources];
  }, [machines, electricitySources]);

  const makeRows = () => allSources.map(s => ({ sourceId: s.id, sourceName: s.name, type: s.type, units: '', notes: '' }));

  const [rows, setRows] = useState(() => makeRows());
  const [date, setDate] = useState(todayStr());
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [showManager, setShowManager] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({});

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const updateRow = (sourceId, field, value) => setRows(rs => rs.map(r => r.sourceId === sourceId ? { ...r, [field]: value } : r));
  const syncRows = () => setRows(makeRows());

  const validRows = rows.filter(r => parseFloat(r.units) > 0);

  const handleSubmit = () => {
    if (validRows.length === 0) { showToast('Enter units for at least one source', 'error'); return; }
    setSubmitting(true);
    let count = 0;
    validRows.forEach(row => {
      const result = addElectricityEntry({
        date,
        sourceId: row.sourceId,
        sourceName: row.sourceName,
        sourceType: row.type,
        units: parseFloat(row.units) || 0,
        notes: row.notes,
      });
      if (result.success) count++;
    });
    setTimeout(() => {
      showToast(`✅ ${count} electricity entr${count === 1 ? 'y' : 'ies'} recorded!`);
      setRows(makeRows());
      setSubmitting(false);
    }, 300);
  };

  const handleExport = (type) => {
    let logs = electricityLogs;
    if (type === 'today') logs = electricityLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    else if (type === 'date' && filterDate) logs = electricityLogs.filter(l => l.date === filterDate);
    if (logs.length === 0) { showToast('No data to export', 'error'); return; }
    exportToCSV(logs.map(l => ({
      'Date': l.date,
      'Source': l.sourceName,
      'Type': l.sourceType,
      'Units (kWh)': l.units,
      'Notes': l.notes || '',
      'Entered By': l.enteredBy,
      'Entered At': new Date(l.enteredAt).toLocaleString(),
    })), `electricity-${type}-${todayStr()}.csv`);
    showToast('Exported to Excel!');
  };

  const todayStats = useMemo(() => {
    const tl = electricityLogs.filter(l => new Date(l.enteredAt).toDateString() === new Date().toDateString());
    const machineUnits = tl.filter(l => l.sourceType === 'machine').reduce((s, l) => s + (l.units || 0), 0);
    const otherUnits = tl.filter(l => l.sourceType === 'other').reduce((s, l) => s + (l.units || 0), 0);
    return {
      totalUnits: (machineUnits + otherUnits).toFixed(2),
      machineUnits: machineUnits.toFixed(2),
      otherUnits: otherUnits.toFixed(2),
      entries: tl.length,
    };
  }, [electricityLogs]);

  const filteredLogs = useMemo(() => {
    if (!filterDate) return electricityLogs;
    return electricityLogs.filter(l => l.date === filterDate);
  }, [electricityLogs, filterDate]);

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="elec-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="elec-header">
        <div>
          <h1><Zap size={26} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Electricity Consumption</h1>
          <p>Track daily electricity by machine + other sources (Office, Grinder, etc.)</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowManager(true)}>
          <Settings size={16} /> Manage Sources
        </button>
      </div>

      {/* Stats */}
      <div className="elec-stats">
        <div className="elec-stat elec-stat-yellow">
          <div className="elec-stat-num">{todayStats.totalUnits}</div>
          <div className="elec-stat-label">Total Units Today (kWh)</div>
        </div>
        <div className="elec-stat elec-stat-blue">
          <div className="elec-stat-num">{todayStats.machineUnits}</div>
          <div className="elec-stat-label">Machines Units</div>
        </div>
        <div className="elec-stat elec-stat-green">
          <div className="elec-stat-num">{todayStats.otherUnits}</div>
          <div className="elec-stat-label">Other Sources Units</div>
        </div>
      </div>

      {/* Entry Form */}
      <div className="elec-card">
        <button className="bulk-toggle" onClick={() => setShowForm(v => !v)}>
          <span><Zap size={18} /> Daily Electricity Consumption Entry</span>
          {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showForm && (
          <div className="elec-form">
            <div className="elec-date-row">
              <div className="form-group">
                <label className="label">📅 Date</label>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="elec-hint-box">
                💡 Fill units consumed for each source today. Leave empty if not used.
              </div>
            </div>

            {/* Desktop Table */}
            <div className="elec-table-wrap desktop-only">
              <table className="elec-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Source</th>
                    <th style={{ width: '15%' }}>Type</th>
                    <th style={{ width: '20%' }}>Units Consumed (kWh)</th>
                    <th style={{ width: '25%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const hasData = parseFloat(row.units) > 0;
                    const prevRow = idx > 0 ? rows[idx - 1] : null;
                    const showDivider = prevRow && prevRow.type === 'machine' && row.type === 'other';
                    return (
                      <>
                        {showDivider && (
                          <tr className="elec-divider-row">
                            <td colSpan="4" className="elec-divider-cell">
                              <div className="elec-divider-text">⚡ Other Sources</div>
                            </td>
                          </tr>
                        )}
                        <tr key={row.sourceId} className={hasData ? 'row-valid' : ''}>
                          <td><strong>{row.sourceName}</strong></td>
                          <td><span className={`elec-type-badge elec-type-${row.type}`}>{row.type === 'machine' ? '🏭 Machine' : '⚡ Other'}</span></td>
                          <td><input type="number" className="input elec-num-input" placeholder="0" min="0" step="0.01" value={row.units} onChange={e => updateRow(row.sourceId, 'units', e.target.value)} /></td>
                          <td><input type="text" className="input" placeholder="Optional" value={row.notes} onChange={e => updateRow(row.sourceId, 'notes', e.target.value)} /></td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-only elec-mobile-rows">
              {rows.map((row, idx) => {
                const prevRow = idx > 0 ? rows[idx - 1] : null;
                const showDivider = prevRow && prevRow.type === 'machine' && row.type === 'other';
                return (<>
                  {showDivider && <div className="elec-mobile-divider">⚡ Other Sources</div>}
                  <div key={row.sourceId} className="elec-mobile-card">
                    <div className="elec-mobile-header">
                      <div>
                        <strong>{row.sourceName}</strong>
                        <span className={`elec-type-badge elec-type-${row.type}`} style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>{row.type === 'machine' ? '🏭' : '⚡'}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Units Consumed (kWh)</label>
                      <input type="number" className="input" placeholder="0" min="0" step="0.01" value={row.units} onChange={e => updateRow(row.sourceId, 'units', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Notes</label>
                      <input type="text" className="input" placeholder="Optional" value={row.notes} onChange={e => updateRow(row.sourceId, 'notes', e.target.value)} />
                    </div>
                  </div>
                </>);
              })}
            </div>

            {/* Actions */}
            <div className="elec-actions">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {validRows.length > 0 && <span className="valid-count">{validRows.length} source{validRows.length > 1 ? 's' : ''} ready</span>}
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting || validRows.length === 0}>
                  <Zap size={18} />
                  {submitting ? 'Submitting...' : `Submit ${validRows.length > 0 ? validRows.length : ''} Entr${validRows.length === 1 ? 'y' : 'ies'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="elec-card">
        <div className="elec-export">
          <h3><Download size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Export Electricity Data</h3>
          <div className="elec-export-row">
            <button className="btn btn-secondary" onClick={() => handleExport('today')}><Download size={15} /> Today</button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="input" style={{ maxWidth: '160px' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => handleExport('date')} disabled={!filterDate}><Download size={15} /> Export Date</button>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('all')}><Download size={15} /> Full History</button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="elec-card">
        <button className="bulk-toggle" onClick={() => setShowHistory(v => !v)}>
          <span>Electricity History ({filteredLogs.length} entries{filterDate ? ` — ${filterDate}` : ''})</span>
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
                <div className="elec-table-wrap desktop-only">
                  <table className="elec-table history-table">
                    <thead><tr><th>Date/Time</th><th>Source</th><th>Type</th><th>Units (kWh)</th><th>Notes</th><th>By</th>{canDelete && <th></th>}</tr></thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td><div>{log.date}</div><div className="time-text">{new Date(log.enteredAt).toLocaleTimeString()}</div></td>
                          <td><strong>{log.sourceName}</strong></td>
                          <td><span className={`elec-type-badge elec-type-${log.sourceType}`}>{log.sourceType === 'machine' ? '🏭 Machine' : '⚡ Other'}</span></td>
                          <td><span className="units-badge">{log.units} kWh</span></td>
                          <td>{log.notes || '—'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{log.enteredBy}</td>
                          {canDelete && <td style={{ whiteSpace: 'nowrap' }}><button className="btn-icon btn-icon-edit" title="Edit entry" onClick={() => { setEditingLog(log); setEditForm({ units: log.units, notes: log.notes || '', date: log.date }); }}><Edit2 size={13} /></button><button className="btn-icon btn-icon-delete" onClick={() => setDeleteConfirm(log.id)}><Trash2 size={13} /></button></td>}
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
                          <div className="history-mobile-name">{log.sourceName}</div>
                          <div className="history-mobile-meta">{log.date} • {new Date(log.enteredAt).toLocaleTimeString()}</div>
                        </div>
                        <span className="units-badge">{log.units} kWh</span>
                      </div>
                      <div className="history-mobile-details">
                        <span className={`elec-type-badge elec-type-${log.sourceType}`}>{log.sourceType === 'machine' ? '🏭' : '⚡'}</span>
                        {log.notes && <span>📝 {log.notes}</span>}
                        <span>By: {log.enteredBy}</span>
                      </div>
                      {canDelete && <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}><button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditingLog(log); setEditForm({ units: log.units, notes: log.notes || '', date: log.date }); }}><Edit2 size={14} /> Edit</button><button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteConfirm(log.id)}><Trash2 size={14} /> Delete</button></div>}
                    </div>
                  ))}
                </div>
              </>
            }
          </div>
        )}
      </div>

      {showManager && <ElectricitySourceManager onClose={() => { setShowManager(false); syncRows(); }} />}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Entry?</h3></div>
            <div className="modal-body"><p>This will permanently delete this electricity record.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteElectricityLog(deleteConfirm); setDeleteConfirm(null); showToast('Entry deleted'); }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {editingLog && (
        <div className="modal-overlay" onClick={() => setEditingLog(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit2 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Edit Electricity Entry</h3>
              <button className="btn-icon" onClick={() => setEditingLog(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <strong>{editingLog.sourceName}</strong> ({editingLog.sourceType === 'machine' ? '🏭 Machine' : '⚡ Other'})
              </p>
              <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="label">Units Consumed (kWh)</label>
                  <input type="number" className="input" min="0" step="0.01" value={editForm.units} onChange={e => setEditForm(f => ({ ...f, units: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Date</label>
                  <input type="date" className="input" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="label">Notes</label>
                  <input type="text" className="input" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingLog(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const result = editElectricityLog(editingLog.id, { ...editForm, units: parseFloat(editForm.units) || 0 });
                if (result?.success) { showToast('✅ Entry updated'); setEditingLog(null); }
                else showToast(result?.message || 'Failed to update', 'error');
              }}><Check size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
