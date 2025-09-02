import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountApiService, { AccountData, NewAccount, UpdateBalanceRequest } from '../api/AccountApiService';

const Account: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateBalanceForm, setShowUpdateBalanceForm] = useState<number | null>(null);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'accountNumber' | 'customerId'>('accountNumber');
  const [newAccount, setNewAccount] = useState<NewAccount>({
    customerId: 0,
    initialBalance: 0,
    accountType: 'Saving',
  });
  const [updateBalance, setUpdateBalance] = useState<UpdateBalanceRequest>({
    newBalance: 0,
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllAccounts = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching all accounts on page load...');
        const raw = await AccountApiService.getAllAccounts();
        console.log('Raw API response for all accounts:', raw);
        
        // Map backend fields to frontend fields based on actual API response
        const mapped = Array.isArray(raw)
          ? raw.map((account: any) => {
              console.log('Processing account from getAllAccounts:', account);
              
              // Map the actual API response properties to our expected format
              const accountNumber = account.accountNumber ?? 0;
              const customerId = account.customerId ?? 0;
              const balance = account.accountBalance ?? 0; // API returns 'accountBalance'
              const accountType = account.accountType ?? 'Unknown';
              const createdOn = account.createdOn ?? new Date().toISOString();
              const accountUpdateOn = account.accountUpdateOn ?? createdOn;
              
              // Handle status mapping consistently
              // IMPORTANT: API returns accountStatus as 0 (Active) or 1 (Deactive/Inactive)
              let isActive: boolean;
              if (account.accountStatus !== undefined) {
                isActive = account.accountStatus === 0;
                console.log(`🔍 Initial load - RAW accountStatus from API: ${account.accountStatus}`);
                console.log(`🔍 Initial load - Logic: accountStatus(${account.accountStatus}) === 0 ? ${account.accountStatus === 0}`);
                console.log(`🔍 Initial load - Final isActive: ${isActive}`);
                console.log(`🔍 Initial load - Display status will be: ${isActive ? 'Active' : 'Inactive'}`);
              } else if (account.isActive !== undefined) {
                isActive = account.isActive;
                console.log(`🔍 Initial load - using account.isActive: ${account.isActive}`);
              } else {
                isActive = true;
                console.log('🔍 Initial load - no status info, defaulting to Active');
              }
              const status = isActive ? 'Active' : 'Inactive';
              
              console.log('Mapped account data from initial load:', {
                accountNumber,
                customerId,
                balance,
                accountType,
                isActive,
                status,
                'account.accountStatus': account.accountStatus,
                'account.isActive': account.isActive,
                'final_status': status,
                createdOn,
                lastUpdated: accountUpdateOn,
                'raw_account_keys': Object.keys(account)
              });
              
              return {
                accountNumber,
                customerId,
                accountType,
                balance: typeof balance === 'number' ? balance : parseFloat(String(balance)),
                isActive,
                status,
                createdOn,
                customerName: '', // Not provided in this API response
                lastUpdated: accountUpdateOn
              };
            })
          : [];
        
        console.log('Mapped accounts for display:', mapped);
        setAccounts(mapped);
      } catch (err: any) {
        console.error('Error fetching all accounts:', err);
        setError('Failed to load accounts. You can still use the search function.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllAccounts();
  }, []);

  const handleSearchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    
    if (!searchValue) {
      setSearchError(`Please enter a ${searchType === 'accountNumber' ? 'account number' : 'customer ID'}`);
      return;
    }

    try {
      let apiResponse: AccountData | AccountData[];
      
      if (searchType === 'accountNumber') {
        // Use GetAccountByAccountNumber endpoint - returns single account
        apiResponse = await AccountApiService.getAccountByAccountNumber(parseInt(searchValue));
      } else {
        // Use GetAccountDetailsByNoOrCustID endpoint - may return single account or array
        apiResponse = await AccountApiService.getAccountDetails(parseInt(searchValue));
      }
      
      console.log('=== SEARCH API RESPONSE DEBUG ===');
      console.log('Search Type:', searchType);
      console.log('Search Value:', searchValue);
      console.log('API Response:', apiResponse); // Debug log
      console.log('API Response type:', typeof apiResponse);
      console.log('Is Array?', Array.isArray(apiResponse));
      
      // Deep inspection of API response structure
      if (apiResponse) {
        console.log('API Response JSON:', JSON.stringify(apiResponse, null, 2));
        if (!Array.isArray(apiResponse)) {
          console.log('Single account response properties:', Object.keys(apiResponse));
          console.log('Single account response values:', Object.values(apiResponse));
          // Check all possible customer ID properties
          const singleAccount = apiResponse as any;
          console.log('Customer ID property inspection:', {
            customerId: singleAccount.customerId,
            CustomerId: singleAccount.CustomerId,
            customerID: singleAccount.customerID,
            CustomerID: singleAccount.CustomerID,
            customer_id: singleAccount.customer_id,
            id: singleAccount.id,
            accountCustomerId: singleAccount.accountCustomerId,
            accountCustomerID: singleAccount.accountCustomerID
          });
        } else {
          console.log('Array response - first item properties:', apiResponse.length > 0 ? Object.keys(apiResponse[0]) : 'Empty array');
          if (apiResponse.length > 0) {
            const firstAccount = apiResponse[0] as any;
            console.log('First account customer ID property inspection:', {
              customerId: firstAccount.customerId,
              CustomerId: firstAccount.CustomerId,
              customerID: firstAccount.customerID,
              CustomerID: firstAccount.CustomerID,
              customer_id: firstAccount.customer_id,
              id: firstAccount.id,
              accountCustomerId: firstAccount.accountCustomerId,
              accountCustomerID: firstAccount.accountCustomerID
            });
          }
        }
      }
      console.log('=== END API RESPONSE DEBUG ===');
      
      // Handle both single account and array of accounts
      const accounts = Array.isArray(apiResponse) ? apiResponse : [apiResponse];
      console.log('Accounts array:', accounts);
      
      // Convert each account to consistent format
      const formattedAccounts: AccountData[] = accounts.map((account, index) => {
        console.log(`Processing account ${index}:`, account);
        console.log(`Account properties:`, {
          accountNumber: account.accountNumber,
          customerId: account.customerId,
          balance: account.balance,
          balanceType: typeof account.balance,
          isActive: account.isActive,
          allProperties: Object.keys(account)
        });
        
        // Cast to any to access the actual API property names
        const accountAny = account as any;
        
        // Map the actual API response properties to our expected format
        const accountNumber = account.accountNumber ?? accountAny.AccountNumber ?? 0;
        
        // Try multiple possible customer ID property names
        let customerId = account.customerId ?? 
                        accountAny.CustomerId ?? 
                        accountAny.customerID ?? 
                        accountAny.CustomerID ?? 
                        accountAny.customer_id ?? 
                        accountAny.id ?? 
                        accountAny.customeriD ?? 
                        accountAny.accountCustomerId ??
                        accountAny.accountCustomerID ??
                        0;
        
        // Special case: If we searched by customer ID and still got 0, use the search value
        if (customerId === 0 && searchType === 'customerId' && searchValue) {
          customerId = parseInt(searchValue);
          console.log('Used search value as customer ID fallback:', customerId);
        }
        
        console.log('Customer ID mapping attempt for account:', index, {
          'account.customerId': account.customerId,
          'accountAny.CustomerId': accountAny.CustomerId,
          'accountAny.customerID': accountAny.customerID,
          'accountAny.CustomerID': accountAny.CustomerID,
          'accountAny.customer_id': accountAny.customer_id,
          'accountAny.id': accountAny.id,
          'accountAny.customeriD': accountAny.customeriD,
          'accountAny.accountCustomerId': accountAny.accountCustomerId,
          'accountAny.accountCustomerID': accountAny.accountCustomerID,
          'searchType': searchType,
          'searchValue': searchValue,
          'final customerId': customerId,
          'allAccountProperties': Object.keys(accountAny)
        });
        
        // API returns 'accountBalance' instead of 'balance'
        const balance = accountAny.accountBalance ?? account.balance ?? 0;
        
        // Handle status mapping more carefully
        // TESTING: Let's verify the API status mapping
        // You said: API status 0 = Active, 1 = Deactive
        let isActive: boolean;
        
        // Check if the API response has accountStatus property
        if (accountAny.accountStatus !== undefined) {
          // Current logic: 0 = Active, 1 = Inactive
          isActive = accountAny.accountStatus === 0;
          
          console.log(`🔍 Search - RAW accountStatus from API: ${accountAny.accountStatus} (type: ${typeof accountAny.accountStatus})`);
          console.log(`🔍 Search - Current Logic: accountStatus(${accountAny.accountStatus}) === 0 ? ${accountAny.accountStatus === 0}`);
          console.log(`🔍 Search - Final isActive: ${isActive}`);
          console.log(`🔍 Search - Display status will be: ${isActive ? 'Active' : 'Inactive'}`);
          
          // Let's also test the reverse logic to see if that's what's needed
          const reverseLogic = accountAny.accountStatus === 1;
          console.log(`🔍 Search - REVERSE Logic: accountStatus(${accountAny.accountStatus}) === 1 ? ${reverseLogic}`);
          console.log(`🔍 Search - REVERSE would show: ${reverseLogic ? 'Active' : 'Inactive'}`);
          
        } else if (account.isActive !== undefined) {
          isActive = account.isActive;
          console.log(`🔍 Search - using account.isActive: ${account.isActive}`);
        } else {
          // Default to true for new accounts
          isActive = true;
          console.log('🔍 Search - no status info found, defaulting to Active');
        }
        
        const accountType = account.accountType ?? 'Unknown';
        const createdOn = account.createdOn ?? new Date().toISOString();
        const customerName = account.customerName ?? '';
        
        // API returns 'accountUpdateOn' for last update timestamp
        const lastUpdated = accountAny.accountUpdateOn ?? createdOn;
        
        console.log(`Extracted values for account ${index}:`, {
          accountNumber,
          customerId,
          balance,
          balanceType: typeof balance,
          isActive,
          'accountAny.accountStatus': accountAny.accountStatus,
          'account.isActive': account.isActive,
          'final_status': isActive ? 'Active' : 'Inactive',
          accountType,
          lastUpdated,
          'raw_account_object_keys': Object.keys(accountAny)
        });
        
        return {
          accountNumber,
          customerId,
          accountType,
          balance: typeof balance === 'number' ? balance : parseFloat(String(balance)),
          isActive,
          status: isActive ? 'Active' : 'Inactive',
          createdOn,
          customerName,
          lastUpdated // Add lastUpdated field
        };
      });
      
      console.log('Formatted Accounts:', formattedAccounts); // Debug formatted accounts
      
      // Replace the accounts list with only the search results
      setAccounts(formattedAccounts);
      
      setSearchValue('');
      setShowSearchForm(false);
      
      // Show success message based on search type and results
      const accountCount = formattedAccounts.length;
      if (accountCount > 0) {
        if (searchType === 'accountNumber') {
          console.log(`Found account with Account Number: ${searchValue}`);
        } else {
          console.log(`Found ${accountCount} account${accountCount > 1 ? 's' : ''} for Customer ID: ${searchValue}`);
        }
      }
      
    } catch (err: any) {
      console.error('Error searching account:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          `${searchType === 'accountNumber' ? 'Account' : 'Customer accounts'} not found or server error`;
      setSearchError(errorMessage);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess(false);
    
    try {
      const created = await AccountApiService.createAccount(newAccount);
      console.log('Created Account:', created); // Debug log
      
      // Cast to any to access the actual API property names
      const createdAny = created as any;
      
      // Map the actual API response properties to our expected format
      const accountNumber = created.accountNumber ?? createdAny.AccountNumber ?? 0;
      const customerId = created.customerId ?? createdAny.CustomerId ?? 0;
      
      // API returns 'accountBalance' instead of 'balance'
      const balance = created.balance ?? createdAny.accountBalance ?? createdAny.Balance ?? 0;
      
      // API returns 'accountStatus' (0/1) instead of 'isActive' (true/false)
      // accountStatus: 0 = Active, 1 = Inactive/Deactive
      const isActiveFromStatus = createdAny.accountStatus !== undefined ? createdAny.accountStatus === 0 : true;
      const isActive = created.isActive ?? isActiveFromStatus ?? true;
      
      const accountType = created.accountType ?? createdAny.AccountType ?? 'Unknown';
      const createdOn = created.createdOn ?? createdAny.CreatedOn ?? new Date().toISOString();
      const customerName = created.customerName ?? createdAny.CustomerName ?? '';
      
      // API returns 'accountUpdateOn' for last update timestamp
      const lastUpdated = createdAny.accountUpdateOn ?? createdAny.AccountUpdateOn ?? createdAny.updatedOn ?? createdOn;
      
      // Convert to consistent format
      const formattedAccount: AccountData = {
        accountNumber,
        customerId,
        accountType,
        balance: typeof balance === 'number' ? balance : parseFloat(String(balance)),
        isActive,
        status: isActive ? 'Active' : 'Inactive',
        createdOn,
        customerName,
        lastUpdated
      };
      
      setAccounts(prev => [...prev, formattedAccount]);
      setAddSuccess(true);
      setShowAddForm(false);
      setNewAccount({ customerId: 0, initialBalance: 0, accountType: 'Saving' });
    } catch (err: any) {
      console.error('Error creating account:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to create account';
      setAddError(errorMessage);
    }
  };

  const handleUpdateBalance = async (e: React.FormEvent, accountNumber: number) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess(false);
    
    console.log('🔧 Starting balance update for account:', accountNumber);
    console.log('🔧 Update request:', updateBalance);
    
    // Validation
    if (updateBalance.newBalance < 0) {
      setUpdateError('Balance cannot be negative');
      return;
    }
    
    try {
      const updated = await AccountApiService.updateBalance(accountNumber, updateBalance);
      console.log('🔧 Update successful! API Response:', updated);
      
      // Cast to any to access the actual API property names
      const updatedAny = updated as any;
      
      // API returns 'accountBalance' instead of 'balance'
      const newBalance = updated.balance ?? updatedAny.accountBalance ?? updatedAny.Balance ?? 0;
      console.log('🔧 Extracted new balance:', newBalance, 'from response keys:', Object.keys(updatedAny));
      
      setAccounts(prev => prev.map(account => 
        account.accountNumber === accountNumber 
          ? { ...account, balance: typeof newBalance === 'number' ? newBalance : parseFloat(String(newBalance)) } 
          : account
      ));
      setUpdateSuccess(true);
      setShowUpdateBalanceForm(null);
      setUpdateBalance({ newBalance: 0 });
      
      console.log('🔧 Balance update completed successfully');
    } catch (err: any) {
      console.error('🔧 Error updating balance:', err);
      console.error('🔧 Error response:', err?.response);
      console.error('🔧 Error data:', err?.response?.data);
      console.error('🔧 Error status:', err?.response?.status);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to update balance';
      setUpdateError(`Update failed: ${errorMessage}`);
    }
  };

  const toggleAccountStatus = async (accountNumber: number, currentStatus: string) => {
    if (user?.role?.toLowerCase() !== 'admin') return;
    
    const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;
    
    setActionLoadingId(accountNumber);
    try {
      let newStatus = currentStatus;
      let newIsActive = currentStatus === 'Active';
      
      if (currentStatus === 'Active') {
        // Deactivate: call DeleteAccount
        await AccountApiService.deleteAccount(accountNumber);
        newStatus = 'Inactive';
        newIsActive = false;
      } else {
        // Activate: call ActivateAccount
        await AccountApiService.activateAccount(accountNumber);
        newStatus = 'Active';
        newIsActive = true;
      }
      
      setAccounts(prev => prev.map(account => 
        account.accountNumber === accountNumber 
          ? { ...account, status: newStatus, isActive: newIsActive }
          : account
      ));
    } catch (err: any) {
      console.error('Status update error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to update account status';
      setError(errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh' }}>
      <h2>Account List</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowSearchForm(!showSearchForm)}>
          {showSearchForm ? 'Cancel Search' : 'Search Account'}
        </button>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Account'}
        </button>
        {accounts.length > 0 && (
          <button 
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                console.log('Reloading all accounts...');
                const raw = await AccountApiService.getAllAccounts();
                console.log('Raw API response for all accounts:', raw);
                
                // Map backend fields to frontend fields based on actual API response
                const mapped = Array.isArray(raw)
                  ? raw.map((account: any) => {
                      console.log('Processing account from getAllAccounts:', account);
                      
                      // Map the actual API response properties to our expected format
                      const accountNumber = account.accountNumber ?? 0;
                      const customerId = account.customerId ?? 0;
                      const balance = account.accountBalance ?? 0; // API returns 'accountBalance'
                      const accountType = account.accountType ?? 'Unknown';
                      const createdOn = account.createdOn ?? new Date().toISOString();
                      const accountUpdateOn = account.accountUpdateOn ?? createdOn;
                      
                      // Handle status mapping consistently
                      // IMPORTANT: API returns accountStatus as 0 (Active) or 1 (Deactive/Inactive)
                      let isActive: boolean;
                      if (account.accountStatus !== undefined) {
                        isActive = account.accountStatus === 0;
                        console.log(`🔍 Show All - RAW accountStatus from API: ${account.accountStatus}`);
                        console.log(`🔍 Show All - Logic: accountStatus(${account.accountStatus}) === 0 ? ${account.accountStatus === 0}`);
                        console.log(`🔍 Show All - Final isActive: ${isActive}`);
                        console.log(`🔍 Show All - Display status will be: ${isActive ? 'Active' : 'Inactive'}`);
                      } else if (account.isActive !== undefined) {
                        isActive = account.isActive;
                        console.log(`🔍 Show All - using account.isActive: ${account.isActive}`);
                      } else {
                        isActive = true;
                        console.log('🔍 Show All - no status info, defaulting to Active');
                      }
                      const status = isActive ? 'Active' : 'Inactive';
                      
                      return {
                        accountNumber,
                        customerId,
                        accountType,
                        balance: typeof balance === 'number' ? balance : parseFloat(String(balance)),
                        isActive,
                        status,
                        createdOn,
                        customerName: '', // Not provided in this API response
                        lastUpdated: accountUpdateOn
                      };
                    })
                  : [];
                
                console.log('Mapped accounts for display:', mapped);
                setAccounts(mapped);
              } catch (err: any) {
                console.error('Error fetching all accounts:', err);
                setError('Failed to load accounts. You can still use the search function.');
              } finally {
                setLoading(false);
              }
            }}
            style={{ 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Show All Accounts
          </button>
        )}
      </div>

      {/* Search Form */}
      {showSearchForm && (
        <form onSubmit={handleSearchAccount} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 16, background: '#f9f9f9', maxWidth: '500px' }}>
          <h3>Search Account</h3>
          
          {/* Search Type Selector */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                value="accountNumber"
                checked={searchType === 'accountNumber'}
                onChange={e => setSearchType('accountNumber')}
                style={{ marginRight: '5px' }}
              />
              Search by Account Number
            </label>
            <label>
              <input
                type="radio"
                value="customerId"
                checked={searchType === 'customerId'}
                onChange={e => setSearchType('customerId')}
                style={{ marginRight: '5px' }}
              />
              Search by Customer ID
            </label>
          </div>
          
          {/* Search Input */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder={searchType === 'accountNumber' ? 'Enter Account Number' : 'Enter Customer ID'}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
            />
            <button 
              type="submit"
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#2196F3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Search
            </button>
          </div>
          
          {/* Help Text */}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            {searchType === 'accountNumber' 
              ? 'Search for a specific account by its account number'
              : 'Search for all accounts belonging to a customer by customer ID'
            }
          </div>
          
          {searchError && <p style={{ color: 'red', marginTop: '10px' }}>{searchError}</p>}
        </form>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <form onSubmit={handleAddAccount} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 16, background: '#f9f9f9' }}>
          <h3>Create New Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="number"
              placeholder="Customer ID"
              value={newAccount.customerId || ''}
              onChange={e => setNewAccount({ ...newAccount, customerId: parseInt(e.target.value) || 0 })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Initial Balance"
              value={newAccount.initialBalance || ''}
              onChange={e => setNewAccount({ ...newAccount, initialBalance: parseFloat(e.target.value) || 0 })}
              required
            />
            <select
              value={newAccount.accountType}
              onChange={e => setNewAccount({ ...newAccount, accountType: e.target.value })}
              required
            >
              <option value="Saving">Saving</option>
              <option value="Current">Current</option>
              <option value="Salary">Salary</option>
            </select>
            <button type="submit">Create Account</button>
          </div>
          {addError && <p style={{ color: 'red', marginTop: '10px' }}>{addError}</p>}
          {addSuccess && <p style={{ color: 'green', marginTop: '10px' }}>Account created successfully!</p>}
        </form>
      )}

      {/* Accounts Table */}
      {accounts.length > 0 && (
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          Showing {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <table style={{ borderCollapse: 'collapse', background: '#fff', border: '2px solid #000', margin: '0 auto', minWidth: '1000px', textAlign: 'center' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Account Number</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Customer ID</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Account Type</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Balance</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Created On</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Last Updated</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ border: '1px solid #000', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                No accounts available. Use the search function to find specific accounts or add a new account.
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr key={account.accountNumber}>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{account.accountNumber}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{account.customerId}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{account.accountType}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>${account.balance.toFixed(2)}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  <span style={{ color: account.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {account.status}
                  </span>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  {new Date(account.createdOn).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  {account.lastUpdated ? new Date(account.lastUpdated).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowUpdateBalanceForm(account.accountNumber)}
                      style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                      disabled={!account.isActive}
                    >
                      Update Balance
                    </button>
                    <button
                      style={{
                        backgroundColor: account.status === 'Active' ? 'red' : 'green',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: user?.role?.toLowerCase() !== 'admin' ? 'not-allowed' : 'pointer',
                        opacity: user?.role?.toLowerCase() !== 'admin' ? 0.6 : 1
                      }}
                      onClick={() => toggleAccountStatus(account.accountNumber, account.status)}
                      disabled={user?.role?.toLowerCase() !== 'admin' || actionLoadingId === account.accountNumber}
                      title={user?.role?.toLowerCase() !== 'admin' ? 'Only admin can activate/deactivate accounts' : ''}
                    >
                      {actionLoadingId === account.accountNumber
                        ? 'Please wait...'
                        : account.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Update Balance Form */}
      {showUpdateBalanceForm && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          background: 'white', 
          border: '2px solid #ccc', 
          padding: '20px', 
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <form onSubmit={(e) => handleUpdateBalance(e, showUpdateBalanceForm)}>
            <h3>Update Balance for Account {showUpdateBalanceForm}</h3>
            <input
              type="number"
              step="0.01"
              placeholder="New Balance"
              value={updateBalance.newBalance}
              onChange={e => {
                const value = e.target.value;
                console.log('🔧 Input change - raw value:', value);
                const numValue = value === '' ? 0 : parseFloat(value);
                console.log('🔧 Input change - parsed value:', numValue);
                setUpdateBalance({ newBalance: isNaN(numValue) ? 0 : numValue });
              }}
              required
              style={{ padding: '5px', marginRight: '10px' }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setShowUpdateBalanceForm(null)}>Cancel</button>
            </div>
            {updateError && <p style={{ color: 'red', marginTop: '10px' }}>{updateError}</p>}
            {updateSuccess && <p style={{ color: 'green', marginTop: '10px' }}>Balance updated successfully!</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default Account;
