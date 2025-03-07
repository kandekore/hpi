import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// or any date-fns / moment library for formatting dates, or a simple custom function

export default function MOTResultDisplay({ motCheck }) {
  // 1) Handle null or missing data
  if (!motCheck) {
    return (
      <div className="alert alert-warning">
        No MOT data available.
      </div>
    );
  }

  

  // In the real shape, everything is under DataItems:
  const vehicleStatus = motCheck.DataItems?.VehicleStatus;
  const motHistory = motCheck.DataItems?.MotHistory ?? {};

  // Then:
  const statusCode = motCheck.StatusCode || 'N/A';
  const statusMessage = motCheck.StatusMessage || 'N/A';

  const nextMotDueDate = vehicleStatus?.NextMotDueDate ?? 'N/A';
  const daysUntilNextMot = vehicleStatus?.DaysUntilNextMotIsDue ?? null;

  const recordCount = motHistory.RecordCount || 0;
  const recordList = Array.isArray(motHistory.RecordList)
    ? motHistory.RecordList
    : [];
  // 5) Optional date formatting helper
  dayjs.extend(customParseFormat);

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';  // guard if it's null or undefined
    const parsed = dayjs(dateStr, "DD/MM/YYYY");
    if (!parsed.isValid()) {
      return 'N/A'; // or some fallback
    }
    return parsed.format("DD/MM/YYYY"); // re-format as you like
  }

  return (
    <div className="card mt-4" id="motHistorySection">
      <div className="card-header">
        <h3>MOT History & Tax Status</h3>
      </div>
      <div className="card-body">

        {/* Example top-level status badges (if you want them) */}
        <div className="mb-2">
          <span className="badge bg-secondary me-2">Code: {statusCode}</span>
          <span className="badge bg-success">Message: {statusMessage}</span>
        </div>

        {/* Next MOT Due */}
        <div className="mb-3">
          <strong>Next MOT Due Date:</strong>{' '}
          {nextMotDueDate !== 'N/A'
            ? formatDate(nextMotDueDate)
            : 'N/A'}
          {daysUntilNextMot != null && (
            <span className="ms-2">
              ({daysUntilNextMot} days left)
            </span>
          )}
        </div>

        {/* Show summary of how many records in the MOT history */}
        <h5 className="mb-3">
          MOT Records Found: {recordCount}
        </h5>

        {/* MOT Records Table */}
        {recordCount < 1 ? (
          <div className="alert alert-info">
            No MOT history records found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Odometer</th>
                  <th>Result</th>
                  <th>Expiry Date</th>
                  <th>Advisories</th>
                  <th>Failures</th>
                </tr>
              </thead>
              <tbody>
                {recordList.map((record, idx) => {
                  const {
                    TestDate,
                    OdometerReading,
                    TestResult,
                    ExpiryDate,
                    AdvisoryNoticeList,
                    FailureReasonList,
                  } = record;

                  return (
                    <tr key={idx}>
                      <td>{formatDate(TestDate)}</td>
                      <td>
                        {OdometerReading?.toLocaleString() ?? 'N/A'} mi
                      </td>
                      <td>
                        {/* Possibly style "Passed"/"Failed" */}
                        {TestResult}
                      </td>
                      <td>
                        {ExpiryDate
                          ? formatDate(ExpiryDate)
                          : 'N/A'}
                      </td>
                      <td>
                        {AdvisoryNoticeList && AdvisoryNoticeList.length > 0 ? (
                          <ul className="mb-0">
                            {AdvisoryNoticeList.map((advice, i) => (
                              <li key={i}>{advice}</li>
                            ))}
                          </ul>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td>
                        {FailureReasonList && FailureReasonList.length > 0 ? (
                          <ul className="mb-0">
                            {FailureReasonList.map((fail, i) => (
                              <li key={i}>{fail}</li>
                            ))}
                          </ul>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
