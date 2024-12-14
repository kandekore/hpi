import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { MOT_CHECK } from '../graphql/queries';

function HomePage() {
  const [reg, setReg] = useState('');
  const [motCheck, { data, loading, error }] = useLazyQuery(MOT_CHECK, {
    fetchPolicy: 'no-cache'
  });

  const handleMOTCheck = async () => {
    await motCheck({ variables: { reg } });
  };

  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div>
      <h1>Check your MOT for free</h1>
      {!isLoggedIn && <p>Not logged in? You have a limited number of free checks. <a href="/register">Register</a> for more benefits!</p>}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
      <input 
        type="text" 
        placeholder="Enter Vehicle Registration" 
        value={reg} 
        onChange={(e) => setReg(e.target.value)} 
      />
      <button onClick={handleMOTCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check MOT'}
      </button>
      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>MOT Check Result</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data.motCheck, null, 2)}</pre>
        </div>
      )}
      <p>
        Check the HPI status of a car <a href="/vdi">here</a>.
      </p>
      <div className="ad-banner" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default HomePage;
