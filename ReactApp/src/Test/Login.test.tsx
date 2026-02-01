import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginSignup from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import apiService from '../api/apiService';
import * as authHelpers from '../api/authHelpers';

// Mock dependencies
jest.mock('../api/apiService');
jest.mock('../api/authHelpers');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockAuthHelpers = authHelpers as jest.Mocked<typeof authHelpers>;
const mockNavigate = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('LoginSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  describe('Initial Render Tests', () => {
    test('should render login form by default', () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      expect(screen.getByText('Login Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('User Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    test('should have correct tab states', () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const loginTab = screen.getByRole('tab', { name: 'Login' });
      const signupTab = screen.getByRole('tab', { name: 'Signup' });

      expect(loginTab).toHaveClass('active');
      expect(signupTab).not.toHaveClass('active');
      expect(loginTab.getAttribute('aria-selected')).toBe('true');
      expect(signupTab.getAttribute('aria-selected')).toBe('false');
    });

    test('should have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const tabList = screen.getByRole('tablist');
      const loginForm = screen.getByLabelText('Login form');
      
      expect(tabList).toHaveAttribute('aria-label', 'Authentication');
      expect(loginForm).toBeInTheDocument();
    });
  });

  describe('Tab Navigation Tests', () => {
    test('should switch to signup tab when clicked', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const signupTab = screen.getByRole('tab', { name: 'Signup' });
      await userEvent.click(signupTab);

      expect(screen.getByText('Signup Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    });

    test('should switch back to login tab when clicked', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      // Switch to signup first
      await userEvent.click(screen.getByRole('tab', { name: 'Signup' }));
      expect(screen.getByText('Signup Form')).toBeInTheDocument();

      // Switch back to login
      await userEvent.click(screen.getByRole('tab', { name: 'Login' }));
      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });

    test('should switch to signup via footer link', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const signupLink = screen.getByRole('button', { name: 'Signup now' });
      await userEvent.click(signupLink);

      expect(screen.getByText('Signup Form')).toBeInTheDocument();
    });
  });

  describe('Login Form Tests', () => {
    test('should enable login button when fields are filled', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const usernameInput = screen.getByPlaceholderText('User Name');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      expect(loginButton).toBeDisabled();

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      expect(loginButton).toBeEnabled();
    });

    test('should disable login button when fields are empty', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const usernameInput = screen.getByPlaceholderText('User Name');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      await userEvent.type(usernameInput, 'test');
      await userEvent.clear(usernameInput);
      await userEvent.type(passwordInput, 'password');

      expect(loginButton).toBeDisabled();
    });

    test('should handle successful login', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          userName: 'testuser',
          email: 'test@example.com',
          role: 'Customer'
        }
      };

      mockApiService.post.mockResolvedValueOnce(mockResponse);

      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      await userEvent.type(screen.getByPlaceholderText('User Name'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/api/Auth/login', {
          userName: 'testuser',
          password: 'password123'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/customer');
      });
    });

    test('should handle login error with message', async () => {
      const errorMessage = 'Invalid credentials';
      mockApiService.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      await userEvent.type(screen.getByPlaceholderText('User Name'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });

    test('should handle login error without response', async () => {
      mockApiService.post.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      await userEvent.type(screen.getByPlaceholderText('User Name'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
      });
    });

    test('should handle missing token in response', async () => {
      mockApiService.post.mockResolvedValueOnce({
        data: { userName: 'testuser' } // Missing token
      });

      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      await userEvent.type(screen.getByPlaceholderText('User Name'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Login failed: no token returned');
      });
    });

    test('should show loading state during login', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiService.post.mockReturnValueOnce(mockPromise as any);

      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      await userEvent.type(screen.getByPlaceholderText('User Name'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      expect(screen.getByRole('button', { name: 'Logging in…' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Logging in…' })).toBeDisabled();

      resolvePromise!({
        data: { token: 'token', userName: 'testuser' }
      });

      await waitFor(() => {
        expect(screen.queryByText('Logging in…')).not.toBeInTheDocument();
      });
    });
  });

  describe('Signup Form Tests', () => {
    beforeEach(async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );
      await userEvent.click(screen.getByRole('tab', { name: 'Signup' }));
    });

    test('should render signup form correctly', () => {
      expect(screen.getByText('Signup Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Customer')).toBeInTheDocument();
    });

    test('should enable signup button when all fields are filled correctly', async () => {
      const signupButton = screen.getByRole('button', { name: 'Signup' });

      expect(signupButton).toBeDisabled();

      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');

      expect(signupButton).toBeEnabled();
    });

    test('should disable signup button when passwords do not match', async () => {
      const signupButton = screen.getByRole('button', { name: 'Signup' });

      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'differentpassword');

      expect(signupButton).toBeDisabled();
    });

    test('should handle successful signup', async () => {
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      mockAuthHelpers.registerWithFallback.mockResolvedValueOnce(mockResponse as any);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(mockAuthHelpers.registerWithFallback).toHaveBeenCalledWith({
          userName: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          role: 'Customer',
          confirmPassword: 'password123'
        });
        expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
      });

      // Should switch to login tab after successful signup
      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });

    test('should handle signup error', async () => {
      const errorMessage = 'Username already exists';
      mockAuthHelpers.registerWithFallback.mockRejectedValueOnce(new Error(errorMessage));
      mockAuthHelpers.extractApiError.mockReturnValueOnce(errorMessage);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'existinguser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'existing@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });

    test('should validate password mismatch', async () => {
      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'differentpassword');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
      });
    });

    test('should change role selection', async () => {
      const roleSelect = screen.getByDisplayValue('Customer');

      await userEvent.selectOptions(roleSelect, 'Admin');
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();

      await userEvent.selectOptions(roleSelect, 'Guest');
      expect(screen.getByDisplayValue('Guest')).toBeInTheDocument();
    });

    test('should show loading state during signup', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthHelpers.registerWithFallback.mockReturnValueOnce(mockPromise as any);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      expect(screen.getByRole('button', { name: 'Signing up…' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Signing up…' })).toBeDisabled();

      resolvePromise!({ data: 'success' });

      await waitFor(() => {
        expect(screen.queryByText('Signing up…')).not.toBeInTheDocument();
      });
    });

    test('should switch to login via footer link', async () => {
      const loginLink = screen.getByRole('button', { name: 'Login' });
      await userEvent.click(loginLink);

      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });
  });

  describe('Form Validation Tests', () => {
    test('should have required attributes on login inputs', () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('User Name')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('required');
    });

    test('should have proper autocomplete attributes', () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('User Name')).toHaveAttribute('autoComplete', 'username');
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('autoComplete', 'current-password');
    });

    test('should prevent default on forgot password link', async () => {
      render(
        <TestWrapper>
          <LoginSignup />
        </TestWrapper>
      );

      const forgotLink = screen.getByText('Forgot password?');
      await userEvent.click(forgotLink);

      // Should not navigate (preventDefault should be called)
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
