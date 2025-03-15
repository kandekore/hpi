import React, { useState, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';
import { useReactToPrint } from 'react-to-print';
import VehicleDetailsMOT from '../components/VehicleDetailsMOT';
import heroBg from '../images/mot-head.jpg'; // Your background image

export default function MOTPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1) Registration input
  const initialReg = searchParams.get('reg') || '';
  const [reg, setReg] = useState(initialReg);
  const [attemptedSearch, setAttemptedSearch] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 2) Query user for credit logic
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // 3) Calculate free vs. paid credits
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
  const motCredits = userProfile?.motCredits ?? 0;
  const totalMot = freeMotLeft + motCredits; // total available MOT checks

  // 4) Lazy query for MOT
  const [motCheck, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK);

  const hasResults = !!(motData && motData.motCheck);

  // 5) For printing
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `MOT_Report_${reg}`,
  });

  // 6) If there's ?reg= param, auto-check once
  React.useEffect(() => {
    if (initialReg) {
      handleMOTCheck();
      navigate('/mot', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  ////////////////////////////////////////////////
  // BEGIN: Modal logic (copy from HomePage pattern)
  ////////////////////////////////////////////////
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);
  const modalRef = useRef(null);

  // show the credit usage modal
  const showCreditsModal = (creditsCount, searchType, actionFn) => {
    setModalMsg(
      `You have ${creditsCount} ${searchType} checks left. This search will deduct 1 credit.`
    );
    setModalSearchType(searchType);
    setShowModal(true);
    setPendingSearchAction(() => actionFn);
  };

  // user confirmed => run the action
  const handleConfirmSearch = () => {
    if (pendingSearchAction) {
      pendingSearchAction();
    }
    setShowModal(false);
  };

  // user canceled
  const handleCancelSearch = () => {
    setShowModal(false);
    setPendingSearchAction(null);
  };
  ////////////////////////////////////////////////
  // END: Modal logic
  ////////////////////////////////////////////////

  // 7) Our "Check MOT" logic
  const handleMOTCheck = async () => {
    setAttemptedSearch(true);
    setErrorMsg('');

    // Basic checks
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg('Please login or register to do an MOT check.');
      return;
    }
    if (!userProfile) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    // If credits exist => show the confirm modal
    if (totalMot > 0) {
      // pass an action that calls the actual motCheck query
      showCreditsModal(totalMot, 'MOT', () =>
        motCheck({ variables: { reg } })
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
        /* Additional info section styling */
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

      {/* MODAL => same pattern as HomePage */}
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
                ></button>
              </div>
              <div className="modal-body">
                <p>{modalMsg}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={handleCancelSearch}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleConfirmSearch}>
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="mot-hero">
        <h1>MOT Check</h1>
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

          {/* If user not logged in or no reg => info, or error => show it */}
          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info mt-2">
              Please login or register to do an MOT check.
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-danger mt-2">
              {errorMsg}
            </div>
          )}
          {motError && (
            <div className="alert alert-danger mt-2">
              {motError.message}
            </div>
          )}
        </div>
      </div>

      {/* RESULT: only show if we have data */}
      {motData?.motCheck && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
            <button className="btn btn-secondary" onClick={handlePrint}>
              Print / Save
            </button>
          </div>
          <div ref={printRef}>
            {/* Vehicle info */}
            <VehicleDetailsMOT dataItems={motData.motCheck} userProfile={userProfile} />
            {/* The main MOT result */}
            <MOTResultDisplay motCheck={motData.motCheck} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mot-info-section">
        <h2>Why is an MOT Check Important?</h2>
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
