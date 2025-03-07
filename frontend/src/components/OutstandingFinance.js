// src/components/OutstandingFinance.js
import React from 'react';

function formatDateToDDMMYYYY(isoString) {
    if (!isoString) return 'N/A';
    const dateObj = new Date(isoString);
    // If invalid date => fallback
    if (isNaN(dateObj)) return 'N/A';
  
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

export default function OutstandingFinance({ dataItems }) {
  // If FinanceRecordList or FinanceRecordCount
  const financeCount = dataItems.FinanceRecordCount || 0;
  // Possibly the actual record list
  const financeRecordList = dataItems.FinanceRecordList || [];

  if (financeCount === 0 || !financeRecordList.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Outstanding Finance</h3>
        </div>
        <div className="card-body">
          <p className="alert alert-success">
            No finance details found (Clear).
          </p>
        </div>
      </div>
    );
  }

  // If there are records, show them
  return (
    <div className="card">
      <div className="card-header">
        <h3>Outstanding Finance</h3>
      </div>
      <div className="card-body">
        <p>We found {financeCount} finance record(s):</p>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Agreement Date</th>
                <th>Agreement Type</th>
                <th>Agreement Term</th>
                <th>Finance Company</th>
                <th>Contact Number</th>
                {/* etc. as needed */}
              </tr>
            </thead>
            <tbody>
              {financeRecordList.map((rec, idx) => (
                <tr key={idx}>
                <td>{formatDateToDDMMYYYY(rec.AgreementDate)}</td>
                  <td>{rec.AgreementType || 'N/A'}</td>
                  <td>{rec.AgreementTerm || 'N/A'}</td>
                  <td>{rec.FinanceCompany || 'N/A'}</td>
                  <td>{rec.ContactNumber || 'N/A'}</td>
                  {/* etc. */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
