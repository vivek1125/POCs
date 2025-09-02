
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header style={{ backgroundColor: 'orange', padding: '10px', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1 style={{ margin: 0 }}>Lena Dena Bank</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* <img src="/path/to/avatar.png" alt="User Avatar" style={{ borderRadius: '50%' }} /> */}
        {user && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{user.userName}</div>
            <div style={{ fontSize: '0.9em', color: '#333' }}>{user.role ? user.role : ''}</div>
          </div>
        )}
        <button onClick={handleLogout} style={{ padding: '6px 16px', background: '#fff', border: '1px solid #333', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
