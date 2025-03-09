// src/components/ValuationResults.js
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

  // For summary, show only Retail, Average Private Sale, Part Exchange
  if (isSummary) {
    const retail = ValuationList['Dealer forecourt'] || 'N/A';
    const privateSale = ValuationList['Private Average'] || 'N/A';
    const px = ValuationList['Part Exchange'] || 'N/A';
    return (
      <>
      <style>
      {`
        .border.p-2.rounded.mb-2 {
          background: #008000;
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

  // Full detail
  return (
    <div className="card">
      <div className="card-header">
        <h3>Valuation Results</h3>
      </div>
      <div className="card-body">
        <p><strong>Vehicle:</strong> {VehicleDescription || 'N/A'}</p>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Description</th>
                <th>Valuation (GBP)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ValuationList).map(([desc, val]) => (
                <tr key={desc}>
                  <td>{desc}</td>
                  <td>£{formatNumber(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
