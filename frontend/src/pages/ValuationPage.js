import React, { useState, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, VALUATION_CHECK } from '../graphql/queries';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ValuationAggregatorDisplay from '../components/ValuationAggregatorDisplay';
import { useReactToPrint } from 'react-to-print';

// Optional background
import heroBg from '../images/drkbgd.jpg';

export default function ValuationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialReg = searchParams.get('reg') || '';
  const [reg, setReg] = useState(initialReg);
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  const [valuationCheck, { data: valData, loading: valLoading, error: valError }] =
    useLazyQuery(VALUATION_CHECK);

  const hasResults = !!(valData && valData.valuation);

  // Print
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Valuation_Report_${reg}`,
  });

  React.useEffect(() => {
    if (initialReg) {
      handleCheck();
      navigate('/valuation', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) setReg(val);
  };

  const handleCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn) return;
    if (!reg) return;
    await valuationCheck({ variables: { reg } });
  };

  return (
    <>
      <style>{`
        .valuation-hero {
          width: 100%;
          min-height: 50vh;
          background: url(${heroBg}) center top no-repeat;
          background-size: cover;
          color: #fff;
          text-align: center;
          padding: 3rem 1rem;
        }
        .valuation-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .valuation-hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .plate-container {
          width: 70%;
          height: 200px;
          margin: 2rem auto;
          display: flex;
          align-items: stretch;
          border: 2px solid #000;
          border-radius: 25px;
          overflow: hidden;
          max-width: 785px;
        }
        .plate-blue {
          background-color: #003399;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 130px;
          font-size: 4.5rem;
          font-weight: bold;
          padding: 5px;
        }
        .plate-input {
          flex: 1;
          background-color: #FFDE46;
          color: #000;
          font-weight: bold;
          font-size: 7rem;
          border: none;
          text-transform: uppercase;
          padding: 0 1rem;
          outline: none;
          line-height: 1;
          padding-left: 10%;
        }
        @media (max-width: 768px) {
          .plate-container {
            width: 100%;
            height: 120px;
            margin: 1rem auto;
          }
          .plate-blue {
            width: 80px;
            font-size: 2.5rem;
          }
          .plate-input {
            font-size: 3rem;
            padding-left: 5%;
          }
        }
        .valuation-info-section {
          background: #fff;
          padding: 3rem 1rem;
          margin-top: 2rem;
        }
        .valuation-info-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
        }
      `}</style>

      <div className="valuation-hero">
        <h1>Valuation Check</h1>
        <p>Get an instant estimate of your vehicle’s market value.</p>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              className="plate-input"
              placeholder="AB12 CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          <div className="text-center">
            {hasResults ? (
              <button
                onClick={() => window.location.reload()}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#1560BD',
                  color: '#fff',
                  marginTop: '1rem',
                }}
              >
                Search Again
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={valLoading}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#1560BD',
                  color: '#fff',
                  marginTop: '1rem',
                }}
              >
                {valLoading ? 'Checking...' : 'Get Valuation'}
              </button>
            )}
          </div>

          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info mt-2">
              Please login or register to do a Valuation check.
            </div>
          )}
          {valError && (
            <div className="alert alert-danger mt-2">
              {valError.message}
            </div>
          )}
        </div>
      </div>

      {valData?.valuation && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
            <button className="btn btn-secondary" onClick={handlePrint}>
              Print / Save
            </button>
          </div>
          <div ref={printRef}>
            <ValuationAggregatorDisplay valData={valData.valuation} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="valuation-info-section">
        <h2>Why Get a Vehicle Valuation?</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            Knowing a car’s true market value helps you avoid overpaying 
            or underselling. Our valuation tool analyzes current market 
            data to give you a realistic price range for your vehicle.
          </p>
          <ul>
            <li>Compare private vs. trade-in values</li>
            <li>Understand local market demand</li>
            <li>Negotiate from an informed position</li>
          </ul>
          <p>
            Whether you’re buying, selling, or just curious, an accurate 
            valuation empowers you to make the right financial decision.
          </p>
        </div>
      </div>
    </>
  );
}
