import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../pages/Signup';
import * as authHelpers from '../api/authHelpers';

// Mock dependencies
jest.mock('../api/authHelpers');

const mockAuthHelpers = authHelpers as jest.Mocked<typeof authHelpers>;

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render Tests', () => {
    test('should render signup form correctly', () => {
      render(<Signup />);

      expect(screen.getByText('Signup Form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Customer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Signup' })).toBeInTheDocument();
    });

    test('should have signup button disabled initially', () => {
      render(<Signup />);
      
      const signupButton = screen.getByRole('button', { name: 'Signup' });
      expect(signupButton).toBeDisabled();
    });

    test('should have required attributes on inputs', () => {
      render(<Signup />);

      expect(screen.getByPlaceholderText('Username')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Email Address')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Confirm password')).toHaveAttribute('required');
    });

    test('should have hidden tab navigation', () => {
      render(<Signup />);
      
      const tabContainer = screen.getByText('Signup').parentElement;
      expect(tabContainer).toHaveStyle('visibility: hidden');
    });
  });

  describe('Form Validation Tests', () => {
    test('should enable submit button when all fields are filled correctly', async () => {
      render(<Signup />);

      const signupButton = screen.getByRole('button', { name: 'Signup' });
      expect(signupButton).toBeDisabled();

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');

      expect(signupButton).toBeEnabled();
    });

    test('should disable submit button when passwords do not match', async () => {
      render(<Signup />);

      const signupButton = screen.getByRole('button', { name: 'Signup' });

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'differentpassword');

      expect(signupButton).toBeDisabled();
    });

    test('should disable submit button when any field is empty', async () => {
      render(<Signup />);

      const signupButton = screen.getByRole('button', { name: 'Signup' });

      // Fill some but not all fields
      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      // Leave confirm password empty

      expect(signupButton).toBeDisabled();
    });

    test('should validate email format', () => {
      render(<Signup />);
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('should validate password fields are of type password', () => {
      render(<Signup />);
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Role Selection Tests', () => {
    test('should have Customer as default role', () => {
      render(<Signup />);
      
      const roleSelect = screen.getByDisplayValue('Customer');
      expect(roleSelect).toBeInTheDocument();
    });

    test('should allow changing role to Admin', async () => {
      render(<Signup />);
      
      const roleSelect = screen.getByDisplayValue('Customer');
      await userEvent.selectOptions(roleSelect, 'Admin');
      
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
    });

    test('should allow changing role to Guest', async () => {
      render(<Signup />);
      
      const roleSelect = screen.getByDisplayValue('Customer');
      await userEvent.selectOptions(roleSelect, 'Guest');
      
      expect(screen.getByDisplayValue('Guest')).toBeInTheDocument();
    });

    test('should include role in form submission', async () => {
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      mockAuthHelpers.registerWithFallback.mockResolvedValueOnce(mockResponse as any);

      render(<Signup />);

      const roleSelect = screen.getByDisplayValue('Customer');
      await userEvent.selectOptions(roleSelect, 'Admin');

      await userEvent.type(screen.getByPlaceholderText('Username'), 'adminuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'admin@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(mockAuthHelpers.registerWithFallback).toHaveBeenCalledWith({
          userName: 'adminuser',
          email: 'admin@example.com',
          password: 'password123',
          role: 'Admin',
          confirmPassword: 'password123'
        });
      });
    });
  });

  describe('Form Submission Tests', () => {
    test('should handle successful signup', async () => {
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      mockAuthHelpers.registerWithFallback.mockResolvedValueOnce(mockResponse as any);

      render(<Signup />);

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
    });

    test('should handle signup with password mismatch', async () => {
      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'differentpassword');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
      });

      // Should not call the API
      expect(mockAuthHelpers.registerWithFallback).not.toHaveBeenCalled();
    });

    test('should handle signup error from API', async () => {
      const errorMessage = 'Username already exists';
      mockAuthHelpers.registerWithFallback.mockRejectedValueOnce(new Error(errorMessage));
      mockAuthHelpers.extractApiError.mockReturnValueOnce(errorMessage);

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'existinguser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'existing@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });

    test('should handle API error without extractApiError return value', async () => {
      mockAuthHelpers.registerWithFallback.mockRejectedValueOnce(new Error('API Error'));
      mockAuthHelpers.extractApiError.mockReturnValueOnce('');

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to create account');
      });
    });

    test('should show loading state during signup', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthHelpers.registerWithFallback.mockReturnValueOnce(mockPromise as any);

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
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

    test('should disable submit button during loading', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthHelpers.registerWithFallback.mockReturnValueOnce(mockPromise as any);

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      const loadingButton = screen.getByRole('button', { name: 'Signing up…' });
      expect(loadingButton).toBeDisabled();

      resolvePromise!({ data: 'success' });

      await waitFor(() => {
        const signupButton = screen.getByRole('button', { name: 'Signup' });
        expect(signupButton).toBeEnabled();
      });
    });
  });

  describe('State Management Tests', () => {
    test('should clear error state on successful submission', async () => {
      // First, trigger an error
      mockAuthHelpers.registerWithFallback.mockRejectedValueOnce(new Error('Error'));
      mockAuthHelpers.extractApiError.mockReturnValueOnce('Error message');

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Error message');
      });

      // Now mock a successful response
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      mockAuthHelpers.registerWithFallback.mockResolvedValueOnce(mockResponse as any);

      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.queryByText('Error message')).not.toBeInTheDocument();
        expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
      });
    });

    test('should clear success state on new submission', async () => {
      // First successful submission
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      mockAuthHelpers.registerWithFallback.mockResolvedValueOnce(mockResponse as any);

      render(<Signup />);

      await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Email Address'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
      });

      // Second submission with error
      mockAuthHelpers.registerWithFallback.mockRejectedValueOnce(new Error('New error'));
      mockAuthHelpers.extractApiError.mockReturnValueOnce('New error');

      await userEvent.click(screen.getByRole('button', { name: 'Signup' }));

      await waitFor(() => {
        expect(screen.queryByText('Account created successfully!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Input Field Tests', () => {
    test('should update input values correctly', async () => {
      render(<Signup />);

      const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const confirmInput = screen.getByPlaceholderText('Confirm password') as HTMLInputElement;

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'password123');

      expect(usernameInput.value).toBe('testuser');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(confirmInput.value).toBe('password123');
    });

    test('should handle empty input fields', () => {
      render(<Signup />);

      const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('Email Address') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      const confirmInput = screen.getByPlaceholderText('Confirm password') as HTMLInputElement;

      expect(usernameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(confirmInput.value).toBe('');
    });
  });
});
