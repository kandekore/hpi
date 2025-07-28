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
  const { data: profileData, loading: profileLoading, refetch } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // If user is logged in, get their HPI credits
  // (We will also recalc from the newProfile if we fetch it after login)
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
      autoTriggerHpiCheck(upperReg);
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
  //    Accept a second argument "newProfile" (like your MOTPage) so that after login
  //    we can pass the fresh user data in, ensuring we don’t get errors about the old userProfile.
  const handleFullHpiCheck = (regToCheck = reg, newProfile) => {
    setErrorMsg('');

    // If we've just refetched a new profile, use it; otherwise fallback to existing userProfile
    const profileToUse = newProfile || userProfile;
    if (!profileToUse) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    // Recompute hpiCredits from the chosen profile
    const hpiCreditsAvailable = profileToUse.hpiCredits ?? 0;
    if (hpiCreditsAvailable < 1) {
      setErrorMsg('You have no Full Vehicle History credits left. Please purchase more.');
      return;
    }

    // Show usage modal => run hpiCheck on confirm
    showCreditsModal(hpiCreditsAvailable, () => {
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
      handleFullHpiCheck(reg);
    }
  };

  // 10) On Auth success => refetch user, then do the full check
  const handleAuthSuccess = () => {
    refetch().then((result) => {
      const newProfile = result.data?.getUserProfile;
      if (!newProfile) {
        setErrorMsg('No user profile found after login');
        return;
      }
      // Now proceed with the full HPI check using the new profile
      handleFullHpiCheck(reg, newProfile);
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
        <title>Comprehensive HPI Check UK | Full Vehicle History Report & Finance Check</title>
        <meta
          name="description"
          content="Get an instant, comprehensive HPI check for any UK vehicle. Uncover outstanding finance, stolen status, insurance write-offs, mileage discrepancies, and more with our detailed HPI report."
        />
        {/* Open Graph tags */}
        <meta
          property="og:title"
          content="Comprehensive HPI Check UK | Full Vehicle History Report & Finance Check"
        />
        <meta
          property="og:description"
          content="Get an instant, comprehensive HPI check for any UK vehicle. Uncover outstanding finance, stolen status, insurance write-offs, mileage discrepancies, and more with our detailed HPI report."
        />
        <meta property="og:image" content={heroBg} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk/hpi" />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta
          name="twitter:title"
          content="Comprehensive HPI Check UK | Full Vehicle History Report & Finance Check"
        />
        <meta
          name="twitter:description"
          content="Get an instant, comprehensive HPI check for any UK vehicle. Uncover outstanding finance, stolen status, insurance write-offs, mileage discrepancies, and more with our detailed HPI report."
        />
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
        /* New Styles for expanded content */
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
        <h1>Comprehensive HPI Check UK: Unlock Your Vehicle's Full Hidden History</h1>
        <p>
          Gain complete peace of mind with our in-depth HPI Check. Instantly access crucial vehicle data including outstanding finance, insurance write-offs, theft records, mileage discrepancies, and much more. Your essential guide to smart, safe used car buying.
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
                Search Another Vehicle
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
                {(hpiLoading || publicLoading) ? 'Checking History...' : 'Run Full HPI Check'}
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

      {/* Main Content Sections */}
      <div className="content-section">
        <h2>Why a Full Vehicle History (HPI) Check is Non-Negotiable for UK Buyers</h2>
        <p>
          In the bustling UK used car market, appearances can be deceiving. A vehicle might look perfect on the surface, but underneath lies a complex history that can drastically impact its true value, safety, and your legal ownership. This is where a comprehensive Full Vehicle History Check, commonly known as an HPI check or VDI check, becomes absolutely indispensable. It's your ultimate tool for due diligence, providing peace of mind and protecting you from costly pitfalls when buying a used car, van, or even a motorcycle HPI check.
        </p>
        <p>
          Our in-depth HPI report goes far beyond basic details, pulling crucial vehicle data from official and reputable sources across the UK. Don't risk inheriting someone else's problems – get the full story before you commit.
        </p>

        <h3>What Our Comprehensive HPI Check Uncovers:</h3>
        <div className="key-points">
            <div className="key-point-card">
                <i className="bi bi-currency-pound"></i>
                <h4>Outstanding Finance Check</h4>
                <p>Crucially, we verify if the vehicle has outstanding finance recorded against it. This debt can legally transfer to you upon purchase, meaning you could lose the vehicle if the previous owner defaults on their loan. Our HPI finance check ensures you only buy HPI clear vehicles.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-shield-lock"></i>
                <h4>Stolen Vehicle Status</h4>
                <p>Avoid the devastating scenario of buying a stolen vehicle that could be confiscated by the police without compensation. Our report checks against the Police National Computer to confirm its theft status.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-car-front-fill"></i>
                <h4>Insurance Write-Off History</h4>
                <p>Understand if the vehicle has ever been declared an insurance write-off due to severe damage. We detail the write-off category (Cat A, B, S, N), indicating the extent of the damage and potential structural issues, which is vital for both safety and resale value.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-speedometer"></i>
                <h4>Mileage Verification</h4>
                <p>Combat mileage discrepancies or "clocking." Our HPI check cross-references mileage records from various sources (like previous MOTs) to identify inconsistencies and ensure the odometer reflects the vehicle's true journey.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-person-fill"></i>
                <h4>Number of Previous Keepers</h4>
                <p>Gain insight into the keeper history of the vehicle, including how many previous owners it's had. While not a red flag on its own, frequent changes can sometimes warrant further investigation.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-card-checklist"></i>
                <h4>VIN/Chassis Match & Plate Changes</h4>
                <p>We verify the Vehicle Identification Number (VIN match) and highlight any plate transfers or cherished plate changes, ensuring the vehicle's identity is consistent and legitimate.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-geo-alt"></i>
                <h4>Import/Export & Scrapped Status</h4>
                <p>Confirm if the vehicle has been legally imported or exported, or if it's been declared as scrapped – preventing you from buying a vehicle that shouldn't be on the road.</p>
            </div>
        </div>

        <h3>Why Choose Vehicle Data Information for Your HPI Check?</h3>
        <p>
          We are committed to providing the best HPI check experience in the UK. Our service stands out for its accuracy, speed, and comprehensive nature.
        </p>
        <ul>
          <li>Accuracy and Reliability: We aggregate data from official and trusted sources, including HPI Check DVLA records, Police National Computer, and major finance houses, ensuring your HPI report is precise and up-to-date.</li>
          <li>Instant Results: Get your detailed HPI report within seconds. No more waiting – make quick, confident decisions.</li>
          <li>Cost-Effective: We offer a cheap HPI check without compromising on the depth or quality of information, providing excellent value for your money.</li>
          <li>User-Friendly Reports: Our reports are designed to be clear and easy to understand, highlighting critical information and potential red flags at a glance.</li>
          <li>Compare with Confidence: Our data is comparable to standards set by major providers like HPI Check AA or other industry leaders, giving you a robust analysis.</li>
        </ul>

        <div className="cta-box">
            <p>Ready to ensure your next vehicle purchase is safe and secure?</p>
            <p>Don't buy blind. Get your comprehensive HPI check today!</p>
            <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Run Your HPI Check Now</a>
        </div>

        <h3>Beyond the HPI Check: Maximizing Your Vehicle Data Insight</h3>
        <p>
          While the HPI check is fundamental, combining it with our other services provides an even richer understanding of a vehicle's past and present value:
        </p>
        <ul>
          <li>Free MOT History Check: Complement your HPI report by reviewing past MOT results, mileage records, and advisory notes. This helps you assess the vehicle's maintenance history and identify recurring physical issues.</li>
          <li>Vehicle Valuation: Understand the true market value of my car. A clean HPI clear vehicle will naturally command a better price, while any hidden history found in your HPI check can significantly affect its worth. Our HPI car valuation helps you negotiate effectively.</li>
        </ul>
        <p>
          By utilizing all our tools, you can ensure you've conducted a thorough investigation into every aspect of a vehicle's life, from its technical specifications to its financial and accident history. This holistic approach provides the ultimate peace of mind.
        </p>
      </div>

      {/* BOTTOM BRAND MENTION */}
      <div className="hpi-info-section"> {/* Reusing this class for general styling */}
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p>
            All Vehicle Data Information reports, including our comprehensive HPI checks, are powered by secure, real-time data from leading industry sources. This includes direct integration with UK Vehicle Data, the Association of British Insurers, the Police National Computer, VDI Valuations, Experian Automotive, major UK finance companies, VOSA / DVSA, and the DVLA. We are committed to providing you with the most accurate and up-to-date information, ensuring all reports are provided without prejudice on a Pay-As-You-Go basis for maximum transparency.
          </p>
        </div>
      </div>
    </>
  );
}