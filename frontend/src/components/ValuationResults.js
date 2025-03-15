import React from 'react';
import { formatNumber } from '../utils/formatNumber';

export default function ValuationResults({ valuation, isSummary = false }) {
  if (!valuation || !valuation.DataItems) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Valuation</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-info">No valuation data available.</div>
        </div>
      </div>
    );
  }

  const { VehicleDescription, ValuationList = {} } = valuation.DataItems;

  // 1) If "isSummary" => same logic as before (3 green boxes).
  if (isSummary) {
    const retail = ValuationList['Dealer forecourt'] || 'N/A';
    const privateSale = ValuationList['Private Average'] || 'N/A';
    const px = ValuationList['Part Exchange'] || 'N/A';
    return (
      <>
        <style>
          {`
            .border.p-2.rounded.mb-2 {
              background: #008000; /* green background */
              color: white;
              text-align: center;
            }
            p.price {
              font-size: 30px!important;
              font-weight: 800;
              text-shadow: 1px 1px #000;
            }
            .valbutton {
              text-align: center;
            }
              .card-header {
    background: #003366;
    color: #fff;
    text-align: center;
}
    h4 {
    text-align: center;
    padding-top: 30px;
    padding-bottom: 10px;
    color: #003366;
    text-style: italics;
    font-weight: 100;
}
            
          `}
        </style>
        
        <div className="card">
          <div className="card-header">
            <h3>Valuation Summary</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-sm-4">
                <div className="border p-2 rounded mb-2">
                  <strong>Retail</strong><br />
                  <p className="price">£{formatNumber(retail)}</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="border p-2 rounded mb-2">
                  <strong>Average Private Sale</strong><br />
                  <p className="price">£{formatNumber(privateSale)}</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="border p-2 rounded mb-2">
                  <strong>Part Exchange</strong><br />
                  <p className="price">£{formatNumber(px)}</p>
                </div>
              </div>
            </div>
            <div className="valbutton">
              <a href="#valuationSection" className="btn btn-primary btn-sm">
                Click Here to View All Valuation Data
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2) Full detail => replicate snippet style but with #003366 background
  //    Four distinct rows, each with col-sm-4 boxes.
  //    If the value is missing or 'N/A', we skip rendering that box.

  // Row definitions, keyed to ValuationList
  const row1 = [
    { label: 'On the Road', key: 'OTR' },
    { label: 'Dealer forecourt', key: 'Dealer forecourt' },
  ];
  const row2 = [
    { label: 'Private Clean', key: 'Private Clean' },
    { label: 'Private Average', key: 'Private Average' },
  ];
  const row3 = [
    { label: 'Part Exchange', key: 'Part Exchange' },
    { label: 'Auction', key: 'Auction' },
  ];
  const row4 = [
    { label: 'Trade Retail', key: 'Trade Retail' },
    { label: 'Trade Average', key: 'Trade Average' },
    { label: 'Trade Poor', key: 'Trade Poor' },
  ];

  // Helper to render one "box" if the value is present
  function renderValBox({ label, key }) {
    const val = ValuationList[key];
    if (!val || val === 'N/A') return null;

    return (
      <div className="col-sm-4" key={key}>
        <div
          className="border p-2 rounded mb-2"
          style={{
            background: '#003366',  // new color
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <strong>{label}</strong>
          <br />
          <p
            style={{
              fontSize: '30px',
              fontWeight: 800,
              textShadow: '1px 1px #000',
              margin: 0,
            }}
          >
            £{formatNumber(val)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* replicate snippet style, but #003366 for full detail boxes */
        `}
      </style>

      <div className="card">
        <div className="card-header">
          <h3>Valuation Detailed</h3>
        </div>
        <div className="card-body">
          {/* Each row is a .row, each box is col-sm-4 to keep them same size */}
          <div className="row justify-content-center">
          <h4>Retail Valuations</h4>
            {row1.map(renderValBox)}
          </div>
          <div className="row justify-content-center">
            {row3.map(renderValBox)}
          </div>
          <div className="row justify-content-center">
          <h4>Private Valuations</h4>
            {row2.map(renderValBox)}
          </div>
          
          <div className="row justify-content-center">
          <h4>Trade Valuations</h4>
            {row4.map(renderValBox)}
          </div>
        </div>
      </div>
    </>
  );
}
