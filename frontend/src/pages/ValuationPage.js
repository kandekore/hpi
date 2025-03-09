// ValuationPage.js
import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, VALUATION_CHECK } from '../graphql/queries';
import ValuationAggregatorDisplay from '../components/ValuationAggregatorDisplay';

export default function ValuationPage() {
  const [reg, setReg] = useState('');
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');
  const hasValuationCredits = userProfile?.valuationCredits > 0;

  const [fetchValuation, { data: valuationData, loading: valuationLoading, error: valuationError }] =
    useLazyQuery(VALUATION_CHECK);

  const handleValuationCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn || !hasValuationCredits) return;
    await fetchValuation({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">Valuation Check</h1>

      <div className="card mb-4">
        <div className="card-body">
          {/* Input for reg */}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="AB12CDE"
              value={reg}
              onChange={(e) => setReg(e.target.value.toUpperCase())}
            />
            <button
              className="btn btn-primary"
              onClick={handleValuationCheck}
              disabled={valuationLoading}
            >
              {valuationLoading ? 'Checking...' : 'Check Valuation'}
            </button>
          </div>
          {/* Potential error messages or user not logged in logic */}
          {valuationError && <div className="alert alert-danger mt-2">{valuationError.message}</div>}
        </div>
      </div>

      {/* If data => pass aggregator to <ValuationAggregatorDisplay> */}
      {valuationData && valuationData.valuation && (
        <ValuationAggregatorDisplay valData={valuationData.valuation} />
      )}
    </div>
  );
}
