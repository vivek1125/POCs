import React from 'react';

const StatusDebug: React.FC = () => {
  // Test different status mappings
  const testCases = [
    { apiStatus: 0, description: "API returns 0" },
    { apiStatus: 1, description: "API returns 1" },
    { apiStatus: '0', description: "API returns '0' (string)" },
    { apiStatus: '1', description: "API returns '1' (string)" },
    { apiStatus: true, description: "API returns true" },
    { apiStatus: false, description: "API returns false" }
  ];

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', margin: '20px', background: '#f8f9fa' }}>
      <h3>🔍 Status Mapping Debug</h3>
      <p><strong>Expected Logic:</strong> API status 0 = Active, API status 1 = Deactive</p>
      
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '15px' }}>
        <thead>
          <tr style={{ background: '#e9ecef' }}>
            <th style={{ border: '1px solid #000', padding: '8px' }}>API Value</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Type</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Current Logic (=== 0)</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Display Status</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Reverse Logic (=== 1)</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Reverse Display</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((test, index) => {
            const currentLogic = test.apiStatus === 0;
            const reverseLogic = test.apiStatus === 1;
            
            return (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{String(test.apiStatus)}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{typeof test.apiStatus}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{String(currentLogic)}</td>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px',
                  color: currentLogic ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {currentLogic ? 'Active' : 'Inactive'}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{String(reverseLogic)}</td>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px',
                  color: reverseLogic ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {reverseLogic ? 'Active' : 'Inactive'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Check the TestAllAPI page and run the "Test Get All" button</li>
          <li>Look at the console logs to see what raw accountStatus values the API is returning</li>
          <li>Compare with this table to see which logic produces the correct display</li>
          <li>Tell me if the "Current Logic" column shows the right status or if we need "Reverse Logic"</li>
        </ol>
      </div>
    </div>
  );
};

export default StatusDebug;
