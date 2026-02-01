import React from 'react';
import { useAuth } from '../context/AuthContext';
import AccountApiService from '../api/AccountApiService';
import CustomerApiService from '../api/CustomerApiService';
import TransactionApiService from '../api/TransactionApiService';

const TestAllAPI: React.FC = () => {
  const { user } = useAuth();

  // Debug function to test raw API response
  const testRawAPI = async (accountNumber: number, useAccountNumber: boolean = true) => {
    try {
      console.log('=== RAW API TEST START ===');
      let response;
      if (useAccountNumber) {
        console.log('Testing GetAccountByAccountNumber with:', accountNumber);
        response = await AccountApiService.getAccountByAccountNumber(accountNumber);
      } else {
        console.log('Testing GetAccountDetailsByNoOrCustID with:', accountNumber);
        response = await AccountApiService.getAccountDetails(accountNumber);
      }
      console.log('Raw API Response:', response);
      console.log('Raw API Response Type:', typeof response);
      console.log('Raw API Response JSON:', JSON.stringify(response, null, 2));
      console.log('=== RAW API TEST END ===');
      alert('Check console for raw API response details');
    } catch (error) {
      console.error('Raw API Test Error:', error);
      alert('API test failed - check console for details');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
      <h2>API Testing Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
        Test various API endpoints and check browser console for detailed responses
      </p>

      {/* User Info */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#f9f9f9' }}>
        <strong>Current User:</strong> {user?.userName || 'Unknown'} | <strong>Role:</strong> {user?.role || 'Unknown'}
      </div>

      {/* API Test Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%', maxWidth: '800px' }}>
        
        {/* Test Account API */}
        <div style={{ border: '1px solid #ffa500', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#ffa500', marginBottom: '10px' }}>Account API Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test GetAccountByAccountNumber endpoint with account number 900123
          </p>
          <button 
            onClick={() => testRawAPI(900123, true)}
            style={{ 
              backgroundColor: '#ffa500', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Account API
          </button>
        </div>

        {/* Test Customer API */}
        <div style={{ border: '1px solid #9370db', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#9370db', marginBottom: '10px' }}>Customer API Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test GetAccountDetailsByNoOrCustID endpoint with customer ID 1
          </p>
          <button 
            onClick={() => testRawAPI(1, false)}
            style={{ 
              backgroundColor: '#9370db', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Customer API
          </button>
        </div>

        {/* Test Customer ID Search */}
        <div style={{ border: '1px solid #ff6b6b', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#ff6b6b', marginBottom: '10px' }}>Customer ID Search Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test detailed customer ID search with property inspection
          </p>
          <button 
            onClick={async () => {
              try {
                console.log('=== TESTING CUSTOMER ID SEARCH ===');
                const response = await AccountApiService.getAccountDetails(1); // Test with customer ID 1
                console.log('Customer ID Search Response:', response);
                console.log('Response Type:', typeof response);
                console.log('Is Array:', Array.isArray(response));
                console.log('Response JSON:', JSON.stringify(response, null, 2));
                if (Array.isArray(response) && response.length > 0) {
                  console.log('First account properties:', Object.keys(response[0]));
                  console.log('First account customerId:', response[0].customerId);
                  console.log('First account customerID (caps):', (response[0] as any).customerID);
                  console.log('First account CustomerId (pascal):', (response[0] as any).CustomerId);
                }
                alert('Check console for customer ID search response');
              } catch (error) {
                console.error('Customer ID search test error:', error);
                alert('Customer ID search test failed - check console');
              }
            }}
            style={{ 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Cust ID Search
          </button>
        </div>

        {/* Test Get All Accounts */}
        <div style={{ border: '1px solid #17a2b8', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#17a2b8', marginBottom: '10px' }}>Get All Accounts Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test GetAllAccounts endpoint with detailed response analysis
          </p>
          <button 
            onClick={async () => {
              try {
                console.log('=== TESTING GET ALL ACCOUNTS ===');
                const response = await AccountApiService.getAllAccounts();
                console.log('GetAllAccounts Response:', response);
                console.log('Response Type:', typeof response);
                console.log('Is Array:', Array.isArray(response));
                console.log('Array Length:', Array.isArray(response) ? response.length : 'Not array');
                console.log('Response JSON:', JSON.stringify(response, null, 2));
                if (Array.isArray(response) && response.length > 0) {
                  console.log('First account properties:', Object.keys(response[0]));
                  console.log('Sample account structure:', {
                    accountNumber: response[0].accountNumber,
                    customerId: response[0].customerId,
                    accountBalance: (response[0] as any).accountBalance,
                    accountType: response[0].accountType,
                    accountStatus: (response[0] as any).accountStatus,
                    accountStatus_type: typeof (response[0] as any).accountStatus,
                    accountStatus_meaning: (response[0] as any).accountStatus === 0 ? 'Active' : 'Inactive',
                    createdOn: response[0].createdOn,
                    accountUpdateOn: (response[0] as any).accountUpdateOn
                  });
                }
                alert(`GetAllAccounts test successful! Found ${Array.isArray(response) ? response.length : 0} accounts. Check console for details.`);
              } catch (error: any) {
                console.error('GetAllAccounts test error:', error);
                alert(`GetAllAccounts test failed: ${error?.response?.status} - ${error?.response?.data?.message || error.message}`);
              }
            }}
            style={{ 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Get All
          </button>
        </div>

        {/* Test Customer List API */}
        <div style={{ border: '1px solid #28a745', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#28a745', marginBottom: '10px' }}>Customer List Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test GetCustomers endpoint to fetch all customers
          </p>
          <button 
            onClick={async () => {
              try {
                console.log('=== TESTING GET CUSTOMERS ===');
                const response = await CustomerApiService.getCustomers();
                console.log('GetCustomers Response:', response);
                console.log('Response Type:', typeof response);
                console.log('Is Array:', Array.isArray(response));
                console.log('Array Length:', Array.isArray(response) ? response.length : 'Not array');
                console.log('Response JSON:', JSON.stringify(response, null, 2));
                if (Array.isArray(response) && response.length > 0) {
                  console.log('First customer properties:', Object.keys(response[0]));
                  console.log('Sample customer structure:', {
                    customerId: (response[0] as any).customerId,
                    customerName: (response[0] as any).customerName,
                    customerEmail: (response[0] as any).customerEmail,
                    customerMobile: (response[0] as any).customerMobile,
                    customerAddress: (response[0] as any).customerAddress,
                    status: (response[0] as any).status
                  });
                }
                alert(`GetCustomers test successful! Found ${Array.isArray(response) ? response.length : 0} customers. Check console for details.`);
              } catch (error: any) {
                console.error('GetCustomers test error:', error);
                alert(`GetCustomers test failed: ${error?.response?.status} - ${error?.response?.data?.message || error.message}`);
              }
            }}
            style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Customer List
          </button>
        </div>

        {/* Authentication Test */}
        <div style={{ border: '1px solid #6c757d', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>Auth Status Check</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Check current authentication status and token info
          </p>
          <button 
            onClick={() => {
              console.log('=== AUTH DEBUG INFO ===');
              console.log('User:', user);
              console.log('Token:', localStorage.getItem('jwtToken'));
              console.log('User data from localStorage:', localStorage.getItem('userData'));
              const token = localStorage.getItem('jwtToken');
              console.log('Token length:', token ? token.length : 'null');
              console.log('Token valid format:', token ? token.startsWith('eyJ') : 'null');
              alert('Check console for auth debug info');
            }}
            style={{ 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Check Auth Status
          </button>
        </div>

        {/* Transaction API Tests */}
        <div style={{ border: '1px solid #e83e8c', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#e83e8c', marginBottom: '10px' }}>Transaction API Test</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Test GetLastNTransaction endpoint
          </p>
          <button 
            onClick={async () => {
              try {
                console.log('=== TESTING TRANSACTION API ===');
                const response = await TransactionApiService.getLastNTransactions(4, 900123);
                console.log('Transaction API Response:', response);
                console.log('Response Type:', typeof response);
                console.log('Is Array:', Array.isArray(response));
                console.log('Array Length:', Array.isArray(response) ? response.length : 'Not array');
                console.log('Response JSON:', JSON.stringify(response, null, 2));
                if (Array.isArray(response) && response.length > 0) {
                  console.log('First transaction properties:', Object.keys(response[0]));
                  console.log('Sample transaction structure:', {
                    transactionId: response[0].transactionId,
                    accountNumber: response[0].accountNumber,
                    transactionAmount: response[0].transactionAmount,
                    transactionMode: response[0].transactionMode,
                    transactionType: response[0].transactionType,
                    transactionOn: response[0].transactionOn,
                    status: response[0].status,
                    updatedBalance: response[0].updatedBalance
                  });
                }
                alert(`Transaction API test successful! Found ${Array.isArray(response) ? response.length : 0} transactions. Check console for details.`);
              } catch (error: any) {
                console.error('Transaction API test error:', error);
                alert(`Transaction API test failed: ${error?.response?.status} - ${error?.response?.data?.message || error.message}`);
              }
            }}
            style={{ 
              backgroundColor: '#e83e8c', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Test Transaction API
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', background: '#f0f8ff', maxWidth: '600px' }}>
        <h4 style={{ color: '#007bff', marginBottom: '10px' }}>📋 Testing Instructions</h4>
        <ul style={{ textAlign: 'left', margin: 0 }}>
          <li>Click any test button above</li>
          <li>Open browser Developer Tools (F12)</li>
          <li>Check the Console tab for detailed API responses</li>
          <li>Alert dialogs will confirm test completion</li>
          <li>Look for error messages if tests fail</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAllAPI;
