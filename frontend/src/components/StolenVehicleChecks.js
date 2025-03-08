// src/components/StolenVehicleChecks.js
import React from 'react';

export default function StolenVehicleChecks({ dataItems }) {
  const {
    StolenContactNumber,
    StolenDate,
    StolenInfoSource,
    StolenMiaftrRecordCount,
    StolenMiaftrRecordList,
    StolenPoliceForce,
    StolenStatus,
  } = dataItems;

  // If no info at all
  const isEmpty =
    !StolenContactNumber &&
    !StolenDate &&
    !StolenInfoSource &&
    !StolenMiaftrRecordCount &&
    !StolenPoliceForce &&
    !StolenStatus;

  if (isEmpty) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Stolen Vehicle Checks</h3>
        </div>
        <div className="card-body">
          <p className="alert alert-success">No stolen data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Stolen Vehicle Checks</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th>Stolen Contact Number</th>
              <td>{StolenContactNumber || 'N/A'}</td>
            </tr>
            <tr>
              <th>Stolen Date</th>
              <td>{StolenDate || 'N/A'}</td>
            </tr>
            <tr>
              <th>Stolen Info Source</th>
              <td>{StolenInfoSource || 'N/A'}</td>
            </tr>
            <tr>
              <th>Stolen Police Force</th>
              <td>{StolenPoliceForce || 'N/A'}</td>
            </tr>
            <tr>
              <th>Stolen MIAFTR Record Count</th>
              <td>{StolenMiaftrRecordCount ?? '0'}</td>
            </tr>
            <tr>
            <th>Stolen MIAFTR Record List</th>
            <td>
              {Array.isArray(StolenMiaftrRecordList) && StolenMiaftrRecordList.length > 0 ? (
                <ul>
                  {StolenMiaftrRecordList.map((item, idx) => (
                    <li key={idx}>
                      {/* Render each field as needed */}
                      {/* e.g. item.SomeField, item.OtherField, or just JSON.stringify(item) */}
                      {JSON.stringify(item)} 
                    </li>
                  ))}
                </ul>
              ) : (
                'N/A'
              )}
            </td>
          </tr>
          
            <tr>
              <th>Stolen Status</th>
              <td>{StolenStatus || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
