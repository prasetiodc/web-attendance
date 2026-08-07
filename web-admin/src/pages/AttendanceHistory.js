import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAdminAttendanceHistoryApi } from '../services/api';
import { Calendar, Filter, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function AttendanceHistory() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set initial range: 1st of current month to today (matching web-client)
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dateTo, setDateTo] = useState(() => new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 600);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const formatDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const fromStr = formatDateString(dateFrom);
      const toStr = formatDateString(dateTo);
      const result = await getAdminAttendanceHistoryApi(fromStr, toStr, page, limit, debouncedSearch);
      setAttendances(result.data || []);
      setMeta(result.meta || null);
    } catch (err) {
      setError(err.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, page, limit, debouncedSearch]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttendanceHistory();
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

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // const attendances = attendances.filter((att) => {
  //   const empName = att.employee?.fullName || '';
  //   const empCode = att.employee?.employeeCode || '';
  //   return (
  //     empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     empCode.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // });

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Filter size={18} color="var(--primary)" />
            <span>Filter Date Range:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>From:</label>
            <DatePicker
              selected={dateFrom}
              onChange={(date) => { setDateFrom(date); setPage(1); }}
              selectsStart
              startDate={dateFrom}
              endDate={dateTo}
              maxDate={dateTo || new Date()}
              placeholderText="Select date"
              dateFormat="dd MMM yyyy"
              isClearable
              todayButton="Today"
              className="datepicker-input"
              popperPlacement="bottom-start"
              portalId="root"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>To:</label>
            <DatePicker
              selected={dateTo}
              onChange={(date) => { setDateTo(date); setPage(1); }}
              selectsEnd
              startDate={dateFrom}
              endDate={dateTo}
              minDate={dateFrom}
              maxDate={new Date()}
              placeholderText="Select date"
              dateFormat="dd MMM yyyy"
              isClearable
              todayButton="Today"
              className="datepicker-input"
              popperPlacement="bottom-start"
              portalId="root"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }} disabled={!dateFrom && !dateTo}>
            Apply Filter
          </button>

          {(dateFrom || dateTo) && (
            <button type="button" className="btn-secondary" style={{ padding: '8px 16px' }} onClick={handleClearFilter}>
              Reset
            </button>
          )}
        </form>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
          Showing <strong>{attendances.length}</strong> of <strong>{meta?.total || 0}</strong> attendance records (Read-Only)
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading attendance records...</td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No attendance records found for this period.</td>
                </tr>
              ) : (
                attendances.map((att) => {
                  const hasCheckedOut = !!att.checkOut;
                  return (
                    <tr key={att.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                          <Calendar size={15} color="var(--primary)" />
                          {att.attendanceDate}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{att.employee?.employeeCode || '-'}</span>
                      </td>
                      <td><strong>{att.employee?.fullName || 'Unknown Employee'}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
                          <Clock size={14} />
                          {formatTime(att.checkIn)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasCheckedOut ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                          <Clock size={14} />
                          {formatTime(att.checkOut)}
                        </div>
                      </td>
                      <td>
                        {hasCheckedOut ? (
                          <span className="badge badge-success">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <AlertCircle size={12} />
                            Checked In
                          </span>
                        )}
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
  );
}
