import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';

function HomePage() {
  const [reg, setReg] = useState('');
  const [motCheck, { data, loading, error }] = useLazyQuery(MOT_CHECK, {
    fetchPolicy: 'no-cache'
  });

  const handleMOTCheck = async () => {
    await motCheck({ variables: { reg } });
  };

  const isLoggedIn = !!localStorage.getItem('authToken');

  // Determine if it's a free check or not. If the user is not logged in, we consider it a free check.
  // If user is logged in but they have not exhausted free checks, still free.
  // If user is logged in and no free checks left, assume a paid check.
  // For simplicity, let's assume if not logged in => free check, if logged in => paid check.
  // Adjust logic as needed based on your actual free check counting logic.
  const isFreeCheck = !isLoggedIn;

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
      {data && data.motCheck && (
        <div style={{ marginTop: '20px' }}>
          <h2>MOT Check Result</h2>
          <MOTResultDisplay data={data.motCheck} isFreeCheck={isFreeCheck} />
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
