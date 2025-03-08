import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'bootstrap/dist/css/bootstrap.min.css';  // ensure Bootstrap is imported somewhere

dayjs.extend(customParseFormat);

export default function MOTResultDisplay({ motCheck }) {
  // 1) Handle null or missing data
  if (!motCheck) {
    return (
      <div className="alert alert-warning">
        No MOT data available.
      </div>
    );
  }

  // Extract top-level info
  const statusCode = motCheck.StatusCode || 'N/A';
  const statusMessage = motCheck.StatusMessage || 'N/A';

  // Vehicle Status => next MOT date info
  const vehicleStatus = motCheck.DataItems?.VehicleStatus || {};
  const { NextMotDueDate } = vehicleStatus;

  // If the date is "DD/MM/YYYY", parse with customParseFormat
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
    // If pass + advisories
    if (record.TestResult === 'Pass' && record.AdvisoryNoticeList?.length > 0) {
      return 'border-primary text-primary';
    }
    // Pass, no advisories
    return 'border-success text-success';
  }

  // High-level: if not expired and we have records => valid
  const isMotValid = !motIsExpired && recordCount > 0;

  // Choose alert color: green if valid, red if expired
  const alertClass = isMotValid ? 'alert alert-success' : 'alert alert-danger';

  return (
    <div className="mt-4" id="motHistorySection">
      <h3>MOT History &amp; Tax Status</h3>

      {/* Status Code & Message (optional) */}
      <div className="mb-3">
        <span className="badge bg-secondary me-2">Code: {statusCode}</span>
        <span className="badge bg-success">Message: {statusMessage}</span>
      </div>

      {/* High-level summary */}
      <div className={alertClass}>
        {isMotValid ? (
          <div>
            <strong>This vehicle has a valid MOT</strong>
            {daysUntilDue != null && daysUntilDue >= 0 && (
              <span>
                {' '}
                (expires in {daysUntilDue} day{daysUntilDue === 1 ? '' : 's'})
              </span>
            )}
          </div>
        ) : (
          <div>
            <strong>This vehicle does not have a valid MOT.</strong>
            {daysUntilDue != null && daysUntilDue < 0 && (
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
        <strong>Next MOT Due Date:</strong>{' '}
        {NextMotDueDate
          ? formatDate(NextMotDueDate)
          : 'N/A'}
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
              displayResult = 'Pass (With Advisories)';
            }

            const recordClass = getRecordBorderClass(record);
            const testDateFormatted = formatDate(TestDate);
            const expiryDateFormatted = formatDate(ExpiryDate);

            return (
              <div className="col-12" key={idx}>
                <div className={`card ${recordClass} mb-2`}>
                  {/* Card header => date + result + test number */}
                  <div className="card-header d-flex justify-content-between">
                    <strong>
                      {testDateFormatted} - {displayResult}
                    </strong>
                    <span>Test #{TestNumber}</span>
                  </div>
                  <div className="card-body">
                    {/* Odometer & Expiry */}
                    <p>
                      <strong>Odometer:</strong>{' '}
                      {OdometerReading?.toLocaleString() ?? 'N/A'} mi
                      <br />
                      <strong>Expiry Date:</strong> {expiryDateFormatted}
                    </p>

                    {/* Advisories */}
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

                    {/* Failures */}
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
  );
}
