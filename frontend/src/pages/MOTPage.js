import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Helmet } from 'react-helmet-async';

// GraphQL Queries
import { GET_USER_PROFILE, PUBLIC_VEHICLE_PREVIEW, MOT_CHECK } from '../graphql/queries';

// Import your separate AuthTabs component
import AuthTabs from '../components/AuthTabs';

// Additional components
import VehicleDetailsMOT from '../components/VehicleDetailsMOT';
import MOTResultDisplay from '../components/MOTResultDisplay';

// Images / assets
import heroBg from '../images/mot-head.jpg';
import ReCAPTCHA from 'react-google-recaptcha';

export default function MOTPage() {
  // 1) React Router
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2) Local States
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [partialData, setPartialData] = useState(null);

  // reCAPTCHA states
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // For confirm usage modal
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);

  // For user profile / credits
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
  const motCredits = userProfile?.motCredits ?? 0;
  const totalMot = freeMotLeft + motCredits;

  // 3) Queries
  // (A) publicVehiclePreview
  const [fetchPublicPreview, { loading: publicLoading, error: publicError }] =
    useLazyQuery(PUBLIC_VEHICLE_PREVIEW, {
      onCompleted: (data) => {
        setPartialData(data.publicVehiclePreview);
      },
    });

  // (B) MOT full check
  const [motCheck, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK, { fetchPolicy: 'no-cache' });
  const hasMotResults = !!(motData && motData.motCheck);

  // 4) If there's ?reg=... in the URL => auto-trigger the same logic
  useEffect(() => {
    const initialReg = searchParams.get('reg');
    if (initialReg) {
      const upperReg = initialReg.toUpperCase();
      setReg(upperReg);
      // Call the same logic as clicking the "Check" button
      autoTriggerMOTCheck(upperReg);
      // Remove ?reg from the URL
      navigate('/mot', { replace: true });
    }
  }, [searchParams, navigate]);

  // Helper: auto-run the same "partial vs full" check flow
  const autoTriggerMOTCheck = (incomingReg) => {
    setErrorMsg('');
    if (!incomingReg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      // Not logged in => partial check => show reCAPTCHA
      setShowCaptchaModal(true);
    } else {
      // Logged in => attempt full usage
      handleFullMotCheck(incomingReg);
    }
  };

  // 5) The normal "Check" button approach
  const handleCheckButton = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      // partial
      setShowCaptchaModal(true);
    } else {
      handleFullMotCheck(reg);
    }
  };

  // 6) partial => after reCAPTCHA success => fetchPublicPreview
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

  // 7) Full MOT check
  const handleFullMotCheck = (regToCheck = reg) => {
    setErrorMsg('');
    if (!userProfile) {
      setErrorMsg('Unable to load your profile. Please try again.');
      return;
    }
    if (totalMot < 1) {
      setErrorMsg('No MOT credits left. Please purchase more.');
      return;
    }
    // usage modal => confirm => run motCheck
    showCreditsModal(totalMot, () => {
      motCheck({ variables: { reg: regToCheck } });
    });
  };

  // 8) Show usage modal
  const usageModalRef = useRef(null);
  const showCreditsModal = (creditsCount, actionFn) => {
    setModalMsg(`You have ${creditsCount} MOT checks left. Use 1 credit now?`);
    setModalSearchType('MOT');
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

  // 9) if user logs in from partial => full check
  const handleAuthSuccess = () => {
    handleFullMotCheck(reg);
  };

  // 10) For printing final results
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `MOT_Report_${reg}`,
  });

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
      <Helmet>
        <title>MOT History Check | Vehicle Data Information</title>
        <meta name="description" content="Quickly view your vehicle’s MOT history, mileage records, and advisories." />
      </Helmet>

      {/* HERO SECTION */}
      <div
        style={{
          width: '100%',
          minHeight: '50vh',
          background: `url(${heroBg}) center top no-repeat`,
          backgroundSize: 'cover',
          color: '#fff',
          textAlign: 'center',
          padding: '3rem 1rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            fontWeight: 700,
            color: '#003366',
            textShadow: '2px 2px #ffde45',
          }}
        >
          MOT Full History Check
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textShadow: '1px 1px #000' }}>
          Instantly view your vehicle’s MOT history and advisories.
        </p>

        {/* Plate & Button */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              width: '70%',
              height: 200,
              margin: '2rem auto',
              display: 'flex',
              alignItems: 'stretch',
              border: '2px solid #000',
              borderRadius: 25,
              overflow: 'hidden',
              maxWidth: 785,
            }}
          >
            <div
              style={{
                backgroundColor: '#003399',
                color: '#fff',
                width: 130,
                fontSize: '4.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              GB
            </div>
            <input
              style={{
                flex: 1,
                backgroundColor: '#FFDE46',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '7rem',
                border: 'none',
                textTransform: 'uppercase',
                paddingLeft: '10%',
                outline: 'none',
              }}
              placeholder="AB12 CDE"
              value={reg}
              onChange={(e) => {
                setReg(e.target.value.toUpperCase());
                setPartialData(null);
                setErrorMsg('');
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            {hasMotResults ? (
              <button
                onClick={() => window.location.reload()}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: 25,
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
                disabled={motLoading || publicLoading}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: 25,
                  border: 'none',
                  backgroundColor: '#1560BD',
                  color: '#fff',
                  marginTop: '1rem',
                }}
              >
                {motLoading || publicLoading ? 'Checking...' : 'Check MOT'}
              </button>
            )}
          </div>

          {/* Errors */}
          {errorMsg && (
            <div
              className="alert alert-danger mt-3"
              style={{ maxWidth: 600, margin: '1rem auto' }}
            >
              {errorMsg}
            </div>
          )}
          {publicError && (
            <div
              className="alert alert-danger mt-3"
              style={{ maxWidth: 600, margin: '1rem auto' }}
            >
              {publicError.message}
            </div>
          )}
          {motError && (
            <div
              className="alert alert-danger mt-3"
              style={{ maxWidth: 600, margin: '1rem auto' }}
            >
              {motError.message}
            </div>
          )}

          {/* Partial result if not logged in */}
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
              <p style={{ fontSize: '25px' }}>
                <strong>
                  {partialData.colour} {partialData.make}
                  {partialData.year && ` from ${partialData.year}`}
                </strong>
              </p>
              <p>
                Please register or log in below to unlock the full MOT history.
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

      {/* If logged in & we have MOT data => show results */}
      {motData?.motCheck && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
            {/* Print button, if desired */}
          </div>
          <div ref={printRef}>
            <VehicleDetailsMOT dataItems={motData.motCheck} userProfile={userProfile} />
            <MOTResultDisplay motCheck={motData.motCheck} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Confirm usage modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          ref={usageModalRef}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 8 }}>
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

      {/* reCAPTCHA modal for partial data if not logged in */}
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

      {/* Additional Info ... */}
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
