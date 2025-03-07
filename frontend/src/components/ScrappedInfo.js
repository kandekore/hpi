// src/components/ScrappedInfo.js
import React from 'react';

export default function ScrappedInfo({ dataItems }) {
  const scrapDate = dataItems.ScrapDate || 'N/A';
  // Possibly dataItems.CertificateOfDestructionIssued (boolean), if present
  const codIssued = dataItems.CertificateOfDestructionIssued === true;

  // Also if dataItems.Scrapped => true/false
  const isScrapped = dataItems.Scrapped === true;

  if (!isScrapped && scrapDate === 'N/A' && !codIssued) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Scrapped Info</h3>
        </div>
        <div className="card-body">
          <p className="alert alert-success">This vehicle is not scrapped.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Scrapped Info</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th>Scrapped</th>
              <td>{isScrapped ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <th>Scrap Date</th>
              <td>{scrapDate}</td>
            </tr>
            <tr>
              <th>Certificate of Destruction Issued</th>
              <td>{codIssued ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
