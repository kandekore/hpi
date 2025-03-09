import React from 'react';

export default function OwnershipAndIdentity({ dataItems }) {
  // Extract fields
  const previousKeeperCount = dataItems.PreviousKeeperCount || 0;
  const plateChangeCount = dataItems.PlateChangeCount || 0;
  const plateChangeList = dataItems.PlateChangeList || [];

  // If there's effectively no ownership/plate data
  const noOwnershipData =
    previousKeeperCount === 0 &&
    plateChangeCount === 0 &&
    plateChangeList.length === 0;

  // If nothing found, show a friendly message
  if (noOwnershipData) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Ownership &amp; Identity</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-success">
            No ownership or plate change data found.
          </div>
        </div>
      </div>
    );
  }

  // Otherwise display what we have
  return (
    <div className="card">
      <div className="card-header">
        <h3>Ownership &amp; Identity</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm mb-3">
          <tbody>
            <tr>
              <th>Previous Keeper Count</th>
              <td>{previousKeeperCount}</td>
            </tr>
            <tr>
              <th>Plate Change Count</th>
              <td>{plateChangeCount}</td>
            </tr>
          </tbody>
        </table>

        {plateChangeList.length > 0 && (
          <>
            <h5>Plate Change History</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Previous VRM</th>
                  <th>Date Changed</th>
                </tr>
              </thead>
              <tbody>
                {plateChangeList.map((change, idx) => (
                  <tr key={idx}>
                    <td>{change.PreviousVrm || 'N/A'}</td>
                    <td>{change.DateChanged || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
