// src/pages/HomePage.js

import React, { useState } from 'react';
import { useLazyQuery, useQuery, useMutation } from '@apollo/client';
import {
  GET_USER_PROFILE,
  VDI_CHECK,
  VALUATION_CHECK,
} from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';

import VdiResultDisplay from '../components/VdiResultDisplay';
import ValuationResultDisplay from '../components/ValuationResultDisplay';
import MainPricing from '../components/MainPricing';

function HomePage() {
  const [reg, setReg] = useState('');
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  // 1) Queries & Mutations
  const { data: profileData, loading: profileLoading } = useQuery(GET_USER_PROFILE);
  const [vdiCheck, { data: vdiData, loading: vdiLoading, error: vdiError }] = useLazyQuery(VDI_CHECK);
  const [valuationCheck, { data: valuationData, loading: valuationLoading, error: valuationError }] =
    useLazyQuery(VALUATION_CHECK);

  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // 2) Auth & user credits
  const isLoggedIn = !!localStorage.getItem('authToken');
  const userProfile = profileData?.getUserProfile || null;
  const hasValuationCredits = userProfile?.valuationCredits > 0;
  const hasUsedFreeMOT = (userProfile?.freeMotChecksUsed ?? 0) >= 3;

  // 3) VDI & Valuation check logic
  const handleVDICheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn || !hasValuationCredits) return;
    await vdiCheck({ variables: { reg } });
    await valuationCheck({ variables: { reg } });
  };

  // 4) Purchase function for MainPricing
  const handlePurchase = async (product, quantity) => {
    // map "Valuation" => "VALUATION", "VDI" => "VDI", "MOT" => "MOT"
    const productMap = {
      'Valuation': 'VALUATION',
      'VDI': 'VDI',
      'MOT': 'MOT',
    };
    const creditType = productMap[product] || 'VDI';

    try {
      const { data } = await createSession({ variables: { creditType, quantity }});
      if (data.createCreditPurchaseSession) {
        // redirect to Stripe
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5) Extract fields from VDI data
  const imageList = vdiData?.vdiCheck?.DataItems?.VehicleImages?.ImageDetailsList;
  const vehicleImageUrl = imageList?.[0]?.ImageUrl || '/placeholder-vehicle.jpg';
  const isWrittenOff = vdiData?.vdiCheck?.DataItems?.WrittenOff || false;
  const isStolen = vdiData?.vdiCheck?.DataItems?.Stolen || false;
  const yearOfManufacture = vdiData?.vdiCheck?.DataItems?.YearOfManufacture || 'N/A';

  // 6) Extract from Valuation data
  const vehicleDescription = valuationData?.valuation?.DataItems?.VehicleDescription || 'N/A';
  const valuationList = valuationData?.valuation?.DataItems?.ValuationList || {};
  const dealerForecourt = valuationList['Dealer forecourt'] || 'N/A';
  const tradeRetail = valuationList['Trade Retail'] || 'N/A';
  const privateAverage = valuationList['Private Average'] || 'N/A';
  const partExchange = valuationList['Part Exchange'] || 'N/A';

  return (
    <div>
      <div className="row align-items-start">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">Vehicle Data Check (VDI)</h2>
              <p className="card-text">
                Enter your vehicle registration for a comprehensive check (including valuation).
              </p>

              {/* If user attempts a search but isn't logged in */}
              {attemptedSearch && !isLoggedIn && (
                <div className="alert alert-info">
                  Please <a href="/login" className="alert-link">login</a> or
                  <a href="/register" className="alert-link"> register</a> to perform VDI checks.
                </div>
              )}

              {/* If user attempts a search but is out of credits */}
              {attemptedSearch && isLoggedIn && !profileLoading && userProfile && userProfile.valuationCredits < 1 && (
                <div className="alert alert-warning">
                  You have 0 VDI credits. Please{' '}
                  <a href="/credits" className="alert-link">purchase credits</a> to continue.
                </div>
              )}

              <div className="input-group mt-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Vehicle Registration"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleVDICheck}
                  disabled={vdiLoading || valuationLoading}
                >
                  {(vdiLoading || valuationLoading) ? 'Checking...' : 'Check VDI & Valuation'}
                </button>
              </div>

              {vdiError && (
                <div className="alert alert-danger mt-3">
                  {vdiError.message}
                </div>
              )}
              {valuationError && (
                <div className="alert alert-danger mt-3">
                  {valuationError.message}
                </div>
              )}
            </div>
            <h1>Your Comprehensive Vehicle History Solution</h1>
            <p>
              Welcome to our Car History Check service ...
            </p>
            <p>
              Whether you’re looking for a simple MOT history or an in-depth VDI check ...
            </p>
          </div>
        </div>

        {/* Right 1/3: CTA for MOT */}
        <div className="col-md-4">
          <div className="card text-center mb-4">
            <div className="card-body">
              <h3 className="card-title">Get a Free MOT Check</h3>
              <p className="card-text">
                We offer 3 free MOT checks to every user, but you must be signed in.
              </p>
              <a href="/mot" className="btn btn-success">
                Check Now!
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* If we have either VDI data or Valuation data, show the summary card */}
      {(vdiData?.vdiCheck || valuationData?.valuation) && (
        <div className="card mt-4">
          <div className="row g-0">
            {/* 1/3 for image => col-md-8. (Your comment says 1/3, but code says col-md-8) */}
            <div className="col-md-8">
              <img
                src={vehicleImageUrl}
                alt="Vehicle"
                className="img-fluid h-100 w-100 rounded-start"
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* 2/3 => col-md-4 for summary */}
            <div className="col-md-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Vehicle Summary</h5>
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <th>Vehicle Description</th>
                      <td>{vehicleDescription}</td>
                    </tr>
                    <tr>
                      <th>Year of Manufacture</th>
                      <td>{yearOfManufacture}</td>
                    </tr>
                    <tr>
                      <th>Dealer Forecourt</th>
                      <td>{dealerForecourt}</td>
                    </tr>
                    <tr>
                      <th>Trade Retail</th>
                      <td>{tradeRetail}</td>
                    </tr>
                    <tr>
                      <th>Private Average</th>
                      <td>{privateAverage}</td>
                    </tr>
                    <tr>
                      <th>Part Exchange</th>
                      <td>{partExchange}</td>
                    </tr>
                    <tr>
                      <th>Finance</th>
                      <td>No</td>
                    </tr>
                    <tr>
                      <th>Written Off</th>
                      <td>{isWrittenOff ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <th>Stolen</th>
                      <td>{isStolen ? 'Yes' : 'No'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-WIDTH SECTION FOR VDI RESULTS (if any) */}
      {vdiData && vdiData.vdiCheck && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>VDI Check Results</h3>
          </div>
          <div className="card-body">
            <VdiResultDisplay data={vdiData.vdiCheck} />
          </div>
        </div>
      )}

      {/* FULL-WIDTH SECTION FOR VALUATION RESULTS (if any) */}
      {valuationData && valuationData.valuation && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>Valuation Results</h3>
          </div>
          <div className="card-body">
            <ValuationResultDisplay data={valuationData.valuation} isFreeSearch={false} />
          </div>
        </div>
      )}

      {/* Example Ad Banner */}
      <div className="card border-secondary mt-4">
        <div className="card-body text-center">
          [Ad Banner]
        </div>
      </div>

      {/* Pricing Table => user can buy. If user isn't logged in => show a login message or let them proceed => they must login. */}
      <MainPricing
        isLoggedIn={isLoggedIn}
        hasUsedFreeMOT={hasUsedFreeMOT}
        onPurchase={handlePurchase}
      />
    </div>
  );
}

export default HomePage;
