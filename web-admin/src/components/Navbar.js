import React from 'react';

export default function Navbar({ title, user }) {
  return (
    <header className="top-navbar">
      <h1 className="page-title">{title}</h1>

      <div className="user-badge">
        <div className="user-avatar">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
        </div>
        <div style={{ fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.email || 'Admin User'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Role: {user?.role || 'admin'}</div>
        </div>
      </div>
    </header>
  );
}
