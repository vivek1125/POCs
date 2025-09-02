import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const services = [
  { name: 'Customer', path: '/customer' },
  { name: 'Account', path: '/account' },
  { name: 'Transaction', path: '/transaction' },
  { name: 'TestAllAPI', path: '/testapi' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav style={{ width: '30%', minWidth: 180, maxWidth: 260, borderRight: '2px solid #e0e0e0', background: '#fff', height: '100vh', boxSizing: 'border-box' }}>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {services.map(service => {
          const selected = location.pathname.startsWith(service.path);
          return (
            <li
              key={service.name}
              onMouseEnter={() => setHovered(service.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(service.path)}
              style={{
                padding: '16px 24px',
                cursor: 'pointer',
                fontWeight: selected ? 'bold' : 'normal',
                background: selected ? '#fff9c4' : hovered === service.name ? '#f5f5f5' : 'transparent',
                color: selected ? '#333' : '#1976d2',
                borderLeft: selected ? '4px solid #ffd600' : '4px solid transparent',
                transition: 'background 0.2s, font-weight 0.2s',
              }}
            >
              {service.name}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
