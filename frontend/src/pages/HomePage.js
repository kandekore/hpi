import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';
import drkbgd from '../images/drkbgd.jpg';
import flexiblePlansBg from '../images/happyuser.jpg';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Free MOT usage
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const freeMotLeft = Math.max(0, 3 - freeMotChecksUsed);

  // Paid credits
  const motCredits = userProfile?.motCredits ?? 0;
  const totalMot = freeMotLeft + motCredits; // total available MOT checks

  // Valuation credits
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;

  // VDI or HPI credits
  const hasVdiCredits = (userProfile?.hpiCredits ?? 0) > 0;

  const navigate = useNavigate();
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // Registration input
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // Handle MOT
  const handleClickMOT = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg(
        <>
        Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to do a MOT check.
      </> 
      );
      return;
    }
    if (!userProfile) {
      setErrorMsg('Unable to fetch your profile. Please try again later.');
      return;
    }

    if (totalMot > 0) {
      // If user has free or paid MOT credits, go straight to MOT page
      navigate(`/mot?reg=${reg}`);
    } else {
      setErrorMsg(
        'You have no MOT checks remaining. Please purchase credits or wait for more free checks.'
      );
    }
  };

  // Handle Valuation
  const handleClickValuation = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg(
      <>
      Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to do a Valuation check.
    </>);
      return;
    }
    if (!hasValuationCredits) {
      setErrorMsg('You have no Valuation credits left. Please purchase more.');
      return;
    }
    // Directly navigate
    navigate(`/valuation?reg=${reg}`);
  };

  // Handle VDI/HPI
  const handleClickVDI = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg(
        <>
      Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to do a Full Vehicle History check.
    </>
    );
      return;
    }
    if (!hasVdiCredits) {
      setErrorMsg('You have no VDI credits left. Please purchase more.');
      return;
    }
    // Directly navigate
    navigate(`/hpi?reg=${reg}`);
  };

  // Purchase session for buying credits
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      VALUATION: 'VALUATION',
      MOT: 'MOT',
      FULL_HISTORY: 'FULL_HISTORY',
    };
    const creditType = productMap[product] || 'FULL_HISTORY';

    try {
      const { data } = await createSession({ variables: { creditType, quantity }});
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
          <Helmet>
        <title>Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks</title>
        <meta name="description" content="FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />

        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
        <meta property="og:description" content="FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />
        <meta property="og:image" content={drkbgd} />
        <meta property="og:url" content="https://vehicledatainformation.co.uk" />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:title" content="Vehicle Data Information | Valuations & Full Vehicle History | HPI / VDI Type Checks" />
        <meta name="twitter:description" content="FREE MOT History, Vehicle Valuations & Full HPI/VDI style Vehicle History Data — All in One Place" />
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
      `}</style>

      {/* HERO SECTION */}
      <div className="hero section-fullwidth">
        <h1 className="hero-title">Your One-Stop Vehicle Check Location</h1>
        <p className="hero-subtitle">
          FREE MOT History, Vehicle Valuations &amp; Full HPI/VDI style Vehicle History Data
          — All in One Place
        </p>
        <p className="hero-subtitle yellow">Enter Your Registration</p>

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

          <div className="button-group">
            <button className="action-button" onClick={handleClickMOT}>
              Full MOT History
            </button>
            <button className="action-button" onClick={handleClickValuation}>
              Vehicle Valuation
            </button>
            <button className="action-button" onClick={handleClickVDI}>
              Full Vehicle History
            </button>
          </div>

          {/* If there's an error, display it */}
          {errorMsg && (
            <div
              className="alert alert-danger mt-3"
              style={{ maxWidth: '600px', margin: '1rem auto' }}
            >
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* PRICING SECTION */}
      <MainPricing
        isLoggedIn={isLoggedIn}
        hasUsedFreeMOT={freeMotChecksUsed >= 3}
        onPurchase={(product, quantity) => handlePurchase(product, quantity)}
      />

      {/* YELLOW SECTION: "Why do I need to get a vehicle check?" */}
      <div className="why-vehicle-check section-fullwidth">
        <h2>Why Check a Vehicle’s History?</h2>
        <div className="content">
          <p>
            Buying a second-hand car can be tricky—you can’t always tell its past 
            just by looking. Running a vehicle history check helps you avoid 
            nasty surprises and gives you confidence before buying.
          </p>

          <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 3</h4>
                <p className="card-text">vehicles has some hidden history</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">74</h4>
                <p className="card-text">stolen cars are identified daily</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1,771</h4>
                <p className="card-text">insurance write-offs occur each day</p>
              </div>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center mt-3">
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 3</h4>
                <p className="card-text">has outstanding finance</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">£11k</h4>
                <p className="card-text">average finance amount on a car</p>
              </div>
            </div>
            <div className="col">
              <div className="card shadow h-100 text-center p-3">
                <h4 className="card-title mb-2">1 in 16</h4>
                <p className="card-text">shows a mileage discrepancy</p>
              </div>
            </div>
            <p className="small">
              Statistics based on cars checked by HPI® Ltd in 2017.
            </p>
          </div>

          <div>
            <p>
              Whether it’s <strong>outstanding finance</strong>, 
              an <strong>insurance write-off</strong>, or even 
              a <strong>stolen vehicle</strong>, our checks uncover critical 
              details you need to know. We also validate for <strong>mileage anomalies</strong> 
              to ensure you’re not inheriting a car that's already been round the clock. 
            </p>
            <p>
              Make an informed decision with a comprehensive report—because 
              peace of mind is invaluable when you’re spending thousands 
              on a used car.
            </p>
          </div>
        </div>
      </div>

      {/* WHY CHECK WITH US */}
      <div className="why-check-section section-fullwidth">
        <h2 className="why-check-heading">Why Check Your Vehicle With Us?</h2>
        <div className="why-check-items">
          <div className="why-check-card">
            <i className="bi bi-clock-history"></i>
            <h4>Instant Information</h4>
            <p>
              Our streamlined system retrieves your vehicle’s details 
              within seconds, so you’re never left waiting.
            </p>
          </div>
          <div className="why-check-card">
            <i className="bi bi-shield-check"></i>
            <h4>Accurate &amp; Reliable</h4>
            <p>
              We partner with leading data providers to ensure every 
              detail you get is correct and up-to-date.
            </p>
          </div>
          <div className="why-check-card">
            <i className="bi bi-cash-stack"></i>
            <h4>Save Money</h4>
            <p>
              Identify hidden issues or outstanding finance before you buy, 
              preventing expensive surprises down the line.
            </p>
          </div>
        </div>
      </div>

      {/* FLEXIBLE PLANS SECTION */}
      <div className="flexible-plans-section section-fullwidth">
        <div className="flexible-plans-container">
          <div className="flexible-plans-box">
            <h3>Flexible Plans &amp; Extra Features</h3>
            <p>
              We understand that everyone has different needs when it 
              comes to vehicle checks. That's why we offer a range of 
              options, from free MOT checks and quick valuations to 
              more comprehensive Full Vehicle History (HPI or VDI style) reports. You can purchase 
              a single search for peace of mind or opt for a multi-check 
              bundle if you're comparing several cars at once.
            </p>
            <p>
              All historical searches remain stored in your personal 
              dashboard, accessible anytime you log in. Whether you’re 
              confirming service records on a new purchase or revisiting 
              data from months ago, your report details are always at 
              your fingertips.
            </p>
            <p>
              Take advantage of our affordable one-off checks or 
              save with bulk credits—either way, you’ll have reliable 
              vehicle insights whenever you need them.
            </p>
          </div>
        </div>
      </div>

      {/* REPORT TABS SECTION */}
      <div className="report-tabs-section section-fullwidth">
        <h2 className="report-tabs-heading">Our Reports</h2>

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
              Free MOT Check
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
              Simple Valuation
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
              Full Vehicle History
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
            <p>
              Take advantage of up to three <strong>Free MOT Checks</strong> per 
              user! Instantly see past test results, recorded mileages, 
              and advisories to ensure your potential car has been 
              well-maintained.
            </p>
            <ul>
              <li>Up to 3 free checks per account</li>
              <li>View MOT history &amp; mileage records</li>
              <li>Check for recurring advisories</li>
              <li>Identify signs of poor maintenance</li>
            </ul>
          </div>

          {/* Simple Valuation Tab */}
          <div
            className="tab-pane fade"
            id="valuation"
            role="tabpanel"
            aria-labelledby="valuation-tab"
          >
            <p>
              Get a quick market estimate of your car’s value. Our 
              <strong> Vehicle Valuation</strong> tool leverages extensive 
              market data to tell you if the asking price is fair.
            </p>
            <ul>
              <li>Immediate valuation report</li>
              <li>Part Exchange valuations</li>
              <li>Trade valuations</li>
              <li>Auction Valuations</li>
              <li>Up-to-date pricing from real market data</li>
              <li>Avoid overpaying for your next car</li>
            </ul>
          </div>

          {/* Full VDI Check Tab */}
          <div
            className="tab-pane fade"
            id="vdi"
            role="tabpanel"
            aria-labelledby="vdi-tab"
          >
            <p>
              Our most comprehensive offering, the <strong>Full Vehicle Data History </strong> check, 
              uncovers all aspects of a vehicle’s past — from outstanding finance 
              and theft records to plate changes, keeper history, technical 
              specs, and more, just like a HPI check. 
            </p>
            <ul>
              <li>Finance checks &amp; stolen vehicle status</li>
              <li>Insurance write-offs, import/export info</li>
              <li>Mileage verification &amp; VIN match</li>
              <li>Plate transfers &amp; keeper change history</li>
              <li>Technical data &amp; emissions standards</li>
            </ul>
            <p>
              This all-in-one check is perfect for absolute peace of mind 
              before making your purchase.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="faq-section section-fullwidth" id="faqs">
        <h2 className="faq-heading">Frequently Asked Questions</h2>
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
                    Absolutely! Hidden issues like outstanding finance, stolen 
                    status, or incorrect mileage can cost you thousands. A quick 
                    check can prevent losing your money or ending up with a 
                    vehicle that’s unsafe.
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
                  How accurate are your valuations and reports?
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
                    We pull data from multiple top-tier providers, ensuring your 
                    vehicle’s records are accurate and up-to-date. Our valuation 
                    tool references real market data, so you know exactly where 
                    your car stands.
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
                  What if I need more than one check?
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
                    We offer multi-check options at discounted rates, perfect if 
                    you’re considering several cars at once. Simply purchase 
                    a bundle of checks and apply them when you need.
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
            All <strong>Vehicle Data Information</strong> reports are built using secure data from leading sources, including UK Vehicle Data, the Association of British Insurers, the Police National Computer, VDI Valuations, Experian Automotive, major UK finance companies, VOSA / DVSA, and the DVLA. All reports are provided without prejudice on a PAYG basis
          </p>
        </div>
      </div>
    </>
  );
}
