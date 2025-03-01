// frontend/src/components/MOTResultDisplay.js
import React from 'react';

function MOTResultDisplay({ data }) {
  // If the server response has no data at all
  if (!data?.DataItems) {
    return <p>No MOT data available.</p>;
  }

  const { VehicleDetails, VehicleStatus, MotHistory } = data.DataItems;

  // If partial data is missing
  if (!VehicleDetails || !VehicleStatus) {
    return <p>Vehicle details or status not available.</p>;
  }

  return (
    <div>
      {/* BASIC: Vehicle Details */}
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

      {/* BASIC: Vehicle Status */}
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

      {/* FULL ADDITIONAL MOT HISTORY (if present) */}
      {MotHistory?.RecordList?.length > 0 ? (
        <div className="mb-4">
          <h3>Additional MOT History</h3>
          {MotHistory.RecordList.map((record, idx) => (
            <div key={idx} className="card mb-3">
              <div className="card-header">
                <h4 className="mb-0">MOT Test on {record.TestDate}</h4>
              </div>
              <div className="card-body">
                <p><strong>Test Number:</strong> {record.TestNumber}</p>
                <p><strong>Result:</strong> {record.TestResult}</p>
                {record.ExpiryDate && (
                  <p><strong>Expiry Date:</strong> {record.ExpiryDate}</p>
                )}
                <p>
                  <strong>Odometer Reading:</strong> {record.OdometerReading} {record.OdometerUnit}
                </p>
                
                {/* If you have advisory/failure arrays, show them here */}
                {record.AdvisoryNoticeList?.length > 0 && (
                  <div>
                    <h5>Advisory Notices:</h5>
                    <ul className="list-group">
                      {record.AdvisoryNoticeList.map((notice, i2) => (
                        <li key={i2} className="list-group-item">{notice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {record.FailureReasonList?.length > 0 && (
                  <div>
                    <h5>Failure Reasons:</h5>
                    <ul className="list-group">
                      {record.FailureReasonList.map((reason, i3) => (
                        <li key={i3} className="list-group-item">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          No advanced records found for this vehicle.
        </div>
      )}
    </div>
  );
}

export default MOTResultDisplay;
