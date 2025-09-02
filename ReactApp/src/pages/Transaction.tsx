import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TransactionApiService, { 
  TransactionResponseModel, 
  TransactionRequestModel, 
  TransactionMode, 
  TransactionType 
} from '../api/TransactionApiService';

const Transaction: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showDateRangeForm, setShowDateRangeForm] = useState(false);
  const [showLastNForm, setShowLastNForm] = useState(false);

  // Process Transaction Form
  const [processForm, setProcessForm] = useState<TransactionRequestModel>({
    accountNumber: 0,
    transactionAmount: 0,
    transactionMode: TransactionMode.UPI,
    transactionType: TransactionType.Credit
  });

  // Date Range Form
  const [dateRangeForm, setDateRangeForm] = useState({
    accountNumber: 0,
    fromDate: '',
    toDate: ''
  });

  // Last N Transactions Form
  const [lastNForm, setLastNForm] = useState({
    accountNumber: 0,
    count: 5
  });

  const { user } = useAuth();

  const handleProcessTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('🔄 Processing transaction:', processForm);
      const result = await TransactionApiService.processTransaction(processForm);
      console.log('🔄 Transaction processed successfully:', result);
      
      setSuccess(`Transaction processed successfully! New balance: $${result.updatedBalance.toFixed(2)}`);
      setShowProcessForm(false);
      setProcessForm({
        accountNumber: 0,
        transactionAmount: 0,
        transactionMode: TransactionMode.UPI,
        transactionType: TransactionType.Credit
      });

      // Add the new transaction to the list if we have transactions loaded
      if (transactions.length > 0) {
        setTransactions(prev => [result, ...prev]);
      }
    } catch (err: any) {
      console.error('🔄 Transaction processing error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to process transaction';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('📅 Searching transactions by date range:', dateRangeForm);
      
      const fromDate = dateRangeForm.fromDate ? new Date(dateRangeForm.fromDate) : undefined;
      const toDate = dateRangeForm.toDate ? new Date(dateRangeForm.toDate) : undefined;
      
      const result = await TransactionApiService.getTransactionByDateRange(
        dateRangeForm.accountNumber,
        fromDate,
        toDate
      );
      
      console.log('📅 Date range search results:', result);
      setTransactions(result);
      setShowDateRangeForm(false);
      
      if (result.length === 0) {
        setSuccess('No transactions found for the specified date range.');
      } else {
        setSuccess(`Found ${result.length} transaction${result.length > 1 ? 's' : ''} for the date range.`);
      }
    } catch (err: any) {
      console.error('📅 Date range search error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to fetch transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLastNTransactions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('🔢 Fetching last N transactions:', lastNForm);
      const result = await TransactionApiService.getLastNTransactions(
        lastNForm.count,
        lastNForm.accountNumber
      );
      
      console.log('🔢 Last N transactions results:', result);
      setTransactions(result);
      setShowLastNForm(false);
      
      if (result.length === 0) {
        setSuccess('No transactions found for this account.');
      } else {
        setSuccess(`Found ${result.length} recent transaction${result.length > 1 ? 's' : ''}.`);
      }
    } catch (err: any) {
      console.error('🔢 Last N transactions error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.title || 
                          err?.message || 
                          'Failed to fetch transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === 'Pass' ? 'green' : 'red';
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'Credit' ? 'green' : 'red';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
      <h2>Transaction Management</h2>
      
      {/* User Info */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#f9f9f9' }}>
        <strong>Current User:</strong> {user?.userName || 'Unknown'} | <strong>Role:</strong> {user?.role || 'Unknown'}
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setShowProcessForm(!showProcessForm)}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {showProcessForm ? 'Cancel' : 'Process Transaction'}
        </button>
        
        <button 
          onClick={() => setShowDateRangeForm(!showDateRangeForm)}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {showDateRangeForm ? 'Cancel' : 'Search by Date Range'}
        </button>
        
        <button 
          onClick={() => setShowLastNForm(!showLastNForm)}
          style={{ 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {showLastNForm ? 'Cancel' : 'Get Recent Transactions'}
        </button>

        {transactions.length > 0 && (
          <button 
            onClick={() => {
              setTransactions([]);
              setError('');
              setSuccess('');
            }}
            style={{ 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Clear Results
          </button>
        )}
      </div>

      {/* Process Transaction Form */}
      {showProcessForm && (
        <form onSubmit={handleProcessTransaction} style={{ 
          marginBottom: '20px', 
          border: '1px solid #28a745', 
          padding: '20px', 
          background: '#f8fff8', 
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ color: '#28a745', marginBottom: '15px' }}>Process New Transaction</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number:</label>
              <input
                type="number"
                value={processForm.accountNumber || ''}
                onChange={e => setProcessForm(prev => ({ ...prev, accountNumber: parseInt(e.target.value) || 0 }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Transaction Amount:</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100000"
                value={processForm.transactionAmount || ''}
                onChange={e => setProcessForm(prev => ({ ...prev, transactionAmount: parseFloat(e.target.value) || 0 }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <small style={{ color: '#666' }}>Maximum amount: $100,000</small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Transaction Mode:</label>
              <select
                value={processForm.transactionMode}
                onChange={e => setProcessForm(prev => ({ ...prev, transactionMode: e.target.value as TransactionMode }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value={TransactionMode.UPI}>UPI</option>
                <option value={TransactionMode.NetBanking}>Net Banking</option>
                <option value={TransactionMode.ATM}>ATM</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Transaction Type:</label>
              <select
                value={processForm.transactionType}
                onChange={e => setProcessForm(prev => ({ ...prev, transactionType: e.target.value as TransactionType }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value={TransactionType.Credit}>Credit (Deposit)</option>
                <option value={TransactionType.Debit}>Debit (Withdrawal)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'Process Transaction'}
            </button>
          </div>
        </form>
      )}

      {/* Date Range Search Form */}
      {showDateRangeForm && (
        <form onSubmit={handleDateRangeSearch} style={{ 
          marginBottom: '20px', 
          border: '1px solid #007bff', 
          padding: '20px', 
          background: '#f8f9ff', 
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ color: '#007bff', marginBottom: '15px' }}>Search by Date Range</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number:</label>
              <input
                type="number"
                value={dateRangeForm.accountNumber || ''}
                onChange={e => setDateRangeForm(prev => ({ ...prev, accountNumber: parseInt(e.target.value) || 0 }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date (Optional):</label>
              <input
                type="datetime-local"
                value={dateRangeForm.fromDate}
                onChange={e => setDateRangeForm(prev => ({ ...prev, fromDate: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Date (Optional):</label>
              <input
                type="datetime-local"
                value={dateRangeForm.toDate}
                onChange={e => setDateRangeForm(prev => ({ ...prev, toDate: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Searching...' : 'Search Transactions'}
            </button>
          </div>
        </form>
      )}

      {/* Last N Transactions Form */}
      {showLastNForm && (
        <form onSubmit={handleLastNTransactions} style={{ 
          marginBottom: '20px', 
          border: '1px solid #6f42c1', 
          padding: '20px', 
          background: '#faf9ff', 
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ color: '#6f42c1', marginBottom: '15px' }}>Get Recent Transactions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number:</label>
              <input
                type="number"
                value={lastNForm.accountNumber || ''}
                onChange={e => setLastNForm(prev => ({ ...prev, accountNumber: parseInt(e.target.value) || 0 }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Number of Transactions:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={lastNForm.count || ''}
                onChange={e => setLastNForm(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <small style={{ color: '#666' }}>Maximum: 100 transactions</small>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                backgroundColor: '#6f42c1', 
                color: 'white', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Fetching...' : 'Get Transactions'}
            </button>
          </div>
        </form>
      )}

      {/* Status Messages */}
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '20px', 
          padding: '10px', 
          border: '1px solid red', 
          borderRadius: '4px', 
          background: '#ffebee',
          maxWidth: '600px',
          width: '100%'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'green', 
          marginBottom: '20px', 
          padding: '10px', 
          border: '1px solid green', 
          borderRadius: '4px', 
          background: '#e8f5e8',
          maxWidth: '600px',
          width: '100%'
        }}>
          {success}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ marginBottom: '20px', fontSize: '16px', color: '#007bff' }}>
          Loading...
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            Transaction History ({transactions.length} transaction{transactions.length > 1 ? 's' : ''})
          </div>
          
          <table style={{ 
            borderCollapse: 'collapse', 
            background: '#fff', 
            border: '2px solid #000', 
            margin: '0 auto', 
            minWidth: '1000px', 
            textAlign: 'center' 
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Transaction ID</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Account Number</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Mode</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Type</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Date & Time</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Status</th>
                {/* <th style={{ border: '1px solid #000', padding: '8px' }}>Updated Balance</th> */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.transactionId}>
                  <td style={{ border: '1px solid #000', padding: '8px', fontSize: '12px' }}>
                    {transaction.transactionId.substring(0, 8)}...
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {transaction.accountNumber}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '8px',
                    color: getTransactionTypeColor(transaction.transactionType),
                    fontWeight: 'bold'
                  }}>
                    {transaction.transactionType === 'Credit' ? '+' : '-'}${transaction.transactionAmount.toFixed(2)}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {transaction.transactionMode}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '8px',
                    color: getTransactionTypeColor(transaction.transactionType),
                    fontWeight: 'bold'
                  }}>
                    {transaction.transactionType}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {formatDate(transaction.transactionOn)}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '8px',
                    color: getStatusColor(transaction.status),
                    fontWeight: 'bold'
                  }}>
                    {transaction.status}
                  </td>
                  {/* <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    ${transaction.updatedBalance.toFixed(2)}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        border: '1px solid #007bff', 
        borderRadius: '8px', 
        background: '#f0f8ff', 
        maxWidth: '800px',
        width: '100%'
      }}>
        <h4 style={{ color: '#007bff', marginBottom: '10px' }}>📋 Transaction Management Features</h4>
        <ul style={{ textAlign: 'left', margin: 0 }}>
          <li><strong>Process Transaction:</strong> Create new credit/debit transactions with real-time balance updates</li>
          <li><strong>Date Range Search:</strong> Find transactions within specific date ranges using calendar picker</li>
          <li><strong>Recent Transactions:</strong> Get the last N transactions for any account</li>
          <li><strong>Transaction Modes:</strong> UPI, Net Banking, ATM (max $100,000 for ATM)</li>
          <li><strong>Real-time Updates:</strong> Balance updates automatically reflect in account records</li>
        </ul>
      </div>
    </div>
  );
};

export default Transaction;
