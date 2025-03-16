import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, VALUATION_CHECK, MOT_CHECK } from '../graphql/queries';

import ValuationAggregatorDisplay from '../components/ValuationAggregatorDisplay';
import MOTResultDisplay from '../components/MOTResultDisplay'; 
import { useReactToPrint } from 'react-to-print';

import heroBg from '../images/vehicle-valuation.jpg';

export default function ValuationPage() {
  // 1) Read ?reg param
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialReg = searchParams.get('reg') || '';

  // Basic states
  const [reg, setReg] = useState(initialReg);
  const [attemptedSearch, setAttemptedSearch] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 2) Query user
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // 3) Lazy queries for Valuation + optional MOT
  const [valuationCheck, { data: valData, loading: valLoading, error: valError }] =
    useLazyQuery(VALUATION_CHECK, { fetchPolicy: 'no-cache' });
  const hasValResults = !!(valData && valData.valuation);

  const [getMotData, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK, { fetchPolicy: 'no-cache' });
  const hasMotResults = !!(motData && motData.motCheck);

  // 4) Print logic
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Valuation_Report_${reg}`,
  });

  // 5) If there's a ?reg param, auto-check
  useEffect(() => {
    if (initialReg) {
      handleValuationCheck();
      navigate('/valuation', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Registration input
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // --- Modal logic for credit confirmation ---
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);
  const modalRef = useRef(null);

  const showCreditsModal = (creditsCount, searchType, actionFn) => {
    setModalMsg(
      `You have ${creditsCount} ${searchType} checks left. This search will deduct 1 credit.`
    );
    setModalSearchType(searchType);
    setShowModal(true);
    setPendingSearchAction(() => actionFn);
  };
  const handleConfirmSearch = () => {
    if (pendingSearchAction) pendingSearchAction();
    setShowModal(false);
  };
  const handleCancelSearch = () => {
    setShowModal(false);
    setPendingSearchAction(null);
  };
  // --- End modal logic ---

  // 6) The "Valuation Check" logic
  const handleValuationCheck = async () => {
    setAttemptedSearch(true);
    setErrorMsg('');

    // If not logged in => set a React node with links
    if (!isLoggedIn) {
      setErrorMsg(
        <>
          Please <Link to="/login">login</Link> or{' '}
          <Link to="/register">register</Link> to do a Valuation check.
        </>
      );
      return;
    }
    // If no registration
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    // If user profile not loaded
    if (!userProfile) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    // 7) Check Valuation credits
    const valuationCredits = userProfile?.valuationCredits ?? 0;
    if (valuationCredits > 0) {
      // Show usage confirmation modal
      showCreditsModal(valuationCredits, 'Valuation', async () => {
        // Once user confirms => we run both queries (Valuation + MOT)
        await getMotData({ variables: { reg } });
        await valuationCheck({ variables: { reg } });
      });
    } else {
      setErrorMsg('You have no Valuation credits left. Please purchase more.');
    }
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
          color: #003366;
          text-shadow: 2px 2px #ffde45;
        }
        .valuation-hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #000;
          text-shadow: 1px 1px #ffde45;
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
        .valbutton {
          display: none;
        }
      `}</style>

      {/* Modal => credit usage */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          ref={modalRef}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="modal-header">
                <h5 className="modal-title">Confirm {modalSearchType} Search</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelSearch}
                />
              </div>
              <div className="modal-body">
                <p>{modalMsg}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={handleCancelSearch}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleConfirmSearch}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="valuation-hero">
        <h1>Valuation Check</h1>
        <p>Get an instant estimate of your vehicle’s market value.</p>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Registration input */}
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              className="plate-input"
              placeholder="AB12 CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          {/* Check button */}
          <div className="text-center">
            {hasValResults ? (
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
                onClick={handleValuationCheck}
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

          {/* Unified error display */}
          {errorMsg && (
            <div className="alert alert-danger mt-2" style={{ maxWidth: '600px', margin: '1rem auto' }}>
              {errorMsg}
            </div>
          )}

          {/* GraphQL errors */}
          {valError && (
            <div className="alert alert-danger mt-2">
              {valError.message}
            </div>
          )}
          {motError && (
            <div className="alert alert-danger mt-2">
              {motError.message}
            </div>
          )}
        </div>
      </div>

      {/* Show the Valuation data if available */}
      {hasValResults && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
           
          </div>
          <div ref={printRef}>
            <ValuationAggregatorDisplay valData={valData.valuation} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Optionally show the MOT data as well */}
      {hasMotResults && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <MOTResultDisplay motCheck={motData.motCheck} userProfile={userProfile} />
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
