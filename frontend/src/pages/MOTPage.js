// frontend/src/pages/MOTPage.js
import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';

function MOTPage() {
  const [reg, setReg] = useState('');
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  // Get user info
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;

  // For the main MOT check
  const [motCheck, { data: motData, loading: motLoading, error: motError }] = useLazyQuery(MOT_CHECK);

  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn) return;
    await motCheck({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">MOT Check</h1>

      <div className="card mb-4">
        <div className="card-body">
          <p>Enter Vehicle Registration</p>
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="AB12CDE"
              value={reg}
              onChange={(e) => setReg(e.target.value)}
            />
            <button 
              className="btn btn-primary"
              onClick={handleCheck}
              disabled={motLoading}
            >
              {motLoading ? 'Checking...' : 'Check MOT'}
            </button>
          </div>

          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info">
              Please login or register to do a MOT check.
            </div>
          )}
          {motError && (
            <div className="alert alert-danger">
              {motError.message}
            </div>
          )}
        </div>
      </div>

      {/* Show results if we have them */}
      {motData && motData.motCheck && (
        <MOTResultDisplay 
          motCheck={motData.motCheck}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}

export default MOTPage;
