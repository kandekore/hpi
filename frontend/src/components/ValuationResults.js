// src/components/ValuationResults.js
import React from 'react';

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
      <div className="card">
        <div className="card-header">
          <h3>Valuation Summary</h3>
        </div>
        <div className="card-body">
          <p><strong>Vehicle:</strong> {VehicleDescription || 'N/A'}</p>
          <div className="row">
            <div className="col-sm-4">
              <div className="border p-2 rounded mb-2">
                <strong>Retail</strong><br />
                £{retail}
              </div>
            </div>
            <div className="col-sm-4">
              <div className="border p-2 rounded mb-2">
                <strong>Average Private Sale</strong><br />
                £{privateSale}
              </div>
            </div>
            <div className="col-sm-4">
              <div className="border p-2 rounded mb-2">
                <strong>Part Exchange</strong><br />
                £{px}
              </div>
            </div>
          </div>
          <a href="#valuationSection" className="btn btn-primary btn-sm">
            All Valuation Data
          </a>
        </div>
      </div>
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
                  <td>£{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
