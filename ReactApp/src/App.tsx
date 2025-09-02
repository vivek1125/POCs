
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginSignup from './pages/Login';
// ...existing code...
import Customer from './pages/Customer';
import Account from './pages/Account';
import Transaction from './pages/Transaction';
import TestAllAPI from './pages/TestAllAPI';
import './App.css';

const AppContent: React.FC = () => {
  const { token } = useAuth();
  if (!token) {
    // Only show login/signup if not authenticated
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginSignup />} />
      </Routes>
    );
  }
  // Show main layout if authenticated
  return (
    <>
      <Header />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation />
        <main style={{ padding: '10px', width: '70%' }}>
          <Routes>
            <Route path="/customer" element={<Customer />} />
            <Route path="/account" element={<Account />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/testapi" element={<TestAllAPI />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
