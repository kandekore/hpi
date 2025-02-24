// src/pages/VdiCheckPage.js
import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { VDI_CHECK, VALUATION_CHECK } from '../graphql/queries'; // Ensure you define VALUATION_CHECK appropriately
import ValuationResultDisplay from '../components/ValuationResultDisplay';

function VdiCheckPage() {
  const [reg, setReg] = useState('');
  const [vdiCheck, { data: vdiData, loading: vdiLoading, error: vdiError }] = useLazyQuery(VDI_CHECK);
  const [valuationCheck, { data: valuationData, loading: valuationLoading, error: valuationError }] = useLazyQuery(VALUATION_CHECK);

  const handleVDICheck = async () => {
    await vdiCheck({ variables: { reg } });
    await valuationCheck({ variables: { reg } });
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">VDI Check & Valuation</h1>
      {vdiError && <div className="alert alert-danger">{vdiError.message}</div>}
      {valuationError && <div className="alert alert-danger">{valuationError.message}</div>}
      <div className="mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Enter Vehicle Registration" 
          value={reg} 
          onChange={(e) => setReg(e.target.value)} 
        />
      </div>
      <button onClick={handleVDICheck} className="btn btn-primary" disabled={vdiLoading || valuationLoading}>
        {vdiLoading || valuationLoading ? 'Checking...' : 'Check VDI & Valuation'}
      </button>
      
      {/* Render valuation results */}
      {valuationData && (
        <div className="mt-4">
          <ValuationResultDisplay data={valuationData.valuation} isFreeSearch={false} />
        </div>
      )}
      {/* Optionally, render VDI data as well */}
    </div>
  );
}

export default VdiCheckPage;
