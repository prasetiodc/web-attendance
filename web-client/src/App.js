import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AbsenPage from './components/AbsenPage';
import './index.css';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('wc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && localStorage.getItem('wc_token')) {
      setUser(stored);
    }
    setReady(true);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('wc_token');
    localStorage.removeItem('wc_user');
    setUser(null);
  };

  if (!ready) return null;

  return user
    ? <AbsenPage user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
