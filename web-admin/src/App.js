import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceHistory from './pages/AttendanceHistory';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Employee Management',
  '/history': 'Attendance History',
};

export default function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const title = PAGE_TITLES[location.pathname] ?? 'Admin Panel';

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} />

      <main className="main-content">
        <Navbar title={title} user={user} />

        <Routes>
          <Route path="/" element={<EmployeeManagement />} />
          <Route path="/history" element={<AttendanceHistory />} />
          {/* catch-all: redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
