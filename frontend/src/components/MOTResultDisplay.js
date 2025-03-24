import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'bootstrap/dist/css/bootstrap.min.css';

dayjs.extend(customParseFormat);

export default function MOTResultDisplay({ motCheck }) {
 // console.log('MOTResultDisplay => motCheck =>', motCheck);
  // 1) Handle null or missing data
  if (!motCheck) {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h3>MOT History & Tax Status</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">No MOT data available.</div>
        </div>
      </div>
    );
  }

  // Extract top-level info
  const statusCode = motCheck.StatusCode || 'N/A';
  const statusMessage = motCheck.StatusMessage || 'N/A';

  // Vehicle Status => next MOT date info
  const vehicleStatus = motCheck.DataItems?.VehicleStatus || {};
  const { NextMotDueDate } = vehicleStatus;

  let daysUntilDue = null;
  let motIsExpired = false;
  if (NextMotDueDate) {
    const parsedDue = dayjs(NextMotDueDate, 'DD/MM/YYYY');
    if (parsedDue.isValid()) {
      const now = dayjs();
      const diff = parsedDue.diff(now, 'day'); // days difference
      daysUntilDue = diff;
      if (diff < 0) {
        motIsExpired = true;
      }
    }
  }

  // MOT History
  const motHistory = motCheck.DataItems?.MotHistory ?? {};
  const recordCount = motHistory.RecordCount || 0;
  const recordList = Array.isArray(motHistory.RecordList)
    ? motHistory.RecordList
    : [];

  // Helper for date formatting
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const parsed = dayjs(dateStr, 'DD/MM/YYYY');
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : dateStr;
  }

  // Color-code each record (Pass/Fail/Pass w/ advisories)
  function getRecordBorderClass(record) {
    if (record.TestResult === 'Fail') {
      return 'border-danger text-danger';
    }
    if (record.TestResult === 'Pass' && record.AdvisoryNoticeList?.length > 0) {
      return 'border-primary text-primary';
    }
    return 'border-success text-success'; // Pass, no advisories
  }

  // High-level: if not expired and we have records => valid
  const isMotValid = !motIsExpired && recordCount > 0;
  // Choose alert color: green if valid, red if expired
  const alertClass = isMotValid ? 'alert alert-success' : 'alert alert-danger';

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
    

        {/* High-level summary */}
        <div className={alertClass}>
          {isMotValid ? (
            <div>
              <strong>This vehicle has a valid MOT</strong>
              {daysUntilDue !== null && daysUntilDue >= 0 && (
                <span>
                  {' '}
                  (expires in {daysUntilDue} day{daysUntilDue === 1 ? '' : 's'})
                </span>
              )}
            </div>
          ) : (
            <div>
              <strong>This vehicle does not have a valid MOT.</strong>
              {daysUntilDue !== null && daysUntilDue < 0 && (
                <span>
                  {' '}
                  ({Math.abs(daysUntilDue)} day
                  {Math.abs(daysUntilDue) === 1 ? '' : 's'} past expiry)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Next MOT Due */}
        <div className="mb-4">
          <strong>Latest MOT Expiry:</strong>{' '}
          {NextMotDueDate ? formatDate(NextMotDueDate) : 'N/A'}
        </div>

        {/* Show summary of how many records in the MOT history */}
        <h5 className="mb-3">
          MOT Records Found: {recordCount}
        </h5>

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
              FailureReasonList,
            } = record;
          
            // If pass with advisories => "Pass (With Advisories)"
            let displayResult = TestResult;
            if (TestResult === 'Pass' && AdvisoryNoticeList?.length > 0) {
              displayResult = 'Pass (Advisories)';
            }
          
            // Existing function for border color classes
            function getRecordBorderClass(r) {
              if (r.TestResult === 'Fail') {
                return 'border-danger text-danger';
              }
              if (r.TestResult === 'Pass' && r.AdvisoryNoticeList?.length > 0) {
                return 'border-primary text-primary';
              }
              return 'border-success text-success'; // Pass, no advisories
            }
          
            // **New** function to pick a header background color
            function getHeaderBgClass(r) {
              if (r.TestResult === 'Fail') {
                return 'bg-danger text-white';
              }
              if (r.TestResult === 'Pass' && r.AdvisoryNoticeList?.length > 0) {
                return 'bg-primary text-white';
              }
              return 'bg-success text-white';
            }
          
            const recordClass = getRecordBorderClass(record);
            const headerBgClass = getHeaderBgClass(record);
          
            // Format date
            const testDateFormatted = formatDate(TestDate);
            const expiryDateFormatted = formatDate(ExpiryDate);
          
            return (
              <div className="col-12" key={idx}>
                {/* Combine the border classes with standard 'card' & margin */}
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
