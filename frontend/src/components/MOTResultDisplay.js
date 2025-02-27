// frontend/src/components/MOTResultDisplay.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
// IMPORTANT: If you want to use a brand new mutation (payMOTCredit) 
// then import it from your mutations file, e.g.:
import { PAY_MOT_CREDIT } from '../graphql/mutations';
// or if you're reusing 'USE_MOT_CREDIT' from your code, rename references accordingly

function MOTResultDisplay({ data, userProfile }) {
  // local state for advanced data lock
  const [unlocked, setUnlocked] = useState(false);

  // The new mutation that deducts a credit for the button scenario
  const [payMotCredit, { loading: creditLoading, error: creditError }] = useMutation(
    PAY_MOT_CREDIT,
    {
      refetchQueries: [{ query: GET_USER_PROFILE }],
    }
  );

  // Handler for the "Reveal Additional Info" button
  const handleUnlock = async () => {
    console.log("handleUnlock invoked");
    
    // If the user doesn't actually have any credits, bail out
    if ((userProfile?.motCredits || 0) < 1) {
      console.log("No credits, returning early");
      return;
    }

    console.log("Calling payMotCredit now...");
    const result = await payMotCredit();
    console.log("payMOTCredit result =>", result.data?.payMOTCredit);

    // Mark advanced data as unlocked
    setUnlocked(true);
  };

  // If no MOT data
  if (!data?.DataItems) {
    return <div className="alert alert-warning">No MOT data available.</div>;
  }

  const { VehicleDetails, VehicleStatus, MotHistory } = data.DataItems;

  // If partial data is missing
  if (!VehicleDetails || !VehicleStatus) {
    return <div className="alert alert-warning">Vehicle details or status not available.</div>;
  }

  // If the user still has free checks, we consider advanced data "locked" unless they pay to unlock
  const userHasFreeChecks = (userProfile?.freeMotChecksUsed || 0) < 3;
  const advancedLocked = userHasFreeChecks && !unlocked;

  console.log("userProfile:", userProfile);

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

      {advancedLocked ? (
        // Free check => advanced locked, show a "pay credit" button
        <div className="alert alert-info">
          <p>This is a free MOT check. Additional MOT history is locked.</p>
          {userProfile.motCredits > 0 ? (
            <>
              <p>
                You have {userProfile.motCredits} MOT credit(s). Use one to reveal additional info?
              </p>
              <button
                className="btn btn-primary"
                onClick={handleUnlock}
                disabled={creditLoading}
              >
                {creditLoading ? 'Processing...' : 'Reveal Additional Info'}
              </button>
            </>
          ) : (
            <p>
              You have 0 MOT credits.
              <a href="/credits" className="ms-1">Purchase more</a> to unlock advanced data.
            </p>
          )}
          {creditError && (
            <div className="alert alert-danger mt-2">{creditError.message}</div>
          )}
        </div>
      ) : (
        // If not locked => show advanced data from MotHistory
        MotHistory?.RecordList?.length > 0 ? (
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
        ) : (
          <div className="alert alert-info">
            No advanced records found for this vehicle.
          </div>
        )
      )}
    </div>
  );
}

export default MOTResultDisplay;
