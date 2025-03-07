// src/components/ImportedInfo.js
import React from 'react';

export default function ImportedInfo({ dataItems }) {
  const imported = dataItems.Imported === true;
  const importDate = dataItems.ImportDate || 'N/A';
  const importedFromOutsideEu = dataItems.ImportedFromOutsideEu === true;
  const importUsedBeforeUkReg = dataItems.ImportUsedBeforeUkRegistration === true;

  if (!imported && importDate === 'N/A' && !importedFromOutsideEu && !importUsedBeforeUkReg) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Imported Info</h3>
        </div>
        <div className="card-body">
          <p className="alert alert-success">No import details found. (Not imported)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Imported Info</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th>Imported</th>
              <td>{imported ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <th>Import Date</th>
              <td>{importDate}</td>
            </tr>
            <tr>
              <th>Imported From Outside EU</th>
              <td>{importedFromOutsideEu ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <th>Import Used Before UK Registration</th>
              <td>{importUsedBeforeUkReg ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
