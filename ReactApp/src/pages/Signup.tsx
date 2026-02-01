import React, { useMemo, useState } from 'react';
import apiService from '../api/apiService';
import { extractApiError, registerWithFallback } from '../api/authHelpers';
import './auth.css';

const Signup: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => userName && email && password && confirm && password === confirm,
    [userName, email, password, confirm]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await registerWithFallback({ userName, email, password, role, confirmPassword: confirm });
      setSuccess(true);
    } catch (err: any) {
      setError(extractApiError(err) || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Signup Form</h1>
        <div className="auth-tabs" style={{ visibility: 'hidden' }}>
          <button className="tab-btn active">Signup</button>
          <button className="tab-btn">Login</button>
        </div>
        <form className="auth-form" onSubmit={handleSignup}>
          <input className="auth-input" type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          <input className="auth-input" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="Guest">Guest</option>
          </select>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success">Account created successfully!</div>}
          <button className="auth-btn" type="submit" disabled={!canSubmit || loading}>
            {loading ? 'Signing up…' : 'Signup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
