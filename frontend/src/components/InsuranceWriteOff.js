// src/components/InsuranceWriteOff.js
import React from 'react';

export default function InsuranceWriteOff({ dataItems }) {
  // from the JSON
  const writeOffCategory = dataItems.WriteOffCategory || 'N/A';
  const writeOffDate = dataItems.WriteOffDate || 'N/A';
  const writeOffCount = dataItems.WriteOffRecordCount || 0;
  const writeOffRecordList = dataItems.WriteOffRecordList;

  // If no records
  if (!writeOffRecordList && writeOffCount === 0 && writeOffCategory === 'N/A') {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Insurance Write Off</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-success">
            No insurance write-off details found.
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show them
  return (
    <div className="card">
      <div className="card-header">
        <h3>Insurance Write Off</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th>Write Off Category</th>
              <td>{writeOffCategory}</td>
            </tr>
            <tr>
              <th>Write Off Date</th>
              <td>{writeOffDate}</td>
            </tr>
            <tr>
              <th>Write Off Record Count</th>
              <td>{writeOffCount}</td>
            </tr>
            <tr>
              <th>Write Off Record List</th>
              <td>{writeOffRecordList || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
