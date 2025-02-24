// src/pages/VdiCheckPage.js
import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { VDI_CHECK, VALUATION_CHECK } from '../graphql/queries';
import VdiResultDisplay from '../components/VdiResultDisplay';
import ValuationResultDisplay from '../components/ValuationResultDisplay';

function VdiCheckPage() {
  const [reg, setReg] = useState('');

  // For VDI
  const [vdiCheck, { data: vdiData, loading: vdiLoading, error: vdiError }] = useLazyQuery(VDI_CHECK);

  // For Valuation
  const [valuationCheck, { data: valuationData, loading: valuationLoading, error: valuationError }] = useLazyQuery(VALUATION_CHECK);

  const handleVDICheck = async () => {
    // First fetch VDI
    await vdiCheck({ variables: { reg } });
    // Then fetch Valuation
    await valuationCheck({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">VDI Check &amp; Valuation</h1>

      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="mb-3">Enter Vehicle Registration</h5>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="e.g. AB12CDE"
          value={reg}
          onChange={(e) => setReg(e.target.value)}
        />
        <button
          onClick={handleVDICheck}
          className="btn btn-primary"
          disabled={vdiLoading || valuationLoading}
        >
          {vdiLoading || valuationLoading ? 'Checking...' : 'Check VDI & Valuation'}
        </button>
      </div>

      {/* Error handling */}
      {vdiError && (
        <div className="alert alert-danger" role="alert">
          <strong>VDI Error:</strong> {vdiError.message}
        </div>
      )}
      {valuationError && (
        <div className="alert alert-danger" role="alert">
          <strong>Valuation Error:</strong> {valuationError.message}
        </div>
      )}

      {/* Render the user-friendly VDI result component */}
      {vdiData && vdiData.vdiCheck && (
        <VdiResultDisplay data={vdiData.vdiCheck} />
      )}

      {/* Render the user-friendly Valuation result component */}
      {valuationData && valuationData.valuation && (
        <ValuationResultDisplay
          data={valuationData.valuation}
          isFreeSearch={false}
        />
      )}
    </div>
  );
}

export default VdiCheckPage;
