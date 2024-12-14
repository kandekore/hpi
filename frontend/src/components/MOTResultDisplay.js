import React from 'react';

function MOTResultDisplay({ data, isFreeCheck }) {
  // data should have something like: data.DataItems.VehicleDetails, data.DataItems.VehicleStatus, data.DataItems.MotHistory
  if (!data.DataItems) {
    return <p>No data available.</p>;
  }

  const { VehicleDetails, VehicleStatus, MotHistory } = data.DataItems;

  if (!VehicleDetails || !VehicleStatus) {
    return <p>Vehicle details or status not available.</p>;
  }

  return (
    <div>
      <h3>Vehicle Details</h3>
      <p><strong>Make:</strong> {VehicleDetails.Make}</p>
      <p><strong>Model:</strong> {VehicleDetails.Model}</p>
      <p><strong>Fuel Type:</strong> {VehicleDetails.FuelType}</p>
      <p><strong>Colour:</strong> {VehicleDetails.Colour}</p>
      <p><strong>Date First Registered:</strong> {VehicleDetails.DateFirstRegistered}</p>

      <h3>Vehicle Status</h3>
      <p><strong>Next MOT Due Date:</strong> {VehicleStatus.NextMotDueDate}</p>
      <p><strong>Days Until Next MOT Due:</strong> {VehicleStatus.DaysUntilNextMotIsDue}</p>
      <p><strong>VED Currently Valid:</strong> {VehicleStatus.MotVed?.VedCurrentlyValid ? 'Yes' : 'No'}</p>
      <p><strong>VED Expiry Date:</strong> {VehicleStatus.MotVed?.VedExpiryDate || 'N/A'}</p>

      {/* If it's not a free check, show the MOT history */}
      {!isFreeCheck && MotHistory && MotHistory.RecordList && MotHistory.RecordList.length > 0 && (
        <>
          <h3>Additional MOT History (Paid Feature)</h3>
          {MotHistory.RecordList.map((record, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
              <h4>MOT Test on {record.TestDate}</h4>
              <p><strong>Test Number:</strong> {record.TestNumber}</p>
              <p><strong>Result:</strong> {record.TestResult}</p>
              {record.ExpiryDate && <p><strong>Expiry Date:</strong> {record.ExpiryDate}</p>}
              <p><strong>Odometer Reading:</strong> {record.OdometerReading} {record.OdometerUnit}</p>

              {/* Advisory Notices */}
              {record.AdvisoryNoticeList && record.AdvisoryNoticeList.length > 0 && (
                <div>
                  <h5>Advisory Notices:</h5>
                  <ul>
                    {record.AdvisoryNoticeList.map((notice, i) => <li key={i}>{notice}</li>)}
                  </ul>
                </div>
              )}

              {/* Failures */}
              {record.FailureReasonList && record.FailureReasonList.length > 0 && (
                <div>
                  <h5>Failure Reasons:</h5>
                  <ul>
                    {record.FailureReasonList.map((reason, i) => <li key={i}>{reason}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* If it's a paid check but no MOT history is available */}
      {!isFreeCheck && (!MotHistory || !MotHistory.RecordList || MotHistory.RecordList.length === 0) && (
        <p>No MOT history records found for this vehicle.</p>
      )}
    </div>
  );
}

export default MOTResultDisplay;
