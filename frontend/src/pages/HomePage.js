import React, { useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReCAPTCHA from 'react-google-recaptcha';

// GraphQL
import { GET_USER_PROFILE, PUBLIC_VEHICLE_PREVIEW } from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';

// Components
import AuthTabs from '../components/AuthTabs';
import MainPricing from '../components/MainPricing';

// Images
import drkbgd from '../images/drkbgd.jpg';
import flexiblePlansBg from '../images/happyuser.jpg';

export default function HomePage() {
  const navigate = useNavigate();

  // ========== 1) Local States ==========
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [partialData, setPartialData] = useState(null);

  // For reCAPTCHA modal if not logged in
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Which search type user clicked: 'MOT', 'VALUATION', 'FULL_HISTORY'
  const [searchType, setSearchType] = useState(null);

  // ========== 2) Get user profile ==========
  const { data: profileData, loading: profileLoading, refetch } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Quick checks for usage
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
  const motCredits = userProfile?.motCredits ?? 0;
  const totalMot = freeMotLeft + motCredits;
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;
  const hasVdiCredits = (userProfile?.hpiCredits ?? 0) > 0;

  // ========== 3) Partial query for publicVehiclePreview ==========
  const [fetchPublicPreview, { loading: publicLoading, error: publicError }] =
    useLazyQuery(PUBLIC_VEHICLE_PREVIEW, {
      onCompleted: (data) => {
        setPartialData(data.publicVehiclePreview);
      },
    });

  // ========== 4) Create purchase session (Stripe) ==========
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // ========== 5) Handle input changes ==========
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
    setPartialData(null);
    setErrorMsg('');
  };

  // ========== 6) If user is logged in, go to the appropriate page (MOT / VALUATION / etc.) ==========
  // NOTE: We add a second argument newProfile so that if we just fetched a new profile
  // in handleAuthSuccess, we can pass it here. Otherwise, fallback to the existing userProfile.
  const handleLoggedInSearch = (type, newProfile) => {
    setErrorMsg('');

    const profileToUse = newProfile || userProfile;
    if (!profileToUse) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    const freeMotChecksUsed = profileToUse.freeMotChecksUsed ?? 0;
    const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);
    const motCredits = profileToUse.motCredits ?? 0;
    const totalMot = freeMotLeft + motCredits;
    const hasValuationCredits = (profileToUse?.valuationCredits ?? 0) > 0;
    const hasVdiCredits = (profileToUse?.hpiCredits ?? 0) > 0;

    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }

    switch (type) {
      case 'MOT':
        if (totalMot > 0) {
          // They have MOT credits => go to /mot
          navigate(`/mot?reg=${reg}`);
        } else {
          setErrorMsg('You have no MOT checks remaining. Please purchase more credits.');
        }
        break;

      case 'VALUATION':
        if (hasValuationCredits) {
          navigate(`/valuation?reg=${reg}`);
        } else {
          setErrorMsg('You have no Valuation credits left. Please purchase more.');
        }
        break;

      case 'FULL_HISTORY':
        if (hasVdiCredits) {
          navigate(`/hpi?reg=${reg}`);
        } else {
          setErrorMsg('You have no Full Vehicle History credits left. Please purchase more.');
        }
        break;

      default:
        break;
    }
  };

  // ========== 7) If NOT logged in => partial check via reCAPTCHA ==========
  const handlePublicSearch = (type) => {
    setErrorMsg('');
    setSearchType(type); // store which button they clicked
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    setShowCaptchaModal(true); // open reCAPTCHA modal
  };

  // ========== 8) reCAPTCHA success => run fetchPublicPreview ==========
  const handleCaptchaSuccess = async (token) => {
    setShowCaptchaModal(false);
    setCaptchaToken(token);
    setErrorMsg('');

    try {
      await fetchPublicPreview({
        variables: { reg, captchaToken: token },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  // ========== 9) The main "click" handlers for each search button ==========
  const handleClickMOT = () => {
    if (isLoggedIn) {
      handleLoggedInSearch('MOT');
    } else {
      handlePublicSearch('MOT');
    }
  };

  const handleClickValuation = () => {
    if (isLoggedIn) {
      handleLoggedInSearch('VALUATION');
    } else {
      handlePublicSearch('VALUATION');
    }
  };

  const handleClickVDI = () => {
    if (isLoggedIn) {
      handleLoggedInSearch('FULL_HISTORY');
    } else {
      handlePublicSearch('FULL_HISTORY');
    }
  };

  // ========== 10) If user logs in => do the "full" search after refetch ==========
  // Compare to MOTPage's handleAuthSuccess: we refetch, then pass the newProfile forward.
  const handleAuthSuccess = () => {
    refetch().then((result) => {
      const newProfile = result.data?.getUserProfile;
      if (!newProfile) {
        setErrorMsg('No user profile found after login');
        return;
      }
      // The user just logged in, so let's continue whichever search they tried.
      // e.g. if they had clicked "MOT" but were forced to log in, we now do the full search:
      if (searchType) {
        handleLoggedInSearch(searchType, newProfile);
      }
    });
  };

  // ========== 11) Purchasing credits from the pricing table ==========
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      VALUATION: 'VALUATION',
      MOT: 'MOT',
      FULL_HISTORY: 'FULL_HISTORY',
    };
    const creditType = productMap[product] || 'FULL_HISTORY';
    try {
      const { data } = await createSession({ variables: { creditType, quantity } });
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession; // Redirect to Stripe
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks</title>
        <meta
          name="description"
          content="Unlock a vehicle's full story with Vehicle Data Information. Get instant HPI checks, accurate car valuations, and free MOT history to buy or sell with confidence in the UK."
        />
        <meta property="og:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
        <meta
          property="og:description"
          content="Unlock a vehicle's full story with Vehicle Data Information. Get instant HPI checks, accurate car valuations, and free MOT history to buy or sell with confidence in the UK."
        />
        <meta property="og:image" content={drkbgd} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
        <meta
          name="twitter:description"
          content="Unlock a vehicle's full story with Vehicle Data Information. Get instant HPI checks, accurate car valuations, and free MOT history to buy or sell with confidence in the UK."
        />
        <meta name="twitter:image" content={drkbgd} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', sans-serif;
        }
        .section-fullwidth {
          width: 100%;
        }
        /* HERO SECTION */
        .hero {
          background: url(${drkbgd}) center top no-repeat;
          background-size: cover;
          padding: 3rem 1rem;
          color: #fff;
          text-align: center;
        }
        .hero-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-shadow: 2px 2px #003366;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          font-weight: 600;
          text-shadow: 1px 1px #003366;
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
        .button-group {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .action-button {
          background-color: #1560bd;
          color: #fff;
          font-weight: 600;
          border: #fff solid 2px;
          border-radius: 25px;
          padding: 10px 25px;
          cursor: pointer;
          font-size: 1.1rem;
          width: 240px; 
          text-align: center;
        }
        .action-button:hover {
          background-color: #0d4f9c;
        }
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .plate-container {
            width: 100%;
            height: 120px;
            margin: 2rem auto;
          }
          .plate-blue {
            width: 80px;
            font-size: 2rem;
          }
          .plate-input {
            font-size: 3.5rem;
            padding-left: 5%;
          }
          .action-button {
            width: 100% !important; 
            margin: 0 auto;
          }
        }
        .why-check-section {
          background: #f4f4f4;
          padding: 4rem 1rem;
        }
        .why-check-heading {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          font-weight: 700;
        }
        .why-check-items {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
        }
        .why-check-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          padding: 2rem;
          flex: 1 1 300px;
          max-width: 350px;
          text-align: center;
        }
        .why-check-card i {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #1560bd;
        }
        .why-vehicle-check {
          background-color: #FFDE46;
          padding: 3rem 1rem;
        }
        .why-vehicle-check h2 {
          text-align: center;
          font-weight: 700;
          margin-bottom: 2rem;
        }
        .why-vehicle-check .content {
          max-width: 1100px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .why-vehicle-check ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .why-vehicle-check li {
          margin-bottom: 0.5rem;
        }
        .flexible-plans-section {
          background: url(${flexiblePlansBg}) center center no-repeat;
          background-size: cover;
          min-height: 350px;
          padding: 3rem 1rem;
          position: relative;
          display: flex;
          align-items: center; 
        }
        .flexible-plans-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .flexible-plans-box {
          background: #003366;
          color: #fff;
          padding: 2rem;
          border-radius: 50px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 550px;
          border: #fff solid 5px;
        }
        .flexible-plans-box h3 {
          margin-top: 0;
          font-weight: 700;
        }
        .report-tabs-section {
          background: #fff;
          padding: 4rem 1rem;
        }
        .report-tabs-heading {
          font-size: 2rem;
          margin-bottom: 3rem;
          text-align: center;
          font-weight: 700;
        }
        .nav-tabs .nav-link {
          border: none;
          border-radius: 0;
          color: #666;
        }
        .nav-tabs .nav-link.active {
          color: #1560bd;
          border-bottom: 2px solid #1560bd;
        }
        .tab-content .tab-pane {
          margin-top: 2rem;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
        .faq-section {
          background: #f9f9f9;
          padding: 4rem 1rem;
        }
        .faq-heading {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          font-weight: 700;
        }
        .accordion-button:focus {
          box-shadow: none;
        }
        .vdi-brand-section {
          background: #fff;
          padding: 3rem 1rem;
        }
        .vdi-brand-content {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
          font-size: 1rem;
          line-height: 1.6;
        }
        ul#myTab {
          font-size: x-large;
          font-weight: 600;
        }
        .yellow {
          color: #ffde45;
          text-shadow: 1px 1px #000;
          margin-bottom: -15px;
        }
          p.hero-subtitle.yellow {
    margin-bottom: 25px;
}
      `}</style>

      {/* reCAPTCHA modal for partial data */}
      {showCaptchaModal && !isLoggedIn && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="modal-header">
                <h5 className="modal-title justify-content-center">Verify You're Human</h5>
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

      {/* HERO SECTION */}
      <div className="hero section-fullwidth">
        <h1 className="hero-title">Unlock Your Vehicle's Full Story: HPI Checks, Car Valuations & MOT History</h1>
        <p className="hero-subtitle">
          Your essential partner for accurate **vehicle data**, **car valuations**, and comprehensive **HPI checks** in the UK. Make informed decisions whether you're buying, selling, or just curious.
        </p>
        <p className="hero-subtitle yellow">Enter Your Registration for Instant Results</p>

        <div style={{ maxWidth: '1200px', margin: '-30px auto' }}>
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              type="text"
              className="plate-input"
              placeholder="AB12 CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          <p className="hero-subtitle yellow">Choose a Search Type</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '50px'}}>
            <button className="action-button" onClick={handleClickMOT}>
              Free MOT History Check
            </button>
            <button className="action-button" onClick={handleClickValuation}>
              Accurate Vehicle Valuation
            </button>
            <button className="action-button" onClick={handleClickVDI}>
              Comprehensive HPI Check
            </button>
          </div>

          {errorMsg && (
            <div
              className="alert alert-danger mt-3"
              style={{ maxWidth: '600px', margin: '1rem auto' }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        {/* If partial data is found, user not logged in => show teaser + AuthTabs in the hero */}
        {partialData && !isLoggedIn && partialData.found && (
          <div
            className="alert alert-info mt-3"
            style={{
              maxWidth: '600px',
              margin: '2rem auto 0 auto',
              border: '3px solid #003366',
              borderRadius: 25,
              padding: '1rem',
              background: '#fff',
              color: '#003366',
              textAlign: 'center',
            }}
          >
            <h5>Vehicle Found!</h5>
            {partialData.imageUrl && (
              <img
                src={partialData.imageUrl}
                alt="Car"
                style={{ maxWidth: '100%', marginBottom: '1rem' }}
              />
            )}
            <p style={{ fontSize: '1.1rem' }}>
              <strong>
                {partialData.colour} {partialData.make}
                {partialData.year && ` from ${partialData.year}`}
              </strong>
            </p>
            <p>
              Please Register or Login below to unlock a {searchType === 'MOT'
                ? 'Full MOT History'
                : searchType === 'VALUATION'
                ? 'Vehicle Valuation'
                : 'Full Vehicle History'}{' '}
              check!
            </p>
            <AuthTabs onAuthSuccess={handleAuthSuccess} />
          </div>
        )}

        {partialData && !isLoggedIn && !partialData.found && (
          <div
            className="alert alert-warning"
            style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}
          >
            {partialData.message || 'No data found for this registration.'}
          </div>
        )}
      </div>
      {/* PRICING SECTION */}
      <MainPricing
        isLoggedIn={isLoggedIn}
        hasUsedFreeMOT={freeMotChecksUsed >= 3}
        onPurchase={(product, quantity) => handlePurchase(product, quantity)}
      />

      {/* YELLOW SECTION: "Why do I need to get a vehicle check?" */}
      <div className="why-vehicle-check section-fullwidth">
        <h2>Why is a Vehicle History Check So Important?</h2>
        <div className="content">
          <p>
            Buying a used car or van can be an exciting prospect, but it also comes with inherent risks. Unlike a new vehicle, a second-hand car carries a past – a history that can significantly impact its safety, reliability, and true market **car value**. Without a thorough **vehicle data** check, you might unwittingly inherit costly problems, legal liabilities, or even a vehicle that isn't safe for the road. At Vehicle Data Information, we empower you to see beyond the showroom shine and uncover the full story.
          </p>
          <p>
            Every day, numerous vehicles are sold with hidden issues. Our comprehensive checks are designed to reveal these critical details, protecting your investment and providing invaluable peace of mind. Consider these compelling statistics:
          </p>

          <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 3</h4>
                <p className="card-text">vehicles has some **hidden history** – don't let it be yours!</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">74</h4>
                <p className="card-text">**stolen cars** are identified daily, risking confiscation without compensation.</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1,771</h4>
                <p className="card-text">**insurance write-offs** occur each day, impacting safety and resale value.</p>
              </div>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center mt-3">
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 3</h4>
                <p className="card-text">has **outstanding finance**, which could transfer to you.</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">£11k</h4>
                <p className="card-text">is the **average finance amount** on a car – a debt you could inherit!</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 16</h4>
                <p className="card-text">shows a **mileage discrepancy**, indicating potential fraud.</p>
              </div>
            </div>
            <p className="small">
              Statistics based on cars checked by HPI® Ltd in 2017. Current figures may vary but the risks remain.
            </p>
          </div>

          <div>
            <p>
              These statistics highlight the very real dangers of buying a used vehicle without a thorough **car history report**. Whether it’s an **outstanding finance** agreement still attached to the vehicle, a record as an **insurance write-off** (which can affect its safety and future insurability), or even if it's a **stolen vehicle** that the police could seize at any time, our checks provide crucial insights. We also meticulously validate for **mileage anomalies** to ensure you’re not inheriting a car that's already been driven far more than its odometer suggests.
            </p>
            <p>
              A **full vehicle history** check, akin to a **HPI check DVLA** or **HPI check AA** standard, is your shield against unexpected expenses and serious liabilities. Make an informed decision with a comprehensive **HPI report** – because **peace of mind is invaluable** when you’re investing thousands in a used car, van, or even a **motorcycle HPI check**.
            </p>
          </div>
        </div>
      </div>

      {/* WHY CHECK WITH US */}
      <div className="why-check-section section-fullwidth">
        <h2 className="why-check-heading">Why Choose Vehicle Data Information for Your Vehicle Check?</h2>
        <div className="why-check-items">
          <div className="why-check-card">
            <i className="bi bi-clock-history"></i>
            <h4>Instant, Reliable Information</h4>
            <p>
              Our streamlined system retrieves your vehicle’s details, from **MOT history** to **full vehicle history** data, within seconds. You'll never be left waiting, getting the vital information you need exactly when you need it for swift decision-making.
            </p>
          </div>
          <div className="why-check-card">
            <i className="bi bi-shield-check"></i>
            <h4>Accurate &amp; Trustworthy Data</h4>
            <p>
              We pride ourselves on partnering with leading industry data providers, including official sources and major finance houses. This ensures that every detail you receive is **accurate, reliable**, and up-to-date, offering you genuine assurance in your vehicle purchase.
            </p>
          </div>
          <div className="why-check-card">
            <i className="bi bi-cash-stack"></i>
            <h4>Significant Cost Savings & Peace of Mind</h4>
            <p>
              Identifying hidden issues like **outstanding finance on a car**, an undeclared write-off, or mileage discrepancies **before you buy** can save you thousands in unexpected repairs or financial liabilities. Our **cheap HPI check** helps you prevent expensive surprises down the line, ensuring you invest wisely.
            </p>
          </div>
        </div>
      </div>

      {/* FLEXIBLE PLANS SECTION */}
      <div className="flexible-plans-section section-fullwidth">
        <div className="flexible-plans-container">
          <div className="flexible-plans-box">
            <h3>Flexible Plans &amp; Comprehensive Features</h3>
            <p>
              At Vehicle Data Information, we understand that every individual has unique needs when it comes to **vehicle checks**. That's why we offer a diverse range of flexible options tailored to suit various requirements and budgets. Whether you're a casual buyer, a dedicated enthusiast, or a dealer, our services are designed to provide maximum value and convenience.
            </p>
            <p>
              From our invaluable **free MOT checks** and swift **car value lookup** tools to our most thorough **Full Vehicle History (HPI or VDI style)** reports, we've got you covered. You have the flexibility to purchase a **single search** for immediate peace of mind on a specific vehicle or opt for a cost-effective **multi-check bundle** if you're actively comparing several cars at once. This makes checking multiple vehicles, whether it’s a **car valuation** or a full **HPI car check**, more affordable and efficient.
            </p>
            <p>
              What's more, all your historical searches and detailed reports remain securely stored within your personal dashboard. This means your data is always at your fingertips, accessible anytime you log in. Whether you’re confirming past service records on a new purchase, revisiting detailed **car history reports** from months ago, or just tracking your own vehicle's journey, your report details are permanently available for review. Take advantage of our affordable one-off checks or save substantially with our bulk credits—either way, you’ll have reliable **vehicle data** whenever you need it most.
            </p>
          </div>
        </div>
      </div>

      {/* REPORT TABS SECTION */}
      <div className="report-tabs-section section-fullwidth">
        <h2 className="report-tabs-heading">Our Comprehensive Vehicle Data Reports</h2>

        <ul className="nav nav-tabs justify-content-center" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="mot-tab"
              data-bs-toggle="tab"
              data-bs-target="#mot"
              type="button"
              role="tab"
              aria-controls="mot"
              aria-selected="true"
            >
              Free MOT History Check
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="valuation-tab"
              data-bs-toggle="tab"
              data-bs-target="#valuation"
              type="button"
              role="tab"
              aria-controls="valuation"
              aria-selected="false"
            >
              Accurate Vehicle Valuation
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="vdi-tab"
              data-bs-toggle="tab"
              data-bs-target="#vdi"
              type="button"
              role="tab"
              aria-controls="vdi"
              aria-selected="false"
            >
              Full Vehicle History (HPI)
            </button>
          </li>
        </ul>

        <div className="tab-content" id="myTabContent">
          {/* Free MOT Tab */}
          <div
            className="tab-pane fade show active"
            id="mot"
            role="tabpanel"
            aria-labelledby="mot-tab"
          >
            <h3>Discover Your Vehicle's Maintenance Journey with a Free MOT History Check</h3>
            <p>
              Take advantage of up to three **Free MOT Checks** per user! Our MOT History Check service provides instant, detailed insights into a vehicle's annual roadworthiness tests. This is a critical tool for understanding how well a car, van, or even a motorcycle has been maintained. By simply entering the registration number, you can instantly see all past test results, accurately recorded mileages at the time of each test, and crucial advisory notes. These advisories highlight minor defects that aren't severe enough for an immediate fail but indicate areas that may soon require attention, such as worn tyres or minor corrosion.
            </p>
            <p>
              Understanding the full MOT history allows you to:
            </p>
            <ul>
              <li>View comprehensive pass, fail, and partial pass results from every test.</li>
              <li>Analyze accurate **mileage records** over time, crucial for identifying potential "clocking" or mileage discrepancies.</li>
              <li>Spot recurring advisories or issues that suggest chronic problems or a lack of proper maintenance.</li>
              <li>Assess the vehicle's general roadworthiness and safety standards.</li>
              <li>Gain peace of mind regarding the vehicle's structural and mechanical integrity, vital before purchase.</li>
            </ul>
            <p>
              This invaluable free service helps you identify signs of poor maintenance and ensure your potential next car has been well-cared for, protecting you from unexpected repair costs down the line.
            </p>
            <p><Link to="/mot">Learn more about our Free MOT History Check here.</Link></p>
          </div>

          {/* Simple Valuation Tab */}
          <div
            className="tab-pane fade"
            id="valuation"
            role="tabpanel"
            aria-labelledby="valuation-tab"
          >
            <h3>Get an Accurate Car Valuation: Understand Your Vehicle's True Market Worth</h3>
            <p>
              Whether you're looking to sell, buy, or trade-in, knowing the precise **market value of my car** is essential. Our **Vehicle Valuation** tool provides an immediate, reliable **car value estimator** by leveraging extensive, real-time market data. We draw insights from thousands of recent sales, dealer listings, and auction results across the UK, giving you an honest and up-to-date appraisal. This helps you avoid overpaying for your next vehicle or underselling your current one.
            </p>
            <p>
              Our comprehensive **car appraisal online** provides:
            </p>
            <ul>
              <li>An **immediate valuation report** showing realistic price ranges.</li>
              <li>Estimates for both **private sale value** and **trade-in value car** (part exchange valuations).</li>
              <li>Access to up-to-date pricing directly from real market data, not just theoretical figures.</li>
              <li>Specific valuations for cars, **value my van**, and even motorbikes.</li>
              <li>Insights that empower you to negotiate confidently, ensuring you get a fair deal.</li>
            </ul>
            <p>
              Don't just rely on general assumptions or basic price guides like **Parkers car valuation** or **Motorway car valuation**. Our tool offers a tailored **car estimate** based on your specific vehicle's details and current market trends, ensuring you get the most accurate **car price check** possible.
            </p>
            <p><Link to="/valuation">Find out how much your vehicle is worth with our Accurate Car Valuation service.</Link></p>
          </div>

          {/* Full VDI Check Tab */}
          <div
            className="tab-pane fade"
            id="vdi"
            role="tabpanel"
            aria-labelledby="vdi-tab"
          >
            <h3>Full Vehicle History (HPI) Check: Uncover Every Hidden Detail</h3>
            <p>
              Our most comprehensive offering, the **Full Vehicle History** check – often referred to as a **HPI check** or **VDI check** – is your absolute must-have before purchasing any used vehicle. This in-depth **HPI report** uncovers every aspect of a vehicle’s past, protecting you from significant financial and legal risks. We meticulously cross-reference data from the DVLA, Police National Computer, major UK finance companies, and insurance databases to give you a complete picture.
            </p>
            <p>
              Our **comprehensive HPI check** includes crucial insights such as:
            </p>
            <ul>
              <li>**Finance checks**: Confirm if the vehicle has any **outstanding finance on a car** that could transfer to you, ensuring an **HPI clear** status.</li>
              <li>**Stolen vehicle status**: Verify if the vehicle is recorded as stolen, preventing its confiscation by police without compensation.</li>
              <li>**Insurance write-offs**: Detailed information on any insurance write-off categories (Cat A, B, S, N) and significant accident damage.</li>
              <li>**Mileage verification**: Identify **mileage discrepancies** or signs of "clocking" by cross-referencing official records.</li>
              <li>**Plate transfers & keeper history**: Track all previous number plate changes and the full history of registered keepers.</li>
              <li>**Import/export information**: Confirm if the vehicle was legally imported or exported.</li>
              <li>**VIN match**: Verify the Vehicle Identification Number (VIN) to ensure it matches official records.</li>
              <li>**Technical data & emissions standards**: Comprehensive vehicle specifications.</li>
            </ul>
            <p>
              This **all-in-one check** provides ultimate peace of mind, allowing you to **check a car's history** thoroughly and confidently before making your purchase. Don't risk buying blind – choose the **best HPI check** for complete transparency.
            </p>
            <p><Link to="/hpi">Explore our Full Vehicle History (HPI) Check service for ultimate peace of mind.</Link></p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="faq-section section-fullwidth" id="faqs">
        <h2 className="faq-heading">Frequently Asked Questions About Vehicle Checks</h2>
        <div className="container">
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="faqOne">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="false"
                  aria-controls="collapseOne"
                >
                  Do I really need to check a used car before buying?
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse"
                aria-labelledby="faqOne"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  <p>
                    Absolutely! Performing a **vehicle data** check is paramount when considering a used car, van, or motorbike. Hidden issues like **outstanding finance**, stolen status, significant accident damage (insurance write-offs), or incorrect mileage can cost you thousands of pounds in unforeseen expenses or legal complications. A quick, comprehensive **HPI check** or **car history report** can expose these problems, preventing you from losing your hard-earned money or ending up with a vehicle that’s unsafe or has legal liabilities. It's a small investment for massive peace of mind.
                  </p>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqTwo">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  How accurate are your vehicle valuations and history reports?
                </button>
              </h2>
              <div
                id="collapseTwo"
                className="accordion-collapse collapse"
                aria-labelledby="faqTwo"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  <p>
                    We pride ourselves on the accuracy and reliability of all our reports. Our systems pull **vehicle data** from multiple top-tier and official providers, including the DVLA, Police National Computer, major UK finance companies, and leading automotive data sources. This ensures that your vehicle’s records, whether it’s a **car valuation online** or a full **HPI report**, are current, comprehensive, and dependable. Our **car value estimator** specifically references **real market data** and recent sales, so you know exactly where your car stands in today's market, giving you a trustworthy **car price check**.
                  </p>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqThree">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  What if I need more than one vehicle check?
                </button>
              </h2>
              <div
                id="collapseThree"
                className="accordion-collapse collapse"
                aria-labelledby="faqThree"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  <p>
                    We understand that when you're in the market for a used vehicle, you might be considering several options. That's why we offer convenient and cost-effective multi-check bundles at discounted rates. This is perfect if you’re comparing several cars, vans, or motorbikes at once. Simply purchase a bundle of credits and apply them to **check a car's history**, get a **car value estimator**, or perform an **HPI check** on different vehicles as and when you need. All your purchased credits are stored in your account, ready for use, and your past reports are always accessible in your personal dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqFour">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFour"
                  aria-expanded="false"
                  aria-controls="collapseFour"
                >
                  How do your services compare to others like HPI Check AA or Motorway Car Valuation?
                </button>
              </h2>
              <div
                id="collapseFour"
                className="accordion-collapse collapse"
                aria-labelledby="faqFour"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  <p>
                    Vehicle Data Information strives to provide a comprehensive and user-friendly experience that often surpasses competitors. Our **HPI check** offers the same core data points as prominent services like **HPI Check AA** or those provided through **HPI Check Gov** sources, including crucial finance and stolen vehicle checks, but often at a more competitive price point for a **cheap HPI check**. For valuations, our **car value estimator** aggregates data from a wider array of sources than solely focusing on platforms like **Motorway car valuation** or **Parkers car valuation**, giving you a more rounded and accurate **market value of my car**. We also offer unique benefits like up to three **free MOT history checks** and a convenient dashboard to store all your **car history reports**, ensuring you have all your essential **vehicle data** in one accessible place.
                  </p>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqFive">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFive"
                  aria-expanded="false"
                  aria-controls="collapseFive"
                >
                  What is an 'HPI Clear' check and why is it important?
                </button>
              </h2>
              <div
                id="collapseFive"
                className="accordion-collapse collapse"
                aria-labelledby="faqFive"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  <p>
                    An '**HPI clear**' check indicates that a vehicle has no adverse history recorded on the HPI database concerning outstanding finance, stolen status, or being written off by an insurance company. This status is incredibly important as it signifies a clean record, meaning you can proceed with confidence, knowing the vehicle is not subject to hidden debts or legal complications. If a vehicle isn't HPI clear, it could mean you might lose the vehicle if finance is outstanding, or that it's been in a serious accident. Always aim for an **HPI clear check** to protect your investment and ensure legal ownership.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM BRAND MENTION */}
      <div className="vdi-brand-section section-fullwidth">
        <div className="vdi-brand-content">
          <p>
            At **Vehicle Data Information**, we are committed to providing you with the most reliable and comprehensive insights into any UK vehicle. All our **vehicle data** reports are meticulously built using secure, real-time information from leading and authoritative sources, including:
            **UK Vehicle Data, the Association of British Insurers, the Police National Computer, VDI Valuations, Experian Automotive, major UK finance companies, VOSA / DVSA, and the DVLA**. We ensure you receive accurate and up-to-date information to empower your decisions. All reports are provided without prejudice on a Pay-As-You-Go basis, offering transparency and flexibility.
          </p>
        </div>
      </div>
    </>
  );
}
