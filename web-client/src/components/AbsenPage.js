import React, { useState, useEffect } from 'react';
import { checkinApi, checkoutApi, getAttendanceHistoryApi } from '../services/api';
import 'react-datepicker/dist/react-datepicker.css';
import ModalEmployee from './ModalEmployee';
import HistoryTab from './HistoryTab';
import { formatDateLabel, formatTime, toLocalISODate, useNow } from '../helpers';

/* ── Absen Tab ── */
function AbsenTab({ user }) {
  const now = useNow();
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const todayStr = toLocalISODate(now);

  const fetchDataAttendanceToday = async () => {
    try {
      const result = await getAttendanceHistoryApi(1, 50, todayStr, todayStr);
      setTodayRecord(result.data[0] || null);
    } catch (_) { }

  }

  useEffect(() => {
    if (todayStr) fetchDataAttendanceToday()
  }, [todayStr]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const checkIn = now;
      await checkinApi(user.employeeId, todayStr, checkIn);
      setTodayRecord({ attendanceDate: todayStr, checkIn: checkIn.toISOString(), checkOut: null });
      showMessage('success', '✅ Absen masuk berhasil! Selamat bekerja.');
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const checkOut = now;
      await checkoutApi(user.employeeId, todayStr, checkOut);
      setTodayRecord((prev) => ({ ...prev, checkOut: checkOut.toISOString() }));
      showMessage('success', '🌅 Absen pulang berhasil! Sampai jumpa besok.');
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  return (
    <div>
      {/* Live clock */}
      <div className="card clock-widget">
        <div className="clock-time">
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="clock-date">
          {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      {/* Today's status */}
      <div className="status-card">
        <div className="status-row">
          <span className="status-label">Tanggal</span>
          <span className="status-value">{formatDateLabel(todayStr)}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Absen Masuk</span>
          <span className={`status-value ${hasCheckedIn ? 'highlight' : ''}`}>
            {hasCheckedIn ? formatTime(todayRecord.checkIn) : '—'}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Absen Pulang</span>
          <span className={`status-value ${hasCheckedOut ? 'highlight' : ''}`}>
            {hasCheckedOut ? formatTime(todayRecord.checkOut) : '—'}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Status</span>
          <span>
            {!hasCheckedIn && (
              <span className="badge badge-dim">Belum Absen</span>
            )}
            {hasCheckedIn && !hasCheckedOut && (
              <span className="badge badge-emerald">✓ Sudah Masuk</span>
            )}
            {hasCheckedOut && (
              <span className="badge badge-amber">✓ Sudah Pulang</span>
            )}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absen-btn-row">
        <button
          id="btn-absen-masuk"
          className="btn btn-checkin"
          onClick={handleCheckin}
          disabled={loading || hasCheckedIn}
        >
          Absen Masuk
        </button>
        <button
          id="btn-absen-pulang"
          className="btn btn-checkout"
          onClick={handleCheckout}
          disabled={loading || !hasCheckedIn || hasCheckedOut}
        >
          Absen Pulang
        </button>
      </div>
    </div>
  );
}

/* ── Main Absen Page ── */
export default function AbsenPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('absen');
  const [showAddModalProfile, setShowAddModalProfile] = useState(false);

  const initials = (user.fullName || user.email)
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleOpenModalProfile = () => {
    setShowAddModalProfile(true);
  };

  const handleCloseAddModalProfile = () => {
    setShowAddModalProfile(false);
  };

  return (
    <div className="app-shell">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">D</div>
          <div className="topbar-info">
            <div className="topbar-name">{user.fullName || user.email}</div>
            <div className="topbar-role">Karyawan · {user.employeeId}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, color: '#fff', marginRight: 4,
            cursor: 'pointer'
          }} onClick={handleOpenModalProfile}>
            {initials}
          </div>
          <button id="btn-logout" className="btn btn-ghost" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </div>

      <div className="tab-nav">
        <button
          id="tab-absen"
          className={`tab-btn ${activeTab === 'absen' ? 'active' : ''}`}
          onClick={() => setActiveTab('absen')}
        >
          Absen
        </button>
        <button
          id="tab-history"
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Riwayat
        </button>
      </div>

      {activeTab === 'absen' && <AbsenTab user={user} />}
      {activeTab === 'history' && <HistoryTab />}

      {showAddModalProfile && <ModalEmployee onClose={handleCloseAddModalProfile} user={user} />}
    </div>
  );
}
