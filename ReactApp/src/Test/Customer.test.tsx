import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Customer from '../pages/Customer';
import { AuthProvider } from '../context/AuthContext';
import CustomerApiService from '../api/CustomerApiService';

// Mock dependencies
jest.mock('../api/CustomerApiService');
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn(),
}));

const mockCustomerApiService = CustomerApiService as jest.Mocked<typeof CustomerApiService>;
const mockUseAuth = require('../context/AuthContext').useAuth;

// Mock customer data
const mockCustomers = [
  {
    customerId: 1,
    customerName: 'John Doe',
    customerMobile: '1234567890',
    customerEmail: 'john@example.com',
    customerAddress: '123 Main St',
    status: 'Activate'
  },
  {
    customerId: 2,
    customerName: 'Jane Smith',
    customerMobile: '0987654321',
    customerEmail: 'jane@example.com',
    customerAddress: '456 Oak Ave',
    status: 'Deactivate'
  }
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('Customer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useAuth
    mockUseAuth.mockReturnValue({
      user: { userName: 'testuser', role: 'Admin' },
      token: 'mock-token'
    });
  });

  describe('Initial Render Tests', () => {
    test('should render customer list title', async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      expect(screen.getByText('Customer List')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Customer' })).toBeInTheDocument();
    });

    test('should show loading state initially', () => {
      mockCustomerApiService.getCustomers.mockReturnValueOnce(new Promise(() => {}));

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should render customer table with headers', async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Id')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Mobile')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Address')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
      });
    });
  });

  describe('Customer Data Loading Tests', () => {
    test('should load and display customer data', async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    test('should handle empty customer array', async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce([]);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Customer List')).toBeInTheDocument();
      });
    });

    test('should handle non-array response', async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce({ data: 'invalid' } as any);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Customer List')).toBeInTheDocument();
      });
    });

    test('should handle API error', async () => {
      const errorMessage = 'Failed to fetch customers';
      mockCustomerApiService.getCustomers.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should handle network error', async () => {
      mockCustomerApiService.getCustomers.mockRejectedValueOnce({
        message: 'Network Error'
      });

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    test('should handle unknown error', async () => {
      mockCustomerApiService.getCustomers.mockRejectedValueOnce({});

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch customers')).toBeInTheDocument();
      });
    });
  });

  describe('Add Customer Form Tests', () => {
    beforeEach(async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);
      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('should show add customer form when button clicked', async () => {
      const addButton = screen.getByRole('button', { name: 'Add Customer' });
      await userEvent.click(addButton);

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Mobile')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    test('should hide form when cancel button clicked', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
    });

    test('should require all fields for form submission', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));

      const addSubmitButton = screen.getByRole('button', { name: 'Add' });
      await userEvent.click(addSubmitButton);

      // Form should not submit without all required fields
      expect(mockCustomerApiService.addCustomer).not.toHaveBeenCalled();
    });

    test('should successfully add customer', async () => {
      const newCustomer = {
        customerId: 3,
        customerName: 'New Customer',
        customerMobile: '5555555555',
        customerEmail: 'new@example.com',
        customerAddress: '789 New St',
        status: 'Activate'
      };

      mockCustomerApiService.addCustomer.mockResolvedValueOnce(newCustomer);

      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));

      await userEvent.type(screen.getByPlaceholderText('Name'), 'New Customer');
      await userEvent.type(screen.getByPlaceholderText('Mobile'), '5555555555');
      await userEvent.type(screen.getByPlaceholderText('Email'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('Address'), '789 New St');

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(mockCustomerApiService.addCustomer).toHaveBeenCalledWith({
          customerName: 'New Customer',
          customerMobile: '5555555555',
          customerEmail: 'new@example.com',
          customerAddress: '789 New St'
        });
        expect(screen.getByText('Customer added!')).toBeInTheDocument();
        expect(screen.getByText('New Customer')).toBeInTheDocument();
      });

      // Form should be hidden after successful submission
      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
    });

    test('should handle add customer error', async () => {
      const errorMessage = 'Failed to add customer';
      mockCustomerApiService.addCustomer.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));

      await userEvent.type(screen.getByPlaceholderText('Name'), 'Test Customer');
      await userEvent.type(screen.getByPlaceholderText('Mobile'), '1234567890');
      await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Address'), 'Test Address');

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should handle add customer with no returned data', async () => {
      mockCustomerApiService.addCustomer.mockResolvedValueOnce(null as any);

      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));

      await userEvent.type(screen.getByPlaceholderText('Name'), 'Test Customer');
      await userEvent.type(screen.getByPlaceholderText('Mobile'), '1234567890');
      await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('Address'), 'Test Address');

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to add customer')).toBeInTheDocument();
      });
    });
  });

  describe('Customer Status Management Tests', () => {
    beforeEach(async () => {
      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);
      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('should show deactivate button for active customers', async () => {
      await waitFor(() => {
        const actionButtons = screen.getAllByText('Deactivate');
        expect(actionButtons[0]).toBeInTheDocument();
        expect(actionButtons[0]).toHaveStyle('background-color: red');
      });
    });

    test('should show activate button for inactive customers', async () => {
      await waitFor(() => {
        const actionButtons = screen.getAllByText('Activate');
        expect(actionButtons[0]).toBeInTheDocument();
        expect(actionButtons[0]).toHaveStyle('background-color: green');
      });
    });

    test('should successfully deactivate customer', async () => {
      mockCustomerApiService.deactivateCustomer.mockResolvedValueOnce({});
      
      // Mock window.confirm to return true
      window.confirm = jest.fn().mockReturnValue(true);

      await waitFor(() => {
        const deactivateButton = screen.getAllByText('Deactivate')[0];
        userEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(mockCustomerApiService.deactivateCustomer).toHaveBeenCalledWith(1);
      });
    });

    test('should successfully activate customer', async () => {
      mockCustomerApiService.activateCustomer.mockResolvedValueOnce({});
      
      // Mock window.confirm to return true
      window.confirm = jest.fn().mockReturnValue(true);

      await waitFor(() => {
        const activateButton = screen.getAllByText('Activate')[0];
        userEvent.click(activateButton);
      });

      await waitFor(() => {
        expect(mockCustomerApiService.activateCustomer).toHaveBeenCalledWith(2);
      });
    });

    test('should not change status when confirmation is cancelled', async () => {
      // Mock window.confirm to return false
      window.confirm = jest.fn().mockReturnValue(false);

      await waitFor(() => {
        const deactivateButton = screen.getAllByText('Deactivate')[0];
        userEvent.click(deactivateButton);
      });

      expect(mockCustomerApiService.deactivateCustomer).not.toHaveBeenCalled();
    });

    test('should handle status change error', async () => {
      const errorMessage = 'Failed to update status';
      mockCustomerApiService.deactivateCustomer.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });
      
      window.confirm = jest.fn().mockReturnValue(true);

      await waitFor(() => {
        const deactivateButton = screen.getAllByText('Deactivate')[0];
        userEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should show loading state during status change', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockCustomerApiService.deactivateCustomer.mockReturnValueOnce(mockPromise as any);
      
      window.confirm = jest.fn().mockReturnValue(true);

      await waitFor(() => {
        const deactivateButton = screen.getAllByText('Deactivate')[0];
        userEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
      });

      resolvePromise!({});

      await waitFor(() => {
        expect(screen.queryByText('Please wait...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Permission Tests', () => {
    test('should disable action buttons for non-admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { userName: 'testuser', role: 'Customer' },
        token: 'mock-token'
      });

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button');
        const statusButtons = actionButtons.filter(btn => 
          btn.textContent === 'Deactivate' || btn.textContent === 'Activate'
        );
        
        statusButtons.forEach(button => {
          expect(button).toBeDisabled();
          expect(button).toHaveAttribute('title', 'Only admin can change status');
        });
      });
    });

    test('should enable action buttons for admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { userName: 'testuser', role: 'Admin' },
        token: 'mock-token'
      });

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button');
        const statusButtons = actionButtons.filter(btn => 
          btn.textContent === 'Deactivate' || btn.textContent === 'Activate'
        );
        
        statusButtons.forEach(button => {
          expect(button).toBeEnabled();
        });
      });
    });

    test('should handle case-insensitive role checking', async () => {
      mockUseAuth.mockReturnValue({
        user: { userName: 'testuser', role: 'ADMIN' },
        token: 'mock-token'
      });

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button');
        const statusButtons = actionButtons.filter(btn => 
          btn.textContent === 'Deactivate' || btn.textContent === 'Activate'
        );
        
        statusButtons.forEach(button => {
          expect(button).toBeEnabled();
        });
      });
    });
  });

  describe('Data Mapping Tests', () => {
    test('should correctly map backend fields to frontend fields', async () => {
      const backendData = [
        {
          customerId: 1,
          customerName: 'Test User',
          customerMobile: '1111111111',
          customerEmail: 'test@test.com',
          customerAddress: 'Test Address',
          status: 'Activate'
        }
      ];

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(backendData);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // ID mapped
        expect(screen.getByText('Test User')).toBeInTheDocument(); // Name mapped
        expect(screen.getByText('1111111111')).toBeInTheDocument(); // Mobile mapped
        expect(screen.getByText('test@test.com')).toBeInTheDocument(); // Email mapped
        expect(screen.getByText('Test Address')).toBeInTheDocument(); // Address mapped
        expect(screen.getByText('Activate')).toBeInTheDocument(); // Status mapped
      });
    });

    test('should handle missing status field', async () => {
      const dataWithoutStatus = [
        {
          customerId: 1,
          customerName: 'Test User',
          customerMobile: '1111111111',
          customerEmail: 'test@test.com',
          customerAddress: 'Test Address'
          // status is missing
        }
      ];

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(dataWithoutStatus);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        // Should still render the row even without status
      });
    });
  });

  describe('UI Interaction Tests', () => {
    test('should clear form fields after successful submission', async () => {
      const newCustomer = {
        customerId: 3,
        customerName: 'New Customer',
        customerMobile: '5555555555',
        customerEmail: 'new@example.com',
        customerAddress: '789 New St',
        status: 'Activate'
      };

      mockCustomerApiService.getCustomers.mockResolvedValueOnce(mockCustomers);
      mockCustomerApiService.addCustomer.mockResolvedValueOnce(newCustomer);

      render(
        <TestWrapper>
          <Customer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }));

      const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
      const mobileInput = screen.getByPlaceholderText('Mobile') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      const addressInput = screen.getByPlaceholderText('Address') as HTMLInputElement;

      await userEvent.type(nameInput, 'New Customer');
      await userEvent.type(mobileInput, '5555555555');
      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(addressInput, '789 New St');

      expect(nameInput.value).toBe('New Customer');

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByText('Customer added!')).toBeInTheDocument();
      });

      // Check if form is hidden (fields should not exist)
      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
    });
  });
});
