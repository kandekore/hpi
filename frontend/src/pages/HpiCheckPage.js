// src/pages/HPICheckPage.js

import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import { Helmet } from 'react-helmet-async';

// GraphQL
import { GET_USER_PROFILE, PUBLIC_VEHICLE_PREVIEW, HPI_CHECK } from '../graphql/queries';

// Components
import AuthTabs from '../components/AuthTabs';
import HpiResultDisplay from '../components/HpiResultDisplay';

// reCAPTCHA
import ReCAPTCHA from 'react-google-recaptcha';

// Hero image (full-vehicle-check.jpg)
import heroBg from '../images/full-vehicle-check.jpg';

export default function HPICheckPage() {
  // 1) Query params / navigation
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2) Local state
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [partialData, setPartialData] = useState(null); // from publicVehiclePreview
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // For credit usage
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalSearchType, setModalSearchType] = useState('');
  const [pendingSearchAction, setPendingSearchAction] = useState(null);
  const modalRef = useRef(null);

  // For printing final results
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `HPI_Report_${reg}`,
  });

  // 3) Query user
  const { data: profileData, loading: profileLoading, refetch  } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // If user is logged in, get their HPI credits
  const hpiCredits = userProfile?.hpiCredits ?? 0;

  // 4) Lazy Queries
  // (A) Partial data => publicVehiclePreview
  const [fetchPublicPreview, { loading: publicLoading, error: publicError }] =
    useLazyQuery(PUBLIC_VEHICLE_PREVIEW, {
      onCompleted: (data) => {
        setPartialData(data.publicVehiclePreview);
      },
    });

  // (B) Full HPI check
  const [hpiCheck, { data: hpiData, loading: hpiLoading, error: hpiError }] =
    useLazyQuery(HPI_CHECK, { fetchPolicy: 'no-cache' });
  const hasResults = !!(hpiData?.hpiCheck);

  // 5) Auto-trigger search if ?reg=... is present
  useEffect(() => {
    const initialReg = searchParams.get('reg');
    if (initialReg) {
      const upperReg = initialReg.toUpperCase();
      setReg(upperReg);
      autoTriggerHpiCheck(upperReg);  // <--- call auto search
      navigate('/hpi', { replace: true }); // remove ?reg from URL
    }
  }, [searchParams, navigate]);

  // Helper: same logic as "Check" button
  const autoTriggerHpiCheck = (incomingReg) => {
    setErrorMsg('');
    if (!incomingReg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      // partial => reCAPTCHA
      setShowCaptchaModal(true);
    } else {
      // full usage
      handleFullHpiCheck(incomingReg);
    }
  };

  // 6) Confirm usage modal
  const showCreditsModal = (creditsCount, actionFn) => {
    setModalMsg(
      `You have ${creditsCount} Full Vehicle History credits left. This check will deduct 1 credit.`
    );
    setModalSearchType('HPI');
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

  // 7) Partial check => open recaptcha modal
  const handlePublicCheck = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    setShowCaptchaModal(true);
  };

  // On recaptcha success => partial data
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

  // 8) Full HPI check if logged in
  const handleFullHpiCheck = (regToCheck = reg) => {
    setErrorMsg('');
    if (!userProfile) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }
    if (hpiCredits < 1) {
      setErrorMsg('You have no Full Vehicle History credits left. Please purchase more.');
      return;
    }
    // Show usage modal => run hpiCheck on confirm
    showCreditsModal(hpiCredits, () => {
      hpiCheck({ variables: { reg: regToCheck } });
    });
  };

  // 9) Single "Check" button => partial or full
  const handleCheckButton = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      handlePublicCheck();
    } else {
      handleFullHpiCheck();
    }
  };

  // 10) On Auth success => do the full check
  const handleAuthSuccess = () => {
    refetch().then(() => {
    handleFullHpiCheck(reg);
  });
  };

  // 11) For reg input
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
    setPartialData(null);
    setErrorMsg('');
  };

  return (
    <>
      <Helmet>
        <title>Full Vehicle History Report | HPI / VDI Type Check | Vehicle Data Information</title>
        <meta
          name="description"
          content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more."
        />
        {/* Open Graph tags */}
        <meta property="og:title" content="Full Vehicle History | HPI / VDI Type Check | Vehicle Data Information" />
        <meta property="og:description" content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more." />
        <meta property="og:image" content={heroBg} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk" />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta name="twitter:title" content="Full Vehicle History | HPI / VDI Type Check | Vehicle Data Information" />
        <meta name="twitter:description" content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more." />
        <meta name="twitter:image" content={heroBg} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <style>{`
        .hpi-hero {
          width: 100%;
          min-height: 50vh;
          background: url(${heroBg}) center top no-repeat;
          background-size: cover;
          color: #fff;
          text-align: center;
          padding: 3rem 1rem;
        }
        .hpi-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-shadow: 2px 2px #ffde45;
          color: #003366;
        }
        .hpi-hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          text-shadow: 1px 1px #ffde45;
          color: #003366;
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
        .hpi-info-section {
          background: #fff;
          padding: 3rem 1rem;
          margin-top: 2rem;
        }
        .hpi-info-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
        }
      `}</style>

      {/* Confirm usage modal */}
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

      {/* reCAPTCHA Modal for partial search */}
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
      <div className="hpi-hero">
        <h1>Full Vehicle History Check</h1>
        <p>
          Access complete vehicle history: outstanding finance, 
          insurance write-offs, theft records, and more.
        </p>

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
                onClick={handleCheckButton}
                disabled={hpiLoading || publicLoading}
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
                {(hpiLoading || publicLoading) ? 'Checking...' : 'Check Vehicle History'}
              </button>
            )}
          </div>

          {/* Single error message */}
          {errorMsg && (
            <div className="alert alert-danger mt-2" style={{ maxWidth: '600px', margin: '1rem auto' }}>
              {errorMsg}
            </div>
          )}

          {/* GraphQL error for partial or full check */}
          {publicError && (
            <div className="alert alert-danger mt-2" style={{ maxWidth: 600, margin: '1rem auto' }}>
              {publicError.message}
            </div>
          )}
          {hpiError && (
            <div className="alert alert-danger mt-2" style={{ maxWidth: 600, margin: '1rem auto' }}>
              {hpiError.message}
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
                  {partialData.colour} {partialData.make}
                  {partialData.year && ` from ${partialData.year}`}
                </strong>
              </p>
              <p style={{ color: '#003366', textShadow: 'none' }}>
                Please register or log in below to unlock the full HPI-style check,
                including outstanding finance, theft records, and more.
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

      {/* If we have full HPI data => show it */}
      {hpiData?.hpiCheck && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div ref={printRef}>
            <HpiResultDisplay
              hpiData={hpiData.hpiCheck}
              userProfile={userProfile}
            />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="hpi-info-section">
        <h2>Why Get a Full Vehicle History Check?</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            A Full Vehicle History Check report ensures you don’t inherit someone else’s debt 
            or risk owning a stolen vehicle. Verify finance status, previous 
            accidents, theft records, and more—all in one detailed report.
          </p>
          <ul>
            <li>Identify outstanding finance or hidden damage</li>
            <li>Check for theft or insurance write-offs</li>
            <li>Review the vehicle’s keeper history and VIN</li>
          </ul>
          <p>
            Protect yourself before buying or selling a car, and gain 
            total confidence with every transaction.
          </p>
        </div>
      </div>
    </>
  );
}
