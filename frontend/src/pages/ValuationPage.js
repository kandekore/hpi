// src/pages/ValuationPage.js

import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Helmet } from 'react-helmet-async';
import { useReactToPrint } from 'react-to-print';

// GraphQL
import { GET_USER_PROFILE, PUBLIC_VEHICLE_PREVIEW, VALUATION_CHECK } from '../graphql/queries';

// Components
import AuthTabs from '../components/AuthTabs';
import ValuationAggregatorDisplay from '../components/ValuationAggregatorDisplay';
import MOTResultDisplayValuation from '../components/MOTResultDisplayValuation'; 

// reCAPTCHA
import ReCAPTCHA from 'react-google-recaptcha';

// Images
import heroBg from '../images/vehicle-valuation.jpg';

export default function ValuationPage() {
  // 1) React Router
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2) Local states
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [partialData, setPartialData] = useState(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // For the usage confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);
  const modalRef = useRef(null);

  // 3) Query user
  const { data: profileData, loading: profileLoading, refetch } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // If user is logged in => get Valuation credits
  const valuationCredits = userProfile?.valuationCredits ?? 0;

  // 4) Queries
  // (A) publicVehiclePreview => partial data
  const [fetchPublicPreview, { loading: publicLoading, error: publicError }] =
    useLazyQuery(PUBLIC_VEHICLE_PREVIEW, {
      onCompleted: (data) => {
        setPartialData(data.publicVehiclePreview);
      },
    });

  // (B) Full valuation
  const [valuationCheck, { data: valData, loading: valLoading, error: valError }] =
    useLazyQuery(VALUATION_CHECK, { fetchPolicy: 'no-cache' });

  // 5) If valData.valuation => aggregator
  const hasValResults = !!(valData?.valuation);
  // Possibly show MOT data from valData.valuation.vehicleAndMotHistory
  const motData = valData?.valuation?.vehicleAndMotHistory?.DataItems?.MotHistory;
  const hasMotResults = !!motData;

  // 6) Auto-trigger if ?reg=... in the URL
  useEffect(() => {
    const initialReg = searchParams.get('reg');
    if (initialReg) {
      const upperReg = initialReg.toUpperCase();
      setReg(upperReg);
      autoTriggerValuationCheck(upperReg);
      navigate('/valuation', { replace: true }); // remove ?reg
    }
  }, [searchParams, navigate]);

  // Helper: same logic as "Get Valuation" button
  const autoTriggerValuationCheck = (incomingReg) => {
    setErrorMsg('');
    if (!incomingReg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      // partial => show reCAPTCHA
      setShowCaptchaModal(true);
    } else {
      // full => usage
      handleFullValuationCheck(incomingReg);
    }
  };

  // 7) Print logic
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Valuation_Report_${reg}`,
  });

  // 8) Confirm usage modal
  const showCreditsModal = (creditsCount, actionFn) => {
    setModalMsg(
      `You are requesting a Vehicle Valuation for registration ${reg}. ` +
      `You have ${creditsCount} Valuation checks left. This search will deduct 1 credit.`
    );
    setModalSearchType('VALUATION');
    setShowModal(true);
    setPendingSearchAction(() => actionFn);
  };
  const handleConfirmSearch = () => {
    if (pendingSearchAction) {
      pendingSearchAction();
    }
    setShowModal(false);
  };
  const handleCancelSearch = () => {
    setShowModal(false);
    setPendingSearchAction(null);
  };

  // 9) handlePublicCheck => reCAPTCHA partial
  const handlePublicCheck = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    setShowCaptchaModal(true);
  };

  // On recaptcha success => fetchPublicPreview
  const handleCaptchaSuccess = async (token) => {
    setShowCaptchaModal(false);
    setCaptchaToken(token);
    setErrorMsg('');
    try {
      await fetchPublicPreview({ variables: { reg, captchaToken: token } });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  // 10) Full Valuation check if logged in
  //     We pass a newProfile argument so that after login we can use the fresh data from refetch.
  const handleFullValuationCheck = async (regToCheck = reg, newProfile) => {
    setErrorMsg('');

    // use newProfile if provided; fallback to existing userProfile
    const profileToUse = newProfile || userProfile;
    if (!profileToUse) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    const valCreditsAvailable = profileToUse.valuationCredits ?? 0;
    if (valCreditsAvailable < 1) {
      setErrorMsg('You have no Valuation credits left. Please purchase more.');
      return;
    }

    // usage modal => confirm => run
    showCreditsModal(valCreditsAvailable, async () => {
      await valuationCheck({ variables: { reg: regToCheck } });
    });
  };

  // 11) "Check Valuation" button => partial or full
  const handleCheckButton = async () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      // partial
      handlePublicCheck();
    } else {
      // full
      handleFullValuationCheck();
    }
  };

  // 12) If user logs in => do the full check, using newProfile from refetch
  const handleAuthSuccess = () => {
    refetch().then((result) => {
      const newProfile = result.data?.getUserProfile;
      if (!newProfile) {
        setErrorMsg('No user profile found after login');
        return;
      }
      handleFullValuationCheck(reg, newProfile);
    });
  };

  // Render:
  return (
    <>
      <Helmet>
        <title>Instant Vehicle Valuations & Full MOT History | Vehicle Data Information</title>
        <meta name="description" content="Knowing a car’s true market value helps you avoid overpaying or underselling. Our vehicle valuation tool analyzes current market data to give you a realistic price range for your vehicle." />
    
        {/* Open Graph tags */}
        <meta property="og:title" content="Instant Vehicle Valuations & Full MOT History | Vehicle Data Information" />
        <meta property="og:description" content="Knowing a car’s true market value helps you avoid overpaying or underselling. Our valuation tool analyzes real market data to give you a realistic price range for your vehicle." />
        <meta property="og:image" content={heroBg} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk" />
        <meta property="og:type" content="website" />
    
        {/* Twitter */}
        <meta name="twitter:title" content="Instant Vehicle Valuations & Full MOT History | Vehicle Data Information" />
        <meta name="twitter:description" content="Knowing a car’s true market value helps you avoid overpaying or underselling. Our valuation tool analyzes real market data to give you a realistic price range for your vehicle." />
        <meta name="twitter:image" content={heroBg} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

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
          color: #fff;
          text-shadow: 2px 2px #000;
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

      {/* USAGE MODAL */}
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

      {/* reCAPTCHA Modal for partial search (if not logged in) */}
      {showCaptchaModal && !isLoggedIn && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 8 }}>
              <div className="modal-header">
                <h5 className="modal-title">Verify You're Human</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCaptchaModal(false)}
                />
              </div>
              <div className="modal-body mb-3 d-flex justify-content-center" style={{ textAlign: 'center' }}>
                <ReCAPTCHA
                  sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
                  onChange={(token) => handleCaptchaSuccess(token)}
                />
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
              onChange={(e) => {
                setReg(e.target.value.toUpperCase());
                setPartialData(null);
                setErrorMsg('');
              }}
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
                onClick={handleCheckButton}
                disabled={valLoading || publicLoading}
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
                {valLoading || publicLoading ? 'Checking...' : 'Get Valuation'}
              </button>
            )}
          </div>

          {/* Error messages */}
          {errorMsg && (
            <div
              className="alert alert-danger mt-2"
              style={{ maxWidth: '600px', margin: '1rem auto' }}
            >
              {errorMsg}
            </div>
          )}
          {valError && (
            <div
              className="alert alert-danger mt-2"
              style={{ maxWidth: '600px', margin: '1rem auto' }}
            >
              {valError.message}
            </div>
          )}
          {publicError && (
            <div
              className="alert alert-danger mt-2"
              style={{ maxWidth: '600px', margin: '1rem auto' }}
            >
              {publicError.message}
            </div>
          )}

          {/* PARTIAL DATA => if user is not logged in */}
          {partialData && !isLoggedIn && partialData.found && (
            <div
              className="alert alert-info mt-3"
              style={{ maxWidth: 600, margin: '1rem auto' }}
            >
              <h5>Vehicle Found!</h5>
              {partialData.imageUrl && (
                <img
                  src={partialData.imageUrl}
                  alt="Car Preview"
                  style={{ maxWidth: '100%', marginBottom: '1rem' }}
                />
              )}
              <p style={{ fontSize: '25px', color: '#003366', textShadow: 'none' }}>
                <strong>
                  {partialData.year} {partialData.colour} {partialData.make}
                </strong>
              </p>
              <p style={{ color: '#003366', textShadow: 'none' }}>
                Please register or log in below to unlock the full Valuation, 
                including market pricing data, optional MOT history, and more.
              </p>
              <AuthTabs onAuthSuccess={handleAuthSuccess} />
            </div>
          )}
          {partialData && !isLoggedIn && !partialData.found && (
            <div
              className="alert alert-warning mt-3"
              style={{ maxWidth: 600, margin: '1rem auto' }}
            >
              {partialData.message || 'No data found for this registration.'}
            </div>
          )}
        </div>
      </div>

      {/* If full Valuation data is found */}
      {hasValResults && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div ref={printRef}>
            <ValuationAggregatorDisplay valData={valData.valuation} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* If also showing MOT data */}
      {hasMotResults && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <MOTResultDisplayValuation motData={motData} userProfile={userProfile} />
        </div>
      )}

      {/* Additional Info */}
      <div className="valuation-info-section">
        <h2>Why Get a Vehicle Valuation?</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            Knowing a car’s true market value helps you avoid overpaying 
            or underselling. Our <strong>instant vehicle valuation tool</strong> analyzes current market 
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
