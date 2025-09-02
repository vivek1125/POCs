import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerApiService, { CustomerData, NewCustomer } from '../api/CustomerApiService';

// CustomerData and NewCustomer imported from CustomerApiService

const Customer: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    customerAddress: '',
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const raw = await CustomerApiService.getCustomers();
        // Map backend fields to frontend fields
        const mapped = Array.isArray(raw)
          ? raw.map((c: any) => ({
              id: c.customerId,
              name: c.customerName,
              mobile: c.customerMobile,
              email: c.customerEmail,
              address: c.customerAddress,
              status: c.status,
            }))
          : [];
        setCustomers(mapped);
      } catch (err: any) {
        console.error('=== CUSTOMER FETCH ERROR ===');
        console.error('Full error object:', err);
        console.error('Error response:', err?.response);
        console.error('Error response data:', err?.response?.data);
        console.error('Error response status:', err?.response?.status);
        console.error('Error message:', err?.message);
        console.error('=== END ERROR DEBUG ===');
        
        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch customers';
        if (err?.response?.status === 401) {
          setError('Authentication failed (401). Please log in again.');
        } else {
          setError(`Error ${err?.response?.status || 'Unknown'}: ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const toggleStatus = async (id: number, currentStatus: string) => {
    if (user?.role?.toLowerCase() !== 'admin') return;
    const action = currentStatus === 'Activate' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;
    setActionLoadingId(id);
    try {
      let newStatus = currentStatus;
      if (currentStatus === 'Activate') {
        // Deactivate: call DeleteCustomer (use DELETE method)
  await CustomerApiService.deactivateCustomer(id);
  newStatus = 'Deactivate';
      } else {
        // Activate: call ActivateCustomer
  await CustomerApiService.activateCustomer(id);
  newStatus = 'Activate';
      }
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id ? { ...customer, status: newStatus } : customer
        )
      );
    } catch (err: any) {
      console.error('Status update error:', err?.response ?? err);
      setError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess(false);
    try {
      const added = await CustomerApiService.addCustomer(newCustomer);
      // Add to table if backend returns the new customer
      if (added && added.customerId) {
        setCustomers((prev) => [
          ...prev,
          {
            id: added.customerId,
            name: added.customerName,
            mobile: added.customerMobile,
            email: added.customerEmail,
            address: added.customerAddress,
            status: added.status || 'Activate',
          },
        ]);
        setAddSuccess(true);
        setShowAddForm(false);
        setNewCustomer({ customerName: '', customerMobile: '', customerEmail: '', customerAddress: '' });
      } else {
        setAddError('Failed to add customer');
      }
    } catch (err: any) {
      setAddError(err?.response?.data?.message || 'Failed to add customer');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh' }}>
      <h2>Customer List</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Customer'}
        </button>
        <button 
          onClick={() => {
            console.log('=== AUTH DEBUG INFO ===');
            console.log('User:', user);
            console.log('Token:', token);
            console.log('Token from localStorage:', localStorage.getItem('jwtToken'));
            console.log('User data from localStorage:', localStorage.getItem('userData'));
            console.log('Token length:', token ? token.length : 'null');
            console.log('Token valid format:', token ? token.startsWith('eyJ') : 'null');
            alert('Check console for auth debug info');
          }}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Debug Auth
        </button>
        <button 
          onClick={async () => {
            try {
              console.log('=== TESTING API CONNECTION ===');
              const response = await CustomerApiService.getCustomers();
              console.log('API Test Success:', response);
              alert('API test successful - check console for details');
            } catch (error: any) {
              console.error('API Test Failed:', error);
              console.error('Status:', error?.response?.status);
              console.error('Data:', error?.response?.data);
              alert(`API test failed: ${error?.response?.status} - ${error?.response?.data?.message || error.message}`);
            }
          }}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Test API
        </button>
      </div>
      {showAddForm && (
        <form onSubmit={handleAddCustomer} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 16 }}>
          <input
            type="text"
            placeholder="Name"
            value={newCustomer.customerName}
            onChange={e => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Mobile"
            value={newCustomer.customerMobile}
            onChange={e => setNewCustomer({ ...newCustomer, customerMobile: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.customerEmail}
            onChange={e => setNewCustomer({ ...newCustomer, customerEmail: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={newCustomer.customerAddress}
            onChange={e => setNewCustomer({ ...newCustomer, customerAddress: e.target.value })}
            required
          />
          <button type="submit">Add</button>
          {addError && <p style={{ color: 'red' }}>{addError}</p>}
          {addSuccess && <p style={{ color: 'green' }}>Customer added!</p>}
        </form>
      )}
      <table style={{ borderCollapse: 'collapse', background: '#fff', border: '2px solid #000', margin: '0 auto', minWidth: '700px', textAlign: 'center' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Id</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Mobile</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Address</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{customer.id}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{customer.name}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{customer.mobile}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{customer.email}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{customer.address}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                <span style={{ 
                  color: customer.status === 'Activate' ? 'green' : 'red', 
                  fontWeight: 'bold' 
                }}>
                  {customer.status}
                </span>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                <button
                  style={{
                    backgroundColor: customer.status === 'Activate' ? 'red' : 'green',
                    color: 'white',
                  }}
                  onClick={() => toggleStatus(customer.id, customer.status)}
                  disabled={user?.role?.toLowerCase() !== 'admin' || actionLoadingId === customer.id}
                  title={user?.role?.toLowerCase() !== 'admin' ? 'Only admin can change status' : ''}
                >
                  {actionLoadingId === customer.id
                    ? 'Please wait...'
                    : customer.status === 'Activate' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customer;
