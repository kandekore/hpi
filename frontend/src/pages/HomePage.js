// src/pages/HomePage.js
import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';

function HomePage() {
  const [reg, setReg] = useState('');
  const [motCheck, { data, loading, error }] = useLazyQuery(MOT_CHECK, {
    fetchPolicy: 'no-cache'
  });
  const isLoggedIn = !!localStorage.getItem('authToken');
  const isFreeCheck = !isLoggedIn;

  const handleMOTCheck = async () => {
    await motCheck({ variables: { reg } });
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-3">Check your MOT for free</h1>
        {!isLoggedIn && (
          <div className="alert alert-info">
            Not logged in? You have a limited number of free checks. <a href="/register" className="alert-link">Register</a> for more benefits!
          </div>
        )}
        {error && <div className="alert alert-danger">{error.message}</div>}
        <div className="input-group mb-3">
          <input 
            type="text"
            className="form-control"
            placeholder="Enter Vehicle Registration"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleMOTCheck} disabled={loading}>
            {loading ? 'Checking...' : 'Check MOT'}
          </button>
        </div>
      </div>

      {data && data.motCheck && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header">
            <h2>MOT Check Result</h2>
          </div>
          <div className="card-body">
            <MOTResultDisplay data={data.motCheck} isFreeCheck={isFreeCheck} />
          </div>
        </div>
      )}

      <div className="card border-secondary mb-4">
        <div className="card-body text-center">
          [Ad Banner]
        </div>
      </div>
    </div>
  );
}

export default HomePage;
