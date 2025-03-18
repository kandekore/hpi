import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'bootstrap/dist/css/bootstrap.min.css';

dayjs.extend(customParseFormat);

/**
 * Use this component when your MOT data is nested under the valuation object
 * (e.g. `vehicleAndMotHistory.DataItems.MotHistory`) and you don't have status codes.
 *
 * Usage:
 * <ValuationMOTResultDisplay motData={theMotData} />
 */
export default function ValuationMOTResultDisplay({ motData }) {
  // 1) If there's no data at all, just show "No MOT data"
  console.log("motDataVal =>", motData); 
  if (!motData) {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h3>MOT History</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">No MOT data available.</div>
        </div>
      </div>
    );
  }

  // In your JSON, motData = {
  //   "RecordCount": 10,
  //   "RecordList": [ ... ],
  //   ...
  // }
  // But you also have "VehicleStatus" under the same parent in the snippet.
  // So you might pass in the entire "DataItems" object, or just the "MotHistory" portion.
  // For the snippet you showed, we do see a "VehicleStatus" in the same level.
  // If you're strictly passing motData = MotHistory, that's fine; then you won't have VehicleStatus here.

  // If your snippet includes `VehicleStatus` at the same level, you might do:
  //   const vehicleStatus = parentObj?.VehicleStatus; // if you pass that in separately
  //   const NextMotDueDate = vehicleStatus?.NextMotDueDate;

  // For now, let's assume you've parted out "MotHistory" specifically as motData:
  const recordCount = motData.RecordCount || 0;
  const recordList = Array.isArray(motData.RecordList) ? motData.RecordList : [];

  // If you want to handle "Next MOT due date" from "VehicleStatus", pass it from above or store it separately.
  // For example:
  // const nextMotDueDate = yourParentVehicleStatus?.NextMotDueDate;

  // Helper for date formatting
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    // Some MOT data might be "30/09/2022" or an ISO date.
    // Attempt a parse:
    let parsed = dayjs(dateStr, 'DD/MM/YYYY'); 
    // If that fails, try just dayjs(dateStr) 
    if (!parsed.isValid()) parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : dateStr;
  }

  // Function to pick CSS color classes
  function getRecordBorderClass(record) {
    if (record.TestResult === 'Fail') {
      return 'border-danger text-danger';
    }
    if (record.TestResult === 'Pass' && record.AdvisoryNoticeList?.length > 0) {
      return 'border-primary text-primary';
    }
    return 'border-success text-success'; // Pass, no advisories
  }

  function getHeaderBgClass(record) {
    if (record.TestResult === 'Fail') {
      return 'bg-danger text-white';
    }
    if (record.TestResult === 'Pass' && record.AdvisoryNoticeList?.length > 0) {
      return 'bg-primary text-white';
    }
    return 'bg-success text-white';
  }

  return (
    <div className="card mb-4" id="motHistorySection">
      <style>
        {`.card-header {
          background-color: #003366;
          border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);
          color: #fff;
          margin-bottom: 0;
          padding: var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);
          text-align: center;
        }`}
      </style>

      <div className="card-header">
        <h3>MOT History</h3>
      </div>

      <div className="card-body">
        {/* For a minimal summary, we can simply show how many records we have */}
        <h5 className="mb-3">MOT Records Found: {recordCount}</h5>

        {/* If no records => show info */}
        {recordCount < 1 ? (
          <div className="alert alert-warning">
            No MOT history records found.
          </div>
        ) : (
          <div className="row g-3">
            {recordList.map((record, idx) => {
              const {
                TestDate,
                ExpiryDate,
                TestResult,
                TestNumber,
                OdometerReading,
                AdvisoryNoticeList,
                FailureReasonList
              } = record;

              // If pass with advisories => "Pass (With Advisories)"
              let displayResult = TestResult;
              if (TestResult === 'Pass' && AdvisoryNoticeList?.length > 0) {
                displayResult = 'Pass (Advisories)';
              }

              const recordClass = getRecordBorderClass(record);
              const headerBgClass = getHeaderBgClass(record);

              // Format date
              const testDateFormatted = formatDate(TestDate);
              const expiryDateFormatted = formatDate(ExpiryDate);

              return (
                <div className="col-12" key={idx}>
                  <div className={`card ${recordClass} mb-2`}>
                    {/* The header also gets a dynamic color */}
                    <div className={`card-header d-flex justify-content-between ${headerBgClass}`}>
                      <strong>
                        {testDateFormatted} - {displayResult}
                      </strong>
                      <span>Test #{TestNumber}</span>
                    </div>
                    <div className="card-body">
                      <p>
                        <strong>Odometer:</strong>{' '}
                        {OdometerReading?.toLocaleString() ?? 'N/A'} mi
                        <br />
                        <strong>Expiry Date:</strong> {expiryDateFormatted}
                      </p>

                      {AdvisoryNoticeList && AdvisoryNoticeList.length > 0 && (
                        <div className="mb-2">
                          <strong>Advisories:</strong>
                          <ul className="mb-0">
                            {AdvisoryNoticeList.map((advice, i) => (
                              <li key={i}>{advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {FailureReasonList && FailureReasonList.length > 0 && (
                        <div>
                          <strong>Failures:</strong>
                          <ul className="mb-0">
                            {FailureReasonList.map((fail, i) => (
                              <li key={i}>{fail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
