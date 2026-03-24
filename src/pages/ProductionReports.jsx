import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, Download, TrendingUp, Package, Weight } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import '../styles/ProductionReports.css';

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getMonthName = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[new Date(date).getMonth()];
};

export default function ProductionReports() {
  const productionLogs = useStore(s => s.productionLogs);
  const [view, setView] = useState('monthly'); // weekly, monthly, yearly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set(productionLogs.map(l => new Date(l.enteredAt).getFullYear()));
    return [...years].sort((a, b) => b - a);
  }, [productionLogs]);

  if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

  // Calculate summaries based on view
  const summary = useMemo(() => {
    let filtered = productionLogs;

    if (view === 'weekly') {
      // Current year, group by week
      filtered = productionLogs.filter(l => new Date(l.enteredAt).getFullYear() === selectedYear);
      const byWeek = {};
      filtered.forEach(log => {
        const weekNum = getWeekNumber(log.enteredAt);
        const key = `Week ${weekNum}`;
        if (!byWeek[key]) byWeek[key] = { period: key, okQty: 0, okWeight: 0, rejQty: 0, rejWeight: 0, entries: 0 };
        byWeek[key].okQty += log.quantityProduced || 0;
        byWeek[key].okWeight += parseFloat(log.okWeight) || 0;
        byWeek[key].rejQty += log.rejectedQty || 0;
        byWeek[key].rejWeight += parseFloat(log.rejectedWeight) || 0;
        byWeek[key].entries += 1;
      });
      return Object.values(byWeek).sort((a, b) => {
        const aNum = parseInt(a.period.split(' ')[1]);
        const bNum = parseInt(b.period.split(' ')[1]);
        return bNum - aNum;
      });
    } else if (view === 'monthly') {
      // Selected year, group by month
      filtered = productionLogs.filter(l => new Date(l.enteredAt).getFullYear() === selectedYear);
      const byMonth = {};
      filtered.forEach(log => {
        const month = getMonthName(log.enteredAt);
        if (!byMonth[month]) byMonth[month] = { period: month, okQty: 0, okWeight: 0, rejQty: 0, rejWeight: 0, entries: 0 };
        byMonth[month].okQty += log.quantityProduced || 0;
        byMonth[month].okWeight += parseFloat(log.okWeight) || 0;
        byMonth[month].rejQty += log.rejectedQty || 0;
        byMonth[month].rejWeight += parseFloat(log.rejectedWeight) || 0;
        byMonth[month].entries += 1;
      });
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.map(m => byMonth[m]).filter(Boolean).reverse();
    } else {
      // Yearly - all years
      const byYear = {};
      productionLogs.forEach(log => {
        const year = new Date(log.enteredAt).getFullYear();
        if (!byYear[year]) byYear[year] = { period: year, okQty: 0, okWeight: 0, rejQty: 0, rejWeight: 0, entries: 0 };
        byYear[year].okQty += log.quantityProduced || 0;
        byYear[year].okWeight += parseFloat(log.okWeight) || 0;
        byYear[year].rejQty += log.rejectedQty || 0;
        byYear[year].rejWeight += parseFloat(log.rejectedWeight) || 0;
        byYear[year].entries += 1;
      });
      return Object.values(byYear).sort((a, b) => b.period - a.period);
    }
  }, [productionLogs, view, selectedYear]);

  const totals = useMemo(() => {
    return summary.reduce((acc, s) => ({
      okQty: acc.okQty + s.okQty,
      okWeight: acc.okWeight + s.okWeight,
      rejQty: acc.rejQty + s.rejQty,
      rejWeight: acc.rejWeight + s.rejWeight,
      entries: acc.entries + s.entries,
    }), { okQty: 0, okWeight: 0, rejQty: 0, rejWeight: 0, entries: 0 });
  }, [summary]);

  const handleExport = () => {
    const data = summary.map(s => ({
      'Period': s.period,
      'OK Quantity': s.okQty,
      'OK Weight (kg)': s.okWeight.toFixed(2),
      'Rejected Qty': s.rejQty,
      'Rejected Weight (kg)': s.rejWeight.toFixed(2),
      'Avg Weight (kg)': s.okQty > 0 ? (s.okWeight / s.okQty).toFixed(2) : '0',
      'Entries': s.entries,
    }));
    exportToCSV(data, `production-${view}-${selectedYear}.csv`);
  };

  return (
    <div className="prod-report-page">
      <div className="prod-report-header">
        <div>
          <h1><TrendingUp size={26} style={{display:'inline',marginRight:'0.5rem',verticalAlign:'middle'}}/>Production Reports</h1>
          <p>View production summary by week, month, or year</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} disabled={summary.length===0}>
          <Download size={16}/> Export to Excel
        </button>
      </div>

      {/* View Selector */}
      <div className="prod-report-controls">
        <div className="prod-report-tabs">
          <button className={`prod-tab ${view==='weekly'?'prod-tab-active':''}`} onClick={()=>setView('weekly')}>
            <Calendar size={16}/> Weekly
          </button>
          <button className={`prod-tab ${view==='monthly'?'prod-tab-active':''}`} onClick={()=>setView('monthly')}>
            <Calendar size={16}/> Monthly
          </button>
          <button className={`prod-tab ${view==='yearly'?'prod-tab-active':''}`} onClick={()=>setView('yearly')}>
            <Calendar size={16}/> Yearly
          </button>
        </div>

        {view !== 'yearly' && (
          <div className="prod-report-year-select">
            <label>Year:</label>
            <select className="select" value={selectedYear} onChange={e=>setSelectedYear(parseInt(e.target.value))}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Totals Summary */}
      <div className="prod-report-totals">
        <div className="prod-total-card prod-total-green">
          <div className="prod-total-icon"><Package size={24}/></div>
          <div>
            <div className="prod-total-num">{totals.okQty.toLocaleString()}</div>
            <div className="prod-total-label">Total OK Quantity</div>
          </div>
        </div>
        <div className="prod-total-card prod-total-blue">
          <div className="prod-total-icon"><Weight size={24}/></div>
          <div>
            <div className="prod-total-num">{totals.okWeight.toFixed(2)} kg</div>
            <div className="prod-total-label">Total OK Weight</div>
          </div>
        </div>
        <div className="prod-total-card prod-total-red">
          <div className="prod-total-icon"><Package size={24}/></div>
          <div>
            <div className="prod-total-num">{totals.rejQty.toLocaleString()}</div>
            <div className="prod-total-label">Total Rejected</div>
          </div>
        </div>
        <div className="prod-total-card prod-total-purple">
          <div className="prod-total-icon"><TrendingUp size={24}/></div>
          <div>
            <div className="prod-total-num">{totals.entries}</div>
            <div className="prod-total-label">Total Entries</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="prod-report-card">
        <h3>
          {view === 'weekly' && `Weekly Production - ${selectedYear}`}
          {view === 'monthly' && `Monthly Production - ${selectedYear}`}
          {view === 'yearly' && `Yearly Production Summary`}
        </h3>

        {summary.length === 0 ? (
          <p style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:'3rem'}}>
            No production data found
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="prod-report-table-wrap desktop-only">
              <table className="prod-report-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>✅ OK Qty</th>
                    <th>✅ OK Weight</th>
                    <th>📊 Avg Weight</th>
                    <th>❌ Rejected Qty</th>
                    <th>❌ Rej. Weight</th>
                    <th>Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong>{s.period}</strong></td>
                      <td><span className="prod-badge prod-badge-green">{s.okQty.toLocaleString()}</span></td>
                      <td>{s.okWeight.toFixed(2)} kg</td>
                      <td><strong>{s.okQty > 0 ? (s.okWeight / s.okQty).toFixed(2) : '0.00'} kg</strong></td>
                      <td><span className="prod-badge prod-badge-red">{s.rejQty}</span></td>
                      <td>{s.rejWeight.toFixed(2)} kg</td>
                      <td>{s.entries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-only prod-report-mobile">
              {summary.map((s, idx) => (
                <div key={idx} className="prod-mobile-card">
                  <div className="prod-mobile-header">{s.period}</div>
                  <div className="prod-mobile-grid">
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">✅ OK Qty</span>
                      <span className="prod-mobile-value prod-green">{s.okQty.toLocaleString()}</span>
                    </div>
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">✅ OK Weight</span>
                      <span className="prod-mobile-value">{s.okWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">📊 Avg Weight</span>
                      <span className="prod-mobile-value">{s.okQty > 0 ? (s.okWeight / s.okQty).toFixed(2) : '0.00'} kg</span>
                    </div>
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">❌ Rejected</span>
                      <span className="prod-mobile-value prod-red">{s.rejQty}</span>
                    </div>
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">❌ Rej. Weight</span>
                      <span className="prod-mobile-value">{s.rejWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="prod-mobile-item">
                      <span className="prod-mobile-label">Entries</span>
                      <span className="prod-mobile-value">{s.entries}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
