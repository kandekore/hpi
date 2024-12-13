import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { VDI_CHECK } from '../graphql/queries';

function VdiCheckPage() {
  const [reg, setReg] = useState('');
  const [vdiCheck, { data, loading, error }] = useLazyQuery(VDI_CHECK);

  const handleVDICheck = async () => {
    // Check if user is logged in and has credits on the backend.
    await vdiCheck({ variables: { reg } });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>VDI Check</h1>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
      <input 
        type="text" 
        placeholder="Enter Vehicle Registration" 
        value={reg} 
        onChange={(e) => setReg(e.target.value)} 
      />
      <button onClick={handleVDICheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check VDI'}
      </button>
      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>VDI Check Result</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data.vdiCheck, null, 2)}</pre>
        </div>
      )}
      <div className="ad-banner" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default VdiCheckPage;
