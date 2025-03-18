import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import { useReactToPrint } from 'react-to-print';

import MOTResultDisplay from '../components/MOTResultDisplay';
import VehicleDetailsMOT from '../components/VehicleDetailsMOT';

import heroBg from '../images/mot-head.jpg';

export default function MOTPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Registration input
  const initialReg = searchParams.get('reg') || '';
  const [reg, setReg] = useState(initialReg);

  // For controlling whether we've tried a search at all
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  // Single error message (can be string or JSX)
  const [errorMsg, setErrorMsg] = useState('');

  // Query user for credit logic
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Calculate free vs. paid credits
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
  const motCredits = userProfile?.motCredits ?? 0;
  const totalMot = freeMotLeft + motCredits;

  // Lazy query for MOT
  const [motCheck, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK, { fetchPolicy: 'no-cache' });
  const hasResults = !!(motData && motData.motCheck);

  // For printing
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `MOT_Report_${reg}`,
  });

  // If there's a ?reg= param, auto-check once
  useEffect(() => {
    if (initialReg) {
      handleMOTCheck();
      // Remove the ?reg from the URL:
      navigate('/mot', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // --- Modal logic for credit usage confirmation ---
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);
  const modalRef = useRef(null);

  // Show the credit usage modal
  const showCreditsModal = (creditsCount, searchType, actionFn, reg) => {
    setModalMsg(
      `You are checking MOT History for registration ${reg}. You have ${creditsCount} ${searchType} checks left. This search will deduct 1 credit.`
    );
    setModalSearchType(searchType);
    setShowModal(true);
    setPendingSearchAction(() => actionFn);
  };

  // User confirmed => run action
  const handleConfirmSearch = () => {
    if (pendingSearchAction) {
      pendingSearchAction();
    }
    setShowModal(false);
  };

  // User canceled
  const handleCancelSearch = () => {
    setShowModal(false);
    setPendingSearchAction(null);
  };
  // --- End modal logic ---

  // The main "Check MOT" handler
  const handleMOTCheck = async () => {
    setAttemptedSearch(true);
    setErrorMsg(''); // Clear any existing error

    // 1) Validate registration
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    // 2) Check login
    if (!isLoggedIn) {
      setErrorMsg(
        <>
          Please{' '}
          <Link to="/login">login</Link>
          {' '}or{' '}
          <Link to="/register">register</Link> to do an MOT check.
        </>
      );
      return;
    }
    // 3) Check if user data is loaded
    if (!userProfile) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    // 4) Check credits
    if (totalMot > 0) {
      // Show usage confirmation modal
      showCreditsModal(totalMot, 'MOT', () =>
        motCheck({ variables: { reg } }),
        reg
      );
    } else {
      setErrorMsg(
        'You have no MOT checks remaining. Please purchase credits or wait for more free checks.'
      );
    }
  };

  return (
    <>
      <style>{`
        .mot-hero {
          width: 100%;
          min-height: 50vh;
          background: url(${heroBg}) center top no-repeat;
          background-size: cover;
          color: #fff;
          text-align: center;
          padding: 3rem 1rem;
        }
        .mot-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #003366;
          text-shadow: 2px 2px #ffde45;
        }
        .mot-hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #fff;
          text-shadow: 1px 1px #000;
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
        .mot-info-section {
          background: #fff;
          padding: 3rem 1rem;
          margin-top: 2rem;
        }
        .mot-info-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
        }
      `}</style>

      {/* Modal for credit confirmation */}
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

      <div className="mot-hero">
        <h1>MOT Full History Check</h1>
        <p>Instantly retrieve your vehicle’s MOT history and advisories.</p>

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
                onClick={handleMOTCheck}
                disabled={motLoading}
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
                {motLoading ? 'Checking...' : 'Check MOT'}
              </button>
            )}
          </div>

          {/* Single error message (for missing reg, not logged in, or no credits) */}
          {errorMsg && (
            <div className="alert alert-danger mt-2" style={{ maxWidth: '600px', margin: '1rem auto' }}>
              {errorMsg}
            </div>
          )}

          {/* GraphQL error from the motCheck query */}
          {motError && (
            <div className="alert alert-danger mt-2">
              {motError.message}
            </div>
          )}
        </div>
      </div>

      {motData?.motCheck && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
           
          </div>
          <div ref={printRef}>
            <VehicleDetailsMOT dataItems={motData.motCheck} userProfile={userProfile} />
            <MOTResultDisplay motCheck={motData.motCheck} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mot-info-section">
        <h2>Why is an MOT History Check Important?</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            Regular MOT checks ensure your vehicle meets the minimum safety 
            standards required by law. Our MOT service helps you quickly see 
            the car’s test results, mileage records, and advisories, so 
            you’ll never be in the dark about a vehicle’s condition.
          </p>
          <ul>
            <li>Uncover hidden or recurring faults</li>
            <li>Validate the accuracy of the stated mileage</li>
            <li>Check for signs of poor maintenance</li>
          </ul>
          <p>
            By running an MOT check through our system, you’ll have peace 
            of mind before committing to a purchase or taking a long trip 
            with your car.
          </p>
        </div>
      </div>
    </>
  );
}
