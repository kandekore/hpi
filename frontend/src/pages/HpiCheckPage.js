import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { HPI_CHECK } from '../graphql/queries';
import HpiResultDisplay from '../components/HpiResultDisplay';

function HpiCheckPage() {
  const [reg, setReg] = useState('');
  const [fetchHpi, { loading, error, data }] = useLazyQuery(HPI_CHECK);

  const handleSearch = () => {
    if (!reg) return;
    fetchHpi({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1>Full HPI Check</h1>
      <p>
        A Full HPI Check combines multiple data sources—finance records, 
        outstanding finance, stolen checks, accident history, mileage anomalies, 
        plus VED and MOT data, all in one report.
      </p>
      <div className="input-group my-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Vehicle Reg"
          value={reg}
          onChange={(e) => setReg(e.target.value.toUpperCase())}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Run HPI Check
        </button>
      </div>

      {loading && <p>Loading HPI data...</p>}
      {error && <div className="alert alert-danger">Error: {error.message}</div>}

      {/* If data exists, pass it to a result display component */}
      {data && data.hpiCheck && (
        <HpiResultDisplay hpiData={data.hpiCheck} />
      )}
    </div>
  );
}

export default HpiCheckPage;
