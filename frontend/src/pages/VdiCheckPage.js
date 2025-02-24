// src/pages/VdiCheckPage.js
import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { VDI_CHECK, VALUATION_CHECK } from '../graphql/queries';
import ValuationResultDisplay from '../components/ValuationResultDisplay';

function VdiCheckPage() {
  const [reg, setReg] = useState('');

  const [vdiCheck, { data: vdiData, loading: vdiLoading, error: vdiError }] = useLazyQuery(VDI_CHECK);
  const [valuationCheck, { data: valuationData, loading: valuationLoading, error: valuationError }] = useLazyQuery(VALUATION_CHECK);

  const handleVDICheck = async () => {
    // Trigger both queries in sequence
    await vdiCheck({ variables: { reg } });
    await valuationCheck({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">VDI Check & Valuation</h1>

      {/* Any errors */}
      {vdiError && <div className="alert alert-danger">VDI Error: {vdiError.message}</div>}
      {valuationError && <div className="alert alert-danger">Valuation Error: {valuationError.message}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Vehicle Registration"
          value={reg}
          onChange={(e) => setReg(e.target.value)}
        />
      </div>

      <button
        onClick={handleVDICheck}
        className="btn btn-primary"
        disabled={vdiLoading || valuationLoading}
      >
        {vdiLoading || valuationLoading ? 'Checking...' : 'Check VDI & Valuation'}
      </button>

      {/* VDI results (raw JSON dump) */}
      {vdiData && vdiData.vdiCheck && (
        <div className="mt-4">
          <h2>VDI Check Results</h2>
          <pre>{JSON.stringify(vdiData.vdiCheck, null, 2)}</pre>
        </div>
      )}

      {/* Valuation results */}
      {valuationData && valuationData.valuation && (
        <div className="mt-4">
          <h2>Valuation Results</h2>
          <ValuationResultDisplay
            data={valuationData.valuation} 
            isFreeSearch={false} 
          />
        </div>
      )}
    </div>
  );
}

export default VdiCheckPage;
