// src/components/ValuationAggregatorDisplay.js
import React from 'react';
import VehicleDetails from './VehicleDetails';
import ValuationResults from './ValuationResults';
import VehicleDetailsHistory from './VehicleDetailsHistory';

export default function ValuationAggregatorDisplay({ valData }) {
  console.log('valData', valData)
  // If no data => show warning
  if (!valData) {
    return <div className="alert alert-warning">No Valuation data available.</div>;
  }

  // destructure aggregator fields
  const { valuation, vehicleAndMotHistory, images } = valData;

  // If vehicleAndMotHistory exists, find the “vehicleDetails” portion
  // from vehicleAndMotHistory.DataItems.VehicleRegistration
  const vehicleDetails = vehicleAndMotHistory?.DataItems?.VehicleRegistration || {};

  // also get the MOT portion, if needed, for last recorded mileage in <VehicleDetails />
  const motApi = vehicleAndMotHistory?.DataItems?.MotHistory || {};

  return (
    <div className="container my-4">
      {/* 1) Show VehicleDetails card */}
       <VehicleDetails
              dataItems={vehicleDetails}
              motapi={motApi}
              images={images} 
            />
     

      {/* 2) Show a summary Valuation block (like Hpi does for quick “At a Glance”) */}
      <div className="mt-4">
        <ValuationResults
          valuation={valuation}
          isSummary
        />
      </div>

      {/* 3) Show the full Valuation block (the big table) */}
      <div className="mt-5" id="valuationSection">
        <ValuationResults valuation={valuation} />
      </div>
    </div>
  );
}
