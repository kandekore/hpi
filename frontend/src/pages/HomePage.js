import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';
import drkbgd from '../images/drkbgd.jpg';

// This is the *new* background image for our flexible plans section.
// Replace 'flexible_plans_bg.jpg' with your actual file if needed:
import flexiblePlansBg from '../images/happyuser.jpg'; // '../images/flexible_plans_bg.jpg';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // MOT checks
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const hasFreeMotLeft = freeMotChecksUsed < 3;

  // Valuation credits
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;

  // VDI or HPI credits
  const hasVdiCredits = (userProfile?.hpiCredits ?? 0) > 0;

  const navigate = useNavigate();

  // Registration input
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // Handle MOT check
  const handleClickMOT = () => {
    setErrorMsg('');
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

    const freeMotChecksUsedLocal = userProfile.freeMotChecksUsed ?? 0;
    const motCredits = userProfile.motCredits ?? 0;
    if (freeMotChecksUsedLocal < 3 || motCredits > 0) {
      navigate(`/mot?reg=${reg}`);
    } else {
      setErrorMsg(
        'You have no MOT checks remaining. Please purchase credits or wait for more free checks.'
      );
    }
  };

  // Purchase session
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  const handlePurchase = async (product, quantity) => {
    const productMap = {
      Valuation: 'VALUATION',
      VDI: 'VDI',
      MOT: 'MOT',
      HPI: 'VDI' // If you treat "Full HPI" the same as "VDI"
    };
    const creditType = productMap[product] || 'VDI';

    try {
      const { data } = await createSession({
        variables: { creditType, quantity },
      });
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Valuation check
  const handleClickValuation = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg('Please login or register to do a Valuation check.');
      return;
    }
    if (!hasValuationCredits) {
      setErrorMsg('You have no Valuation credits left. Please purchase more.');
      return;
    }
    navigate(`/valuation?reg=${reg}`);
  };

  // VDI/HPI check
  const handleClickVDI = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg('Please login or register to do a VDI check.');
      return;
    }
    if (!hasVdiCredits) {
      setErrorMsg('You have no VDI credits left. Please purchase more.');
      return;
    }
    navigate(`/hpi?reg=${reg}`);
  };

  return (
    <>
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
        }
        .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
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
          width: 22%;
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
            max-width: 100%;
            height: 120px;
          }
          .plate-blue {
            width: 80px;
            font-size: 2rem;
          }
          .plate-input {
            font-size: 2rem;
          }
        }
        /* WHY CHECK WITH US */
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

        /* FLEXIBLE PLANS SECTION */
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 550px;
    border: #fff solid 5px;
}
        }
        .flexible-plans-box h3 {
          margin-top: 0;
          font-weight: 700;
        }

        /* TAB SECTION */
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

        /* FAQ SECTION */
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

        /* BOTTOM BRAND MENTION */
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
      `}</style>

      {/* HERO SECTION */}
      <div className="hero section-fullwidth">
        <h1 className="hero-title">Your One-Stop Vehicle Check</h1>
        <p className="hero-subtitle">
          Free MOT History, Simple Valuation, Full HPI &amp; Comprehensive VDI 
          — All in One Place
        </p>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              type="text"
              className="plate-input"
              placeholder="AB12CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          <div className="button-group">
            <button className="action-button" onClick={handleClickMOT}>
              MOT History
            </button>
            <button className="action-button" onClick={handleClickValuation}>
              Valuation
            </button>
            <button className="action-button" onClick={handleClickVDI}>
              Full VDI
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
      </div>

      {/* PRICING SECTION */}
      <MainPricing
        isLoggedIn={!!localStorage.getItem('authToken')}
        hasUsedFreeMOT={freeMotChecksUsed >= 3}
        onPurchase={(product, quantity) => handlePurchase(product, quantity)}
      />

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
          {/* Removed the "Tailored to You" card here */}
        </div>
      </div>

      {/* NEW FLEXIBLE PLANS SECTION */}
      <div className="flexible-plans-section section-fullwidth">
        <div className="flexible-plans-container">
          <div className="flexible-plans-box">
            <h3>Flexible Plans & Extra Features</h3>
            <p>
              We understand that everyone has different needs when it 
              comes to vehicle checks. That's why we offer a range of 
              options, from free MOT checks and quick valuations to 
              more comprehensive HPI or VDI reports. You can purchase 
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
              Full VDI Check
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
              <strong> Simple Valuation</strong> tool leverages extensive 
              market data to tell you if the asking price is fair.
            </p>
            <ul>
              <li>Immediate valuation report</li>
              <li>Up-to-date pricing from real market data</li>
              <li>Avoid overpaying for your next car</li>
            </ul>
          </div>

          {/* Full HPI Check Tab */}
          

          {/* Full VDI Check Tab */}
          <div
            className="tab-pane fade"
            id="vdi"
            role="tabpanel"
            aria-labelledby="vdi-tab"
          >
            <p>
              Our most comprehensive offering, the <strong>Full VDI Check</strong>, 
              uncovers all aspects of a vehicle’s past — from outstanding finance 
              and theft records to plate changes, keeper history, technical 
              specs, and more. 
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
            <strong>VDI Check</strong> is our leading consumer brand for vehicle 
            history and provenance. The data we provide is securely sourced from 
            top-tier providers, including the Association of British Insurers, the 
            Police National Computer, VDI Valuations, Experian Automotive, major 
            UK finance companies, VOSA / DVSA, and the DVLA. We aggregate all of 
            this into one convenient, modern API, giving you everything you need 
            in a single report.
          </p>
        </div>
      </div>
    </>
  );
}
