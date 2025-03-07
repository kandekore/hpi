// src/components/ColourChange.js
import React from 'react';

export default function ColourChange({ dataItems }) {
  const currentColour = dataItems.Colour || 'N/A';
  const previousColour = dataItems.PreviousColour || 'N/A';
  const colourChangeCount = dataItems.ColourChangeCount || 0;
  const latestColourChangeDate = dataItems.LatestColourChangeDate || 'N/A';

  const hasChange = colourChangeCount > 0;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Colour Change</h3>
      </div>
      <div className="card-body">
        {hasChange ? (
          <>
            <div className="alert alert-warning">
              This vehicle has had {colourChangeCount} colour change(s).
            </div>
            <table className="table table-sm">
              <tbody>
                <tr>
                  <th>Previous Colour</th>
                  <td>{previousColour}</td>
                </tr>
                <tr>
                  <th>Latest Colour Change Date</th>
                  <td>{latestColourChangeDate}</td>
                </tr>
                <tr>
                  <th>Current Colour</th>
                  <td>{currentColour}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <div className="alert alert-success">No recorded colour changes.</div>
        )}
      </div>
    </div>
  );
}
