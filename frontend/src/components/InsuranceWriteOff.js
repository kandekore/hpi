import React from 'react';

export default function InsuranceWriteOff({ dataItems }) {
  const writeOffCategory = dataItems.WriteOffCategory || 'N/A';
  const writeOffDate = dataItems.WriteOffDate || 'N/A';
  const writeOffCount = dataItems.WriteOffRecordCount || 0;
  const writeOffRecordList = dataItems.WriteOffRecordList;

  // If no records at all
  if (!writeOffRecordList && writeOffCount === 0 && writeOffCategory === 'N/A') {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Insurance Write Off</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-success">
            No insurance write-off details found.
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show them
  return (
    <>
    <style>
  {`
    li {
      list-style: none;
      padding: 10px;
    }
  `}
</style>
  <div className="card">
      <div className="card-header">
        <h3>Insurance Write Off</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th>Write Off Category</th>
              <td>{writeOffCategory}</td>
            </tr>
            <tr>
              <th>Write Off Date</th>
              <td>{writeOffDate}</td>
            </tr>
            <tr>
              <th>Write Off Record Count</th>
              <td>{writeOffCount}</td>
            </tr>
            <tr>
              <th>Write Off Record List</th>
              <td>
                {writeOffRecordList && writeOffRecordList.length > 0 ? (
                  <ul>
                    {writeOffRecordList.map((item, idx) => (
                      <li key={idx}>
                        <strong>Loss Type:</strong> {item.LossType}<br/>
                        <strong>Category:</strong> {item.Category}<br/>
                        <strong>Loss Date:</strong> {item.LossDate}<br/>
                        <strong>MiaftrEntryDate:</strong> {item.MiaftrEntryDate}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
