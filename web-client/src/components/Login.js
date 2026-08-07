import React, { useState } from 'react';
import { loginApi } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password);

      localStorage.setItem('wc_token', data.access_token);
      localStorage.setItem('wc_user', JSON.stringify({
        employeeId: data.user.employeeId,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.fullName || data.user.email,
      }));
      onLogin({
        employeeId: data.user.employeeId,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.fullName || data.user.email,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card login-card">
        <div className="login-brand">
          <div className="login-logo">D</div>
          <div className="login-title">Dexa Group</div>
          <div className="login-subtitle">Portal Absensi Karyawan</div>
        </div>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="email@dexagroup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
