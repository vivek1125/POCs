import React, { useMemo, useState } from 'react';
import apiService from '../api/apiService';
import { extractApiError, registerWithFallback } from '../api/authHelpers';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './auth.css';

type TabKey = 'login' | 'signup';

const LoginSignup: React.FC = () => {
  // Which tab is active
  const [tab, setTab] = useState<TabKey>('login');

  // Login state
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupUserName, setSignupUserName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState('Customer');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const canLogin = useMemo(() => loginUserName.trim() && loginPassword.trim(), [loginUserName, loginPassword]);
  const canSignup = useMemo(() => (
    signupUserName.trim() && signupEmail.trim() && signupPassword && signupConfirm && signupPassword === signupConfirm
  ), [signupUserName, signupEmail, signupPassword, signupConfirm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canLogin) return;
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await apiService.post('/api/Auth/login', { userName: loginUserName, password: loginPassword });
      const data = response.data;
      if (!data || !data.token) {
        setLoginError('Login failed: no token returned');
        return;
      }
      const userObj = {
        userName: data.userName ?? loginUserName,
        email: data.email,
        role: data.role,
      };
      login(userObj, data.token);
      navigate('/customer');
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match');
      return;
    }
    setSignupLoading(true);
    setSignupError('');
    setSignupSuccess(false);
    try {
      await registerWithFallback({
        userName: signupUserName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        confirmPassword: signupConfirm,
      });
      setSignupSuccess(true);
      // After success, switch to login tab
      setTab('login');
    } catch (err: any) {
      setSignupError(extractApiError(err) || 'Failed to create account');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{tab === 'login' ? 'Login Form' : 'Signup Form'}</h1>
        <div className="auth-tabs" role="tablist" aria-label="Authentication">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            role="tab"
            aria-selected={tab === 'signup'}
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Signup
          </button>
        </div>

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin} aria-label="Login form">
            <input
              className="auth-input"
              type="text"
              placeholder="User Name"
              value={loginUserName}
              onChange={(e) => setLoginUserName(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="auth-row">
              <a className="link-muted" href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
            {loginError && <div className="auth-error" role="alert">{loginError}</div>}
            <button className="auth-btn" type="submit" disabled={!canLogin || loginLoading}>
              {loginLoading ? 'Logging in…' : 'Login'}
            </button>
            <div className="auth-footer">
              <span>Not a member?</span>
              <button className="link-primary" type="button" onClick={() => setTab('signup')}>Signup now</button>
            </div>
          </form>
        )}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup} aria-label="Signup form">
            <input
              className="auth-input"
              type="text"
              placeholder="Username"
              value={signupUserName}
              onChange={(e) => setSignupUserName(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              className="auth-input"
              type="email"
              placeholder="Email Address"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm password"
              value={signupConfirm}
              onChange={(e) => setSignupConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            <select className="auth-input" value={signupRole} onChange={e => setSignupRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="Customer">Customer</option>
              <option value="Guest">Guest</option>
            </select>
            {signupError && <div className="auth-error" role="alert">{signupError}</div>}
            {signupSuccess && <div className="auth-success">Account created successfully!</div>}
            <button className="auth-btn" type="submit" disabled={!canSignup || signupLoading}>
              {signupLoading ? 'Signing up…' : 'Signup'}
            </button>
            <div className="auth-footer">
              <span>Already have an account?</span>
              <button className="link-primary" type="button" onClick={() => setTab('login')}>Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
