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
  const { data: profileData, loading: profileLoading, refetch  } = useQuery(GET_USER_PROFILE);
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
  const handleFullMotCheck = (regToCheck, newProfile) => {
    setErrorMsg('');
  
    // Use newProfile if it’s provided; fallback to the old userProfile
    const profileToUse = newProfile || userProfile;
  
    if (!profileToUse) {
      setErrorMsg('Unable to load your profile. Please try again.');
      return;
    }
  
    // Then check credits from `profileToUse`
    const freeMotChecksUsed = profileToUse.freeMotChecksUsed ?? 0;
    const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
    const motCredits = profileToUse.motCredits ?? 0;
    const totalMot = freeMotLeft + motCredits;
  
    if (totalMot < 1) {
      setErrorMsg('No MOT credits left. Please purchase more.');
      return;
    }
  
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
    refetch().then((result) => {
      console.log('Refetch result =>', result.data);
      const newProfile = result.data?.getUserProfile;
      if (!newProfile) {
        setErrorMsg('No user profile found after login');
        return;
      }
      // Now do the usage logic with newProfile
      handleFullMotCheck(reg, newProfile);
    });
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
      /* New styles for expanded content */
      .content-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
          line-height: 1.7;
      }
      .content-section h2 {
          font-size: 2.2rem;
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: 700;
          color: #003366;
      }
      .content-section h3 {
          font-size: 1.8rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #1560bd;
      }
      .content-section ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 1.5rem;
      }
      .content-section ul li {
          margin-bottom: 0.7rem;
      }
      .cta-box {
          background-color: #f4f4f4;
          border-left: 5px solid #1560bd;
          padding: 1.5rem;
          margin: 2.5rem auto;
          text-align: center;
          max-width: 800px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .cta-box p {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #333;
      }
      .cta-box a {
          background-color: #1560bd;
          color: #fff;
          padding: 10px 25px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
      }
      .cta-box a:hover {
          background-color: #0d4f9c;
      }
      .key-points {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          margin-top: 2rem;
      }
      .key-point-card {
          background: #e9f5ff;
          border: 1px solid #cceeff;
          border-radius: 8px;
          padding: 1.5rem;
          flex: 1 1 280px;
          max-width: 320px;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
      .key-point-card h4 {
          color: #003366;
          margin-bottom: 0.7rem;
          font-size: 1.3rem;
      }
      .key-point-card i {
          font-size: 2.5rem;
          color: #1560bd;
          margin-bottom: 1rem;
      }
    `}</style>
      <Helmet>
        <title>Free MOT History Check UK | Instant Vehicle Maintenance Records</title>
        <meta name="description" content="Get a free MOT history check for any UK car or van. Instantly view pass/fail results, advisories & mileage to verify vehicle history and condition." />
        <meta property="og:title" content="Free MOT History Check UK | Instant Vehicle Maintenance Records" />
        <meta property="og:description" content="Get a free MOT history check for any UK car or van. Instantly view pass/fail results, advisories & mileage to verify vehicle history and condition." />
        <meta property="og:image" content={heroBg} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk/mot" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Free MOT History Check UK | Instant Vehicle Maintenance Records" />
        <meta name="twitter:description" content="Get a free MOT history check for any UK car or van. Instantly view pass/fail results, advisories & mileage to verify vehicle history and condition." />
        <meta name="twitter:image" content={heroBg} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* HERO SECTION */}
      <div className="mot-hero">
        <h1>Free MOT History Check UK: Uncover Your Vehicle's Maintenance Story</h1>
        <p>
          Instantly view your vehicle’s complete MOT history, mileage records, and crucial advisories. Ensure your next purchase is safe and well-maintained with our comprehensive free MOT check.
        </p>

        {/* Plate & Button */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                Search Another Vehicle
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
                {motLoading || publicLoading ? 'Checking...' : 'Perform Free MOT Check'}
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

      {/* Additional Info Section */}
      <div className="content-section">
        <h2>Why an MOT History Check is Essential for Every UK Vehicle Owner & Buyer</h2>
        <p>
          The MOT (Ministry of Transport) test is an annual legal requirement for vehicles over three years old in the UK, ensuring they meet minimum road safety and environmental standards. While a simple pass certificate is good, the real story of a vehicle's health and maintenance lies within its MOT history. Our free and instant MOT history check service provides you with critical insights that can prevent unforeseen problems and save you money down the line.
        </p>
        <p>
          Whether you're looking to buy a used car check, a van, or simply want to keep tabs on your current vehicle, reviewing its MOT history is an indispensable part of understanding its past and predicting its future performance.
        </p>

        <h3>What Our Free MOT History Check Reveals:</h3>
        <div className="key-points">
            <div className="key-point-card">
                <i className="bi bi-calendar-check"></i>
                <h4>Pass & Fail Records</h4>
                <p>Instantly see every past MOT test result, including clear indications of passes, fails, and partial passes. This helps you grasp the vehicle's historical compliance with safety standards.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-file-earmark-medical"></i>
                <h4>Detailed Advisory Notes</h4>
                <p>Advisory notes highlight minor defects or potential issues that were not severe enough to cause a test failure but require attention. Reviewing these can reveal recurring faults or areas that might soon need repair, such as worn tires, minor corrosion, or deteriorating suspension components.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-speedometer2"></i>
                <h4>Accurate Mileage Verification</h4>
                <p>Each MOT test records the vehicle's mileage at the time of inspection. By comparing these chronological entries, you can easily spot mileage discrepancies or signs of "clocking" – illegal odometer tampering. This is a crucial element of a reliable car history report.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-wrench"></i>
                <h4>Maintenance Insights</h4>
                <p>A consistent record of passes with few advisories suggests a well-maintained vehicle. Conversely, frequent failures for similar issues or a high number of advisories might indicate neglect or chronic problems, giving you insights into its past care and potential future maintenance needs.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-info-circle"></i>
                <h4>Failure Reasons</h4>
                <p>For any failed tests, our report clearly lists the specific reasons for failure. This helps you understand the severity of past issues and if they were adequately addressed, contributing to a full car history understanding.</p>
            </div>
        </div>

        <h3>How Our MOT History Check Benefits You:</h3>
        <ul>
            <li>Prevent Costly Surprises: Identify potential issues before they become expensive problems, saving you money on future repairs.</li>
            <li>Verify Vehicle Condition: Get an objective overview of the vehicle's mechanical and structural health over its lifetime.</li>
            <li>Negotiate with Confidence: Armed with detailed MOT history, you can negotiate more effectively when buying a used car.</li>
            <li>Ensure Roadworthiness: Confirm that a vehicle meets essential safety standards, giving you peace of mind on every journey.</li>
            <li>Complement Full History Checks: While separate from a full HPI check, MOT history provides valuable insights into a vehicle's physical condition and complements other checks like check a car's insurance history for a complete picture.</li>
        </ul>

        <div className="cta-box">
            <p>Ready to uncover the full maintenance story of your vehicle?</p>
            <p>Perform your free MOT history check now!</p>
            <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Start Your Free MOT Check</a>
        </div>

        <h3>Beyond the MOT: A Holistic Approach to Vehicle Information</h3>
        <p>
          While our free MOT check offers invaluable insights into a vehicle's maintenance and roadworthiness, it's just one piece of the puzzle. For a truly comprehensive understanding, we highly recommend combining your MOT history check with our other services:
        </p>
        <ul>
          <li>A Full Vehicle History (HPI) check: This reveals crucial data like outstanding finance, stolen status, insurance write-offs, and other hidden liabilities that an MOT does not cover.</li>
          <li>A Vehicle Valuation: Understand the true market value of the vehicle, which can be influenced by its MOT history and overall condition.</li>
        </ul>
        <p>
          By utilizing all our tools, you can ensure you have the most complete and accurate vehicle data before making any significant decision, protecting your investment and ensuring your safety.
        </p>
      </div>

      {/* BOTTOM BRAND MENTION */}
      <div className="mot-info-section"> {/* Reusing this class for general styling */}
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p>
            All Vehicle Data Information reports, including our instant MOT history checks, are powered by secure, real-time data from leading and authoritative sources. This includes direct integration with VOSA / DVSA (Driver and Vehicle Standards Agency) and the DVLA (Driver and Vehicle Licensing Agency), ensuring the information you receive is accurate, up-to-date, and reliable. We are committed to providing you with transparent and comprehensive vehicle data to empower your decisions. All reports are provided without prejudice on a Pay-As-You-Go basis, offering transparency and flexibility.
          </p>
        </div>
      </div>
    </>
  );
}