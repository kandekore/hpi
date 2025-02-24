// src/components/MOTResultDisplay.js
import React from 'react';

function MOTResultDisplay({ data, isFreeCheck }) {
  if (!data.DataItems) {
    return <div className="alert alert-warning">No data available.</div>;
  }

  const { VehicleDetails, VehicleStatus, MotHistory } = data.DataItems;

  if (!VehicleDetails || !VehicleStatus) {
    return <div className="alert alert-warning">Vehicle details or status not available.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h3>Vehicle Details</h3>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Make</th>
              <td>{VehicleDetails.Make}</td>
            </tr>
            <tr>
              <th>Model</th>
              <td>{VehicleDetails.Model}</td>
            </tr>
            <tr>
              <th>Fuel Type</th>
              <td>{VehicleDetails.FuelType}</td>
            </tr>
            <tr>
              <th>Colour</th>
              <td>{VehicleDetails.Colour}</td>
            </tr>
            <tr>
              <th>Date First Registered</th>
              <td>{VehicleDetails.DateFirstRegistered}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3>Vehicle Status</h3>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Next MOT Due Date</th>
              <td>{VehicleStatus.NextMotDueDate}</td>
            </tr>
            <tr>
              <th>Days Until Next MOT Due</th>
              <td>{VehicleStatus.DaysUntilNextMotIsDue}</td>
            </tr>
            <tr>
              <th>VED Currently Valid</th>
              <td>{VehicleStatus.MotVed?.VedCurrentlyValid ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <th>VED Expiry Date</th>
              <td>{VehicleStatus.MotVed?.VedExpiryDate || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isFreeCheck && MotHistory && MotHistory.RecordList && MotHistory.RecordList.length > 0 && (
        <div className="mb-4">
          <h3>Additional MOT History (Paid Feature)</h3>
          {MotHistory.RecordList.map((record, index) => (
            <div key={index} className="card mb-3">
              <div className="card-header">
                <h4 className="mb-0">MOT Test on {record.TestDate}</h4>
              </div>
              <div className="card-body">
                <p><strong>Test Number:</strong> {record.TestNumber}</p>
                <p><strong>Result:</strong> {record.TestResult}</p>
                {record.ExpiryDate && <p><strong>Expiry Date:</strong> {record.ExpiryDate}</p>}
                <p><strong>Odometer Reading:</strong> {record.OdometerReading} {record.OdometerUnit}</p>
                {record.AdvisoryNoticeList && record.AdvisoryNoticeList.length > 0 && (
                  <div>
                    <h5>Advisory Notices:</h5>
                    <ul className="list-group">
                      {record.AdvisoryNoticeList.map((notice, i) => (
                        <li key={i} className="list-group-item">{notice}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {record.FailureReasonList && record.FailureReasonList.length > 0 && (
                  <div>
                    <h5>Failure Reasons:</h5>
                    <ul className="list-group">
                      {record.FailureReasonList.map((reason, i) => (
                        <li key={i} className="list-group-item">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isFreeCheck && (!MotHistory || !MotHistory.RecordList || MotHistory.RecordList.length === 0) && (
        <div className="alert alert-info">No MOT history records found for this vehicle.</div>
      )}
    </div>
  );
}

export default MOTResultDisplay;
