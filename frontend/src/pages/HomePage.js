import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';
import drkbgd from '../images/backgrd.jpg';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // For MOT, check if free searches used up:
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const hasFreeMotLeft = freeMotChecksUsed < 3;

  // For Valuation credits:
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;

  // For VDI => if you track VDI separately:
  const hasVdiCredits = (userProfile?.hpiCredits ?? 0) > 0;

  const navigate = useNavigate();

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    // Limit input to 8 chars
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // MOT handler
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

  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  const handlePurchase = async (product, quantity) => {
    const productMap = {
      Valuation: 'VALUATION',
      VDI: 'VDI',
      MOT: 'MOT',
    };
    const creditType = productMap[product] || 'VDI';

    try {
      const { data } = await createSession({ variables: { creditType, quantity } });
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        /* Hero background, not full viewport height anymore */
        .hero {
          width: 100%;
          background: url(${drkbgd}) center top repeat-y;
          padding: 3rem 0;
          /* Removed min-height: 100vh for a more compact form area */
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          padding: 2rem;
        }

        .hero h1 {
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .hero p {
          margin-bottom: 2rem;
        }

        /* Plate container & input styling */
        .plate-container {
          margin: 0 auto;
          display: flex;
          align-items: stretch;
          border: 2px solid #000;
          border-radius: 25px;
          overflow: hidden;
          max-width: 600px;
          height: 150px;
        }
        .plate-blue {
          background-color: #003399;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 110px;
          font-size: 2.5rem;
          font-weight: bold;
        }
        .plate-input {
          flex: 1;
          background-color: #ffde46;
          color: #000;
          font-weight: bold;
          font-size: 3rem;
          border: none;
          text-transform: uppercase;
          padding: 0 1rem;
          outline: none;
        }

        /* Button group side-by-side on desktop, stacked on mobile */
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
          border: none;
          border-radius: 25px;
          padding: 10px 25px;
          cursor: pointer;
          font-size: 1.3rem;
        }
        .action-button:hover {
          background-color: #0d4f9c;
        }
        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          /* Plate smaller on mobile */
          .plate-container {
            max-width: 100%;
            height: 120px;
          }
          .plate-blue {
            width: 80px;
            font-size: 2rem;
          }
          .plate-input {
            font-size: 2.4rem;
          }
        }
      `}</style>

      {/* HERO SECTION WITH FORM */}
      <div className="hero">
        <div className="hero-content">
          <h1>All-In-One Vehicle Check</h1>
          <p>
            Enter your vehicle registration below, then pick from 
            <strong> Free MOT History</strong>, <strong>Simple Valuation</strong>, 
            or a <strong>Full VDI (Vehicle Data &amp; History) Check</strong>. 
          </p>

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

      {/* CONTENT SECTION - Features & Benefits */}
      <div className="container my-5">
        <h2 className="mb-4 text-center">Why Choose Our Vehicle Checks?</h2>

        <p className="lead">
          We pride ourselves on delivering quick, accurate, and 
          comprehensive vehicle information. Whether you need to confirm
          a vehicle’s MOT history for free, want an instant valuation, 
          or require our full VDI check, our service is designed to 
          make you feel confident about your next vehicle purchase. 
        </p>

        <div className="alert alert-info my-4" role="alert">
          <strong>VDI Check</strong> is our leading consumer brand for vehicle history 
          and provenance. The data we provide is securely sourced from top-tier 
          providers, including the Association of British Insurers, the Police National Computer, 
          VDI Valuations, Experian Automotive, major UK finance companies, VOSA / DVSA, and the DVLA. 
          We aggregate all of this into one convenient, modern API, giving you everything you need 
          in a single report.
        </div>

        {/* ACCORDION FOR MORE DETAILS */}
        <div className="accordion" id="vehicleCheckAccordion">
          {/* Why check a vehicle */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne"
              >
                Why Should I Check a Vehicle Before Buying?
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse"
              aria-labelledby="headingOne"
              data-bs-parent="#vehicleCheckAccordion"
            >
              <div className="accordion-body">
                <p>
                  Buying a used car can be a big investment. A quick look 
                  at a vehicle doesn’t always reveal hidden issues such as 
                  outstanding finance, previous write-offs, or even if it 
                  was reported stolen. By checking these details in advance, 
                  you protect yourself from unexpected losses and ensure 
                  you’re paying a fair price.
                </p>
                <ul>
                  <li><i className="bi bi-check-circle me-2"></i> Avoid purchasing a car with unpaid finance</li>
                  <li><i className="bi bi-check-circle me-2"></i> Steer clear of stolen or clocked vehicles</li>
                  <li><i className="bi bi-check-circle me-2"></i> Confirm mileage accuracy</li>
                  <li><i className="bi bi-check-circle me-2"></i> Validate it has a legitimate V5C (logbook)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What's included in the checks */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                What’s Included in Our Full VDI Check?
              </button>
            </h2>
            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              aria-labelledby="headingTwo"
              data-bs-parent="#vehicleCheckAccordion"
            >
              <div className="accordion-body">
                <p>
                  Our <strong>Full VDI Check</strong> goes beyond basic details 
                  to give you an in-depth report about the vehicle’s past:
                </p>
                <ul>
                  <li><i className="bi bi-check-circle me-2"></i> Outstanding Finance or Loans</li>
                  <li><i className="bi bi-check-circle me-2"></i> Stolen Vehicle Status (Police National Computer)</li>
                  <li><i className="bi bi-check-circle me-2"></i> Insurance Write-off Records</li>
                  <li><i className="bi bi-check-circle me-2"></i> Mileage Discrepancies</li>
                  <li><i className="bi bi-check-circle me-2"></i> Number of Previous Owners &amp; Keeper Changes</li>
                  <li><i className="bi bi-check-circle me-2"></i> Plate Transfers, Scrappage Checks &amp; Import/Export Status</li>
                  <li><i className="bi bi-check-circle me-2"></i> Vehicle Identification Number (VIN) Match</li>
                  <li><i className="bi bi-check-circle me-2"></i> Technical Data &amp; Emissions Standards</li>
                  <li><i className="bi bi-check-circle me-2"></i> …and so much more!</li>
                </ul>
                <p>
                  All of this data is pulled together in seconds, giving you peace of mind and 
                  saving you from potential pitfalls.
                </p>
              </div>
            </div>
          </div>

          {/* Free MOT + Valuation Info */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                Free MOT &amp; Valuation Searches
              </button>
            </h2>
            <div
              id="collapseThree"
              className="accordion-collapse collapse"
              aria-labelledby="headingThree"
              data-bs-parent="#vehicleCheckAccordion"
            >
              <div className="accordion-body">
                <p>
                  We know it’s important to have easy access to core checks. That’s why 
                  every user gets <strong>free MOT searches</strong> and a 
                  <strong> simple valuation check</strong> option to ensure the basics 
                  are covered without any hidden fees.
                </p>
                <ul>
                  <li><i className="bi bi-check-circle me-2"></i> Up to 3 free MOT checks</li>
                  <li><i className="bi bi-check-circle me-2"></i> Instant market valuation so you never overpay</li>
                </ul>
                <p>
                  Once you’ve confirmed these essentials, you can upgrade to a full 
                  VDI check anytime for maximum detail. 
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Possible final prompt or CTA */}
        <div className="mt-5 text-center">
          <h3>Ready to Buy Your Next Car with Confidence?</h3>
          <p className="mb-4">
            Use our free MOT check, grab a quick valuation, or get the 
            ultimate peace of mind with our Full VDI check.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
