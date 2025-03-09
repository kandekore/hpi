// src/components/ValuationResultDisplay.js
import React from 'react';
import { formatNumber } from '../utils/formatNumber'; 

/**
 * Example of the data structure you actually receive:
 * {
 *   "StatusCode": "Success",
 *   "StatusMessage": "Success",
 *   "DataItems": {
 *     "Vrm": "KM12AKK",
 *     "Mileage": "104,600",
 *     "PlateYear": "2012-12",
 *     "ValuationList": {
 *       "OTR": "32316",
 *       "Dealer forecourt": "8000",
 *       "Trade Retail": "7301",
 *       ...
 *     },
 *     "ValuationTime": "2025-02-24T17:47:26.0617393Z",
 *     "VehicleDescription": "VOLKSWAGEN SHARAN SEL BLUE TECH TDI S-A",
 *     "ValuationBook": "UKVD Direct",
 *     "ExtractNumber": 0
 *   },
 *   "StatusInformation": {
 *     "Lookup": { ... }
 *   },
 *   ...
 * }
 */

function ValuationResultDisplay({ data, isFreeSearch }) {
  if (!data) {
    return (
      <div className="alert alert-warning">
        No valuation data returned from the server.
      </div>
    );
  }

  const {
    StatusCode,
    StatusMessage,
    DataItems,
    StatusInformation,
    // If you still want to keep them, you can:
    // MetaDataForItems,
    // MetaDataForKeys,
  } = data;

  // Destructure individual fields from DataItems so we don't show a big JSON dump
  const {
    Vrm,
    Mileage,
    PlateYear,
    ValuationList,
    ValuationTime,
    VehicleDescription,
    ValuationBook,
    ExtractNumber,
  } = DataItems || {};

  return (
    <div className="card p-3 shadow-sm">
      <h4 className="mb-3">Valuation Results</h4>

      {/* Status badges */}
      <div className="mb-3">
        <span className="badge bg-secondary me-2">Code: {StatusCode}</span>
        <span className="badge bg-success">Message: {StatusMessage}</span>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {/* If DataItems is missing or empty, we can show "N/A" */}
            <tr>
              <td>Vrm</td>
              <td>{Vrm ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Mileage</td>
              <td>{Mileage ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PlateYear</td>
              <td>{PlateYear ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ValuationTime</td>
              <td>{ValuationTime ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>VehicleDescription</td>
              <td>{VehicleDescription ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ValuationBook</td>
              <td>{ValuationBook ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ExtractNumber</td>
              <td>{ExtractNumber ?? 'N/A'}</td>
            </tr>

            {/* 
              Show ValuationList as a sub-list, e.g. “OTR: 32316” 
              If ValuationList doesn't exist, show "N/A"
            */}
            <tr>
              <td>ValuationList</td>
              <td>
                {ValuationList && typeof ValuationList === 'object' ? (
                  <ul className="mb-0">
                    {Object.entries(ValuationList).map(([label, val]) => (
                      <li key={label}>
                        <strong>{label}</strong>: {val}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>

            {/* Show StatusInformation if you want, or remove it */}
            <tr>
              <td>StatusInformation</td>
              <td>
                {StatusInformation ? (
                  <pre className="bg-light p-2 mb-0">
                    {JSON.stringify(StatusInformation, null, 2)}
                  </pre>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* If you want to hide advanced fields for free searches */}
      {!isFreeSearch && (
        <div className="alert alert-primary mt-3">
          (Additional valuation fields could be displayed here for paid users.)
        </div>
      )}
    </div>
  );
}

export default ValuationResultDisplay;
