import React, { useState, useEffect } from 'react';
import { getAttendanceHistoryApi } from '../services/api';
import { Filter } from 'lucide-react';
import Pagination from './Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatTime, toLocalISODate, useNow } from '../helpers';

export default function HistoryTab() {
  const now = useNow();
  const todayStr = toLocalISODate(now);

  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [dateTo, setDateTo] = useState(todayStr);

  // Convert Date objects to YYYY-MM-DD strings for the API
  const toISOStr = (d) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : undefined;

  const fetchAttendanceHistory = async () => {
    let cancelled = false;

    setLoading(true);
    setError('');
    try {
      const result = await getAttendanceHistoryApi(page, limit, toISOStr(new Date(dateFrom)), toISOStr(new Date(dateTo)));
      if (!cancelled) {
        setRecords(result.data || []);
        setMeta(result.meta || null);
      }
    } catch (err) {
      if (!cancelled) setError(err.message);
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; };
  }

  useEffect(() => {
    fetchAttendanceHistory()
  }, []);

  useEffect(() => {
    fetchAttendanceHistory()
  }, [page, limit]);

  const totalPages = meta?.totalPages || 1;

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttendanceHistory()
  };

  const handleClearFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div>
      <div className="section-title">
        Riwayat Absensi
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '18px 20px' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 700 }}>
              <Filter size={16} color="var(--primary)" />
              <span>Filter Tanggal</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>Dari:</label>
              <DatePicker
                selected={dateFrom}
                onChange={(date) => { setDateFrom(date); setPage(1); }}
                selectsStart
                startDate={dateFrom}
                endDate={dateTo}
                maxDate={dateTo || new Date()}
                placeholderText="Pilih tanggal"
                dateFormat="dd MMM yyyy"
                isClearable
                todayButton="Hari ini"
                className="datepicker-input"
                popperPlacement="bottom-start"
                portalId="root"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sampai:</label>
              <DatePicker
                selected={dateTo}
                onChange={(date) => { setDateTo(date); setPage(1); }}
                selectsEnd
                startDate={dateFrom}
                endDate={dateTo}
                minDate={dateFrom}
                maxDate={new Date()}
                placeholderText="Pilih tanggal"
                dateFormat="dd MMM yyyy"
                isClearable
                todayButton="Hari ini"
                className="datepicker-input"
                popperPlacement="bottom-start"
                portalId="root"
              />
            </div>

            <button type="submit" className="btn-primary " style={{ padding: '8px 16px', width: '200px' }} disabled={!dateFrom && !dateTo}>
              Apply Filter
            </button>

            {(dateFrom || dateTo) && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                onClick={handleClearFilter}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="loading-area">
          <div className="spinner" />
          Memuat data...
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          Belum ada riwayat absensi.
        </div>
      ) : (
        <div className="history-list">


          <div className="glass-card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th width="50%">Check In</th>
                    <th width="50%">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading attendance records...</td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No attendance records found for this period.</td>
                    </tr>
                  ) : (
                    records.map((att) => {
                      const hasCheckedOut = !!att.checkOut;
                      return (
                        <tr key={att.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
                              {`${att.attendanceDate} ${formatTime(att.checkIn)}`}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasCheckedOut ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                              {`${att.attendanceDate} ${formatTime(att.checkOut)}`}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>
      )
      }

      {/* Pagination */}
      {
        !loading && totalPages > 1 && (
          <div className="pagination-bar">
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              ›
            </button>
          </div>
        )
      }
    </div >
  );
}