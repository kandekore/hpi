// src/components/MileageAnomaly.js
import React from 'react';
import { formatNumber } from '../utils/formatNumber';

export default function MileageAnomaly({ dataItems }) {
  const anomalyDetected = dataItems.MileageAnomalyDetected === true;
  const recordCount = dataItems.MileageRecordCount || 0;
  const recordList = dataItems.MileageRecordList || [];

  return (
    <div className="card">
      <div className="card-header">
        <h3>Mileage Anomaly</h3>
      </div>
      <div className="card-body">
        {anomalyDetected ? (
          <p className="alert alert-danger">
            A mileage anomaly was detected.
          </p>
        ) : (
          <p className="alert alert-success">
            No mileage anomaly detected.
          </p>
        )}

        <p>
          <strong>Mileage Records:</strong> {recordCount}
        </p>

        {recordList.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date Of Information</th>
                  <th>Source</th>
                  <th>Mileage</th>
                </tr>
              </thead>
              <tbody>
                {recordList.map((r, i) => (
                  <tr key={i}>
                    <td>{r.DateOfInformation || 'N/A'}</td>
                    <td>{r.SourceOfInformation || 'N/A'}</td>
                    <td>{formatNumber(r.Mileage) || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No mileage records found.</p>
        )}
      </div>
    </div>
  );
}
