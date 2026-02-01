import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Account from '../pages/Account';
import { AuthProvider } from '../context/AuthContext';
import AccountApiService from '../api/AccountApiService';

// Mock dependencies
jest.mock('../api/AccountApiService');
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn(),
}));

const mockAccountApiService = AccountApiService as jest.Mocked<typeof AccountApiService>;
const mockUseAuth = require('../context/AuthContext').useAuth;

// Mock account data
const mockAccount = {
  accountNumber: 900123,
  customerId: 1,
  accountType: 'Savings',
  balance: 1500.50,
  isActive: true,
  status: 'Activate',
  createdOn: '2024-01-01T00:00:00Z'
};

const mockAccounts = [
  mockAccount,
  {
    accountNumber: 900124,
    customerId: 2,
    accountType: 'Checking',
    balance: 2500.75,
    isActive: false,
    status: 'Deactivate',
    createdOn: '2024-01-02T00:00:00Z'
  }
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('Account Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useAuth
    mockUseAuth.mockReturnValue({
      user: { userName: 'testuser', role: 'Admin' },
      token: 'mock-token'
    });
  });

  describe('Initial Render Tests', () => {
    test('should render account management title', () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      expect(screen.getByText('Account Management')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search Account' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    test('should show initial help text when no accounts', () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      expect(screen.getByText(/Use the search function to find accounts/)).toBeInTheDocument();
    });
  });

  describe('Search Account Tests', () => {
    test('should show search form when search button clicked', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      const searchButton = screen.getByRole('button', { name: 'Search Account' });
      await userEvent.click(searchButton);

      expect(screen.getByText('Search Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Account Number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel Search' })).toBeInTheDocument();
    });

    test('should hide search form when cancel button clicked', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      expect(screen.getByPlaceholderText('Account Number')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel Search' }));
      expect(screen.queryByPlaceholderText('Account Number')).not.toBeInTheDocument();
    });

    test('should require account number for search', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('Please enter an account number')).toBeInTheDocument();
      });

      expect(mockAccountApiService.getAccountByAccountNumber).not.toHaveBeenCalled();
    });

    test('should successfully search for account', async () => {
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      
      const accountNumberInput = screen.getByPlaceholderText('Account Number');
      await userEvent.type(accountNumberInput, '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(mockAccountApiService.getAccountByAccountNumber).toHaveBeenCalledWith(900123);
        expect(screen.getByText('Search Result')).toBeInTheDocument();
        expect(screen.getByText('900123')).toBeInTheDocument();
        expect(screen.getByText('$1500.50')).toBeInTheDocument();
      });
    });

    test('should handle search error', async () => {
      const errorMessage = 'Account not found';
      mockAccountApiService.getAccountByAccountNumber.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '999999');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should add searched account to table', async () => {
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('Account Number')).toBeInTheDocument(); // Table header
        expect(screen.getAllByText('900123')).toHaveLength(2); // Search result + table row
      });
    });
  });

  describe('Create Account Tests', () => {
    test('should show create account form when button clicked', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      const createButton = screen.getByRole('button', { name: 'Create Account' });
      await userEvent.click(createButton);

      expect(screen.getByText('Create New Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Customer ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Initial Balance')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Savings')).toBeInTheDocument();
    });

    test('should hide create form when cancel button clicked', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      expect(screen.getByPlaceholderText('Customer ID')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByPlaceholderText('Customer ID')).not.toBeInTheDocument();
    });

    test('should successfully create account', async () => {
      const newAccount = {
        accountNumber: 900125,
        customerId: 3,
        accountType: 'Checking',
        balance: 1000.00,
        isActive: true,
        status: 'Activate',
        createdOn: '2024-01-03T00:00:00Z'
      };

      mockAccountApiService.createAccount.mockResolvedValueOnce(newAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await userEvent.type(screen.getByPlaceholderText('Customer ID'), '3');
      await userEvent.type(screen.getByPlaceholderText('Initial Balance'), '1000');
      
      const accountTypeSelect = screen.getByDisplayValue('Savings');
      await userEvent.selectOptions(accountTypeSelect, 'Checking');

      const createSubmitButton = screen.getByRole('button', { name: 'Create Account' });
      await userEvent.click(createSubmitButton);

      await waitFor(() => {
        expect(mockAccountApiService.createAccount).toHaveBeenCalledWith({
          customerId: 3,
          initialBalance: 1000,
          accountType: 'Checking'
        });
        expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
        expect(screen.getByText('900125')).toBeInTheDocument();
      });
    });

    test('should handle create account error', async () => {
      const errorMessage = 'Failed to create account';
      mockAccountApiService.createAccount.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await userEvent.type(screen.getByPlaceholderText('Customer ID'), '3');
      await userEvent.type(screen.getByPlaceholderText('Initial Balance'), '1000');

      const createSubmitButton = screen.getByRole('button', { name: 'Create Account' });
      await userEvent.click(createSubmitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Update Balance Tests', () => {
    beforeEach(async () => {
      // Setup with a searched account in the table
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);
      
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('Update Balance')).toBeInTheDocument();
      });
    });

    test('should show update balance form when button clicked', async () => {
      const updateButton = screen.getByRole('button', { name: 'Update Balance' });
      await userEvent.click(updateButton);

      expect(screen.getByText('Update Balance for Account 900123')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Balance')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    test('should successfully update balance', async () => {
      const updatedAccount = { ...mockAccount, balance: 2000.00 };
      mockAccountApiService.updateBalance.mockResolvedValueOnce(updatedAccount);

      const updateButton = screen.getByRole('button', { name: 'Update Balance' });
      await userEvent.click(updateButton);

      await userEvent.type(screen.getByPlaceholderText('New Balance'), '2000');
      await userEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(mockAccountApiService.updateBalance).toHaveBeenCalledWith(900123, { newBalance: 2000 });
        expect(screen.getByText('Balance updated successfully!')).toBeInTheDocument();
      });
    });

    test('should handle update balance error', async () => {
      const errorMessage = 'Failed to update balance';
      mockAccountApiService.updateBalance.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      const updateButton = screen.getByRole('button', { name: 'Update Balance' });
      await userEvent.click(updateButton);

      await userEvent.type(screen.getByPlaceholderText('New Balance'), '2000');
      await userEvent.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should close update form when cancel clicked', async () => {
      const updateButton = screen.getByRole('button', { name: 'Update Balance' });
      await userEvent.click(updateButton);

      expect(screen.getByPlaceholderText('New Balance')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByPlaceholderText('New Balance')).not.toBeInTheDocument();
    });
  });

  describe('Account Status Management Tests', () => {
    beforeEach(async () => {
      // Setup with a searched account in the table
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);
      
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('Deactivate')).toBeInTheDocument();
      });
    });

    test('should show deactivate button for active accounts', async () => {
      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        expect(deactivateButton).toBeInTheDocument();
        expect(deactivateButton).toHaveStyle('background-color: red');
      });
    });

    test('should successfully deactivate account', async () => {
      mockAccountApiService.deleteAccount.mockResolvedValueOnce();
      window.confirm = jest.fn().mockReturnValue(true);

      const deactivateButton = screen.getByText('Deactivate');
      await userEvent.click(deactivateButton);

      await waitFor(() => {
        expect(mockAccountApiService.deleteAccount).toHaveBeenCalledWith(900123);
      });
    });

    test('should successfully activate account', async () => {
      // Setup with inactive account
      const inactiveAccount = { ...mockAccount, isActive: false, status: 'Deactivate' };
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(inactiveAccount);
      mockAccountApiService.activateAccount.mockResolvedValueOnce();
      window.confirm = jest.fn().mockReturnValue(true);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        const activateButton = screen.getByText('Activate');
        userEvent.click(activateButton);
      });

      await waitFor(() => {
        expect(mockAccountApiService.activateAccount).toHaveBeenCalledWith(900123);
      });
    });

    test('should not change status when confirmation cancelled', async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      const deactivateButton = screen.getByText('Deactivate');
      await userEvent.click(deactivateButton);

      expect(mockAccountApiService.deleteAccount).not.toHaveBeenCalled();
    });

    test('should handle status change error', async () => {
      const errorMessage = 'Failed to update account status';
      mockAccountApiService.deleteAccount.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });
      window.confirm = jest.fn().mockReturnValue(true);

      const deactivateButton = screen.getByText('Deactivate');
      await userEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Permission Tests', () => {
    test('should disable status buttons for non-admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { userName: 'testuser', role: 'Customer' },
        token: 'mock-token'
      });

      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        // Should not show activate/deactivate buttons for non-admin
        expect(screen.queryByText('Deactivate')).not.toBeInTheDocument();
        expect(screen.queryByText('Activate')).not.toBeInTheDocument();
      });
    });

    test('should enable status buttons for admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { userName: 'testuser', role: 'Admin' },
        token: 'mock-token'
      });

      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('Deactivate')).toBeInTheDocument();
      });
    });
  });

  describe('UI Display Tests', () => {
    test('should display account data correctly in table', async () => {
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getByText('900123')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Savings')).toBeInTheDocument();
        expect(screen.getByText('$1500.50')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    test('should display inactive status correctly', async () => {
      const inactiveAccount = { ...mockAccount, isActive: false, status: 'Deactivate' };
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(inactiveAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        const statusElement = screen.getByText('Inactive');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveStyle('color: red');
      });
    });

    test('should disable update balance for inactive accounts', async () => {
      const inactiveAccount = { ...mockAccount, isActive: false, status: 'Deactivate' };
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(inactiveAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        const updateButton = screen.getByText('Update Balance');
        expect(updateButton).toBeDisabled();
      });
    });

    test('should format currency correctly', async () => {
      const accountWithDecimals = { ...mockAccount, balance: 1234.56 };
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(accountWithDecimals);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getAllByText('$1234.56')).toHaveLength(2); // Search result + table
      });
    });

    test('should format date correctly', async () => {
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getAllByText('1/1/2024')).toHaveLength(2); // Search result + table
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle duplicate search results', async () => {
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);

      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      // Search first time
      await userEvent.click(screen.getByRole('button', { name: 'Search Account' }));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(screen.getAllByText('900123')).toHaveLength(2); // Search result + table
      });

      // Search same account again
      mockAccountApiService.getAccountByAccountNumber.mockResolvedValueOnce(mockAccount);
      
      await userEvent.clear(screen.getByPlaceholderText('Account Number'));
      await userEvent.type(screen.getByPlaceholderText('Account Number'), '900123');
      await userEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        // Should still only have one row in table
        expect(screen.getAllByText('900123')).toHaveLength(2); // Search result + one table row
      });
    });

    test('should handle empty form submission gracefully', async () => {
      render(
        <TestWrapper>
          <Account />
        </TestWrapper>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      
      const createSubmitButton = screen.getByRole('button', { name: 'Create Account' });
      await userEvent.click(createSubmitButton);

      // Should not call API with invalid data
      expect(mockAccountApiService.createAccount).not.toHaveBeenCalled();
    });
  });
});
