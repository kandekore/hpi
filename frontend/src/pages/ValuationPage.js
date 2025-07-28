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
        <title>Accurate Car Valuation Online UK | Vehicle Price Check & Estimator</title>
        <meta name="description" content="Get an instant, accurate car valuation online for any UK car, van, or motorbike. Discover private sale, trade-in value, and compare market prices with our reliable vehicle price estimator." />
    
        {/* Open Graph tags */}
        <meta property="og:title" content="Accurate Car Valuation Online UK | Vehicle Price Check & Estimator" />
        <meta property="og:description" content="Get an instant, accurate car valuation online for any UK car, van, or motorbike. Discover private sale, trade-in value, and compare market prices with our reliable vehicle price estimator." />
        <meta property="og:image" content={heroBg} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk/valuation" />
        <meta property="og:type" content="website" />
    
        {/* Twitter */}
        <meta name="twitter:title" content="Accurate Car Valuation Online UK | Vehicle Price Check & Estimator" />
        <meta name="twitter:description" content="Get an instant, accurate car valuation online for any UK car, van, or motorbike. Discover private sale, trade-in value, and compare market prices with our reliable vehicle price estimator." />
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
        <h1>Accurate Car Valuation Online: Discover Your Vehicle's True Market Value</h1>
        <p>
          Get an instant estimate of your vehicle’s market value whether you’re looking to buy, sell, or trade-in. Our vehicle valuation tool analyzes current market data to give you a realistic price range for your car or van.
        </p>

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
                Get Another Valuation
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
                {valLoading || publicLoading ? 'Calculating...' : 'Get Instant Valuation'}
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

      {/* Additional Info / Content Sections */}
      <div className="content-section">
        <h2>Why an Accurate Vehicle Valuation is Your Essential Guide</h2>
        <p>
          Whether you're planning to buy your dream car, sell your current one, or looking to value your trade in, understanding a vehicle's true market value is absolutely crucial. The automotive market is dynamic, and relying on guesswork or outdated information can lead to significant financial loss. Our accurate car valuation online tool empowers you with the knowledge to make smart, confident financial decisions.
        </p>
        <p>
          Don't get caught out by overpaying for a purchase or underselling your own vehicle. Our car value estimator provides a realistic car price check based on the very latest market data.
        </p>

        <h3>How Our Vehicle Valuation Tool Empowers You:</h3>
        <div className="key-points">
            <div className="key-point-card">
                <i className="bi bi-tag"></i>
                <h4>Set the Right Price for Selling</h4>
                <p>If you want to price my car for a private sale, our car appraisal online helps you set a competitive and attractive price, drawing serious buyers and preventing you from underselling. Get an independent car estimate that truly reflects its worth.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-cart-check"></i>
                <h4>Avoid Overpaying When Buying</h4>
                <p>Use our car value lookup to verify if the asking price of a vehicle you're interested in aligns with its true car value. This is your essential guide to smart negotiation and ensures you're getting a fair deal.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-arrow-left-right"></i>
                <h4>Negotiate Your Trade-In Value</h4>
                <p>Curious about the trade in value car at a dealership? Get an independent vehicle trade in value estimate from us to ensure you're receiving a fair offer and not leaving money on the table. This is especially useful for a motorway car valuation or comparing against offers like "we buy any car valuation".</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-cash-coin"></i>
                <h4>Financial Planning & Insurance</h4>
                <p>Accurate car valuations are often necessary for insurance policies, refinancing existing loans, or simply for personal financial planning. Our tool provides a reliable car price calculator for these needs.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-calendar-range"></i>
                <h4>Assess the Value of Older Cars</h4>
                <p>Even if you're looking for an old car valuation, our system can provide relevant insights into its current market standing, helping you understand its residual car value.</p>
            </div>
            <div className="key-point-card">
                <i className="bi bi-truck"></i>
                <h4>Valuations for All Vehicle Types</h4>
                <p>Our comprehensive car value estimator isn't just for cars. Easily value my van or get an accurate market price for your motorbike, providing versatile used car values across different vehicle categories.</p>
            </div>
        </div>

        <h3>Our Advanced Valuation Methodology: Data-Driven Accuracy</h3>
        <p>
          Our car valuation online service goes beyond basic assumptions. We employ a sophisticated algorithm that meticulously processes vast amounts of real-time vehicle data from a multitude of reliable sources, ensuring you receive the most accurate car estimate possible.
        </p>
        <ul>
            <li>Recent Sales Data: Analyzing thousands of actual vehicle transactions across the UK to understand what cars are genuinely selling for.</li>
            <li>Dealer Listings & Auction Results: Cross-referencing current prices from reputable dealerships and incorporating the dynamic pricing from live automotive auctions.</li>
            <li>Industry Trends: Factoring in seasonal demand, fuel price impacts, economic shifts, and broader market sentiment.</li>
            <li>Vehicle Specifics: Considering key attributes like the vehicle's exact make, model, trim level, engine size, age, mileage, overall condition, and valuable optional extras.</li>
        </ul>
        <p>
          This comprehensive, data-driven approach ensures our used car valuation tool provides a highly reliable car value check, whether you’re looking for a quick car valuation online or a detailed analysis comparable to Parkers car valuation or Motorway car valuation standards. You can confidently check my car value knowing it's based on the market's pulse.
        </p>

        <div className="cta-box">
            <p>Ready to discover your vehicle's true worth?</p>
            <p>Get your instant, accurate car valuation today!</p>
            <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Get My Car Valuation</a>
        </div>

        <h3>Combine Your Valuation with a Full Vehicle History Check</h3>
        <p>
          While our vehicle valuation provides insight into a vehicle's monetary worth, understanding its full history is equally important for a truly informed decision. We highly recommend complementing your car valuation with a comprehensive HPI check.
        </p>
        <ul>
            <li>An HPI car valuation is not just about price; it's about validating that value. A vehicle free from outstanding finance, stolen records, or undeclared accident damage (an HPI clear status) will inherently command a higher and more secure market price.</li>
            <li>Our full HPI report can uncover hidden issues that drastically reduce a vehicle's true worth, regardless of its initial estimated value.</li>
        </ul>
        <p>
          By getting both an accurate car valuation by registration number and a full HPI check, you gain the ultimate peace of mind, ensuring both the financial and historical integrity of your prospective purchase or sale.
        </p>
      </div>

      {/* BOTTOM BRAND MENTION */}
      <div className="valuation-info-section"> {/* Reusing this class for general styling */}
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p>
            All Vehicle Data Information reports, including our instant vehicle valuation estimates, are generated using secure, real-time data from leading industry sources. This includes market data provided by VDI Valuations, Experian Automotive, and other extensive sales and listings databases, ensuring the vehicle data you receive is accurate, current, and reliable. We are committed to providing you with transparent and comprehensive insights to empower your decisions. All reports are provided without prejudice on a Pay-As-You-Go basis, offering transparency and flexibility.
          </p>
        </div>
      </div>
    </>
  );
}