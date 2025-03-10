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
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;

  const [
    fetchValuation,
    { data: valuationData, loading: valuationLoading, error: valuationError }
  ] = useLazyQuery(VALUATION_CHECK);

  const handleValuationCheck = async () => {
    setAttemptedSearch(true);

    if (!isLoggedIn) return;
    if (!hasValuationCredits) return;

    await fetchValuation({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">Valuation Check</h1>

      <style>{`
        /* Inline for demo; ideally move to your .css */
        .uk-reg-form {
          background-color: #FFDE46; 
          border: 2px solid #000; 
          border-radius: 4px;
          padding: 1rem;
          color: #000;
          font-weight: bold;
          max-width: 500px;
          margin: 0 auto; 
        }
        .uk-reg-input {
          width: 100%;
          background-color: #FFDE46;
          border: 1px solid #000;
          color: #000;
          font-weight: bold;
          text-transform: uppercase;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }
        .uk-reg-button {
          display: block;
          width: 100%;
          background-color: #1560BD;
          color: #fff;
          font-weight: bold;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 1rem;
          cursor: pointer;
        }
        .uk-reg-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      {/* Card optional, or remove card + style the form directly */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="uk-reg-form">
            <h5>Enter Vehicle Registration</h5>

            <input
              type="text"
              className="uk-reg-input"
              placeholder="AB12CDE"
              value={reg}
              onChange={(e) => setReg(e.target.value.toUpperCase())}
            />

            <button
              className="uk-reg-button"
              onClick={handleValuationCheck}
              disabled={valuationLoading}
            >
              {valuationLoading ? 'Checking...' : 'Check Valuation'}
            </button>
          </div>

          {/* Error if not logged in, or no credits */}
          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info mt-2">
              Please login or register to do a Valuation check.
            </div>
          )}
          {attemptedSearch && isLoggedIn && !hasValuationCredits && (
            <div className="alert alert-danger mt-2">
              You have no Valuation Credits left. Please purchase more.
            </div>
          )}
          {valuationError && (
            <div className="alert alert-danger mt-2">
              {valuationError.message}
            </div>
          )}
        </div>
      </div>

      {/* If data => pass aggregator to <ValuationAggregatorDisplay> */}
      {valuationData && valuationData.valuation && (
        <ValuationAggregatorDisplay valData={valuationData.valuation} />
      )}
    </div>
  );
}
