import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, CalendarCheck, LogOut, Shield } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-logo">
          <Shield size={22} />
        </div>
        <div>
          <div className="brand-title">Dexa Group</div>
          <div className="brand-subtitle">Admin Control Panel</div>
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Users size={18} />
          <span>Employee Management</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <CalendarCheck size={18} />
          <span>Attendance History</span>
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
