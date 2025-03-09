// src/components/VehicleTaxRates.js
import React from 'react';

export default function VehicleTaxRates({ vedRate }) {
  // If vedRate is undefined or empty, show a friendly alert
  if (!vedRate) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Vehicle Excise Duty (Tax) Rates</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            No VED Rate data found.
          </div>
        </div>
      </div>
    );
  }

  // Typically, vedRate might have shapes like:
  // {
  //   FirstYear: { SixMonth: 101.75, TwelveMonth: 185 },
  //   Standard: { SixMonth: 140.25, TwelveMonth: 255 },
  //   PremiumVehicle: {
  //     YearTwoToSix: { SixMonth: null, TwelveMonth: null }
  //   }
  // }

  const firstYear = vedRate.FirstYear || {};
  const standard = vedRate.Standard || {};
  const premium = vedRate.PremiumVehicle || {}; 
  // premium might have sub-structures like { YearTwoToSix: { SixMonth, TwelveMonth } } if relevant

  return (
    <div className="card">
      <div className="card-header">
        <h3>Vehicle Excise Duty (Tax) Rates</h3>
      </div>
      <div className="card-body">
        {/* 1) First Year */}
        <div className="mb-3">
          <h5>First Year Rate</h5>
          {firstYear.SixMonth == null && firstYear.TwelveMonth == null ? (
            <p className="alert alert-info">No first-year rate data.</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>6 Month</td>
                  <td>{firstYear.SixMonth ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td>12 Month</td>
                  <td>{firstYear.TwelveMonth ?? 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* 2) Standard Rate */}
        <div className="mb-3">
          <h5>Standard Rate</h5>
          {standard.SixMonth == null && standard.TwelveMonth == null ? (
            <p className="alert alert-info">No standard rate data.</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>6 Month</td>
                  <td>{standard.SixMonth ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td>12 Month</td>
                  <td>{standard.TwelveMonth ?? 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* 3) Premium Vehicle (if any) */}
        <div>
          <h5>Premium Vehicle Rate</h5>
          {/* For instance, premium might look like:
              { YearTwoToSix: { SixMonth: null, TwelveMonth: null } } 
          */}
          {Object.keys(premium).length === 0 ? (
            <p className="alert alert-info">No premium vehicle data.</p>
          ) : (
            Object.entries(premium).map(([key, value], idx) => {
              // key might be "YearTwoToSix", value might be { SixMonth, TwelveMonth }
              const sixMonth = value?.SixMonth;
              const twelveMonth = value?.TwelveMonth;
              return (
                <div key={idx} className="mb-3">
                  <h6>{key}</h6>
                  {sixMonth == null && twelveMonth == null ? (
                    <p className="alert alert-info">
                      No data for {key}.
                    </p>
                  ) : (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>6 Month</td>
                          <td>{sixMonth ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>12 Month</td>
                          <td>{twelveMonth ?? 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
