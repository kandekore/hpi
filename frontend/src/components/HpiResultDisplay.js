// src/components/HpiResultDisplay.js
import React from 'react';
import VehicleDetails from './VehicleDetails';
import AtAGlance from './AtAGlance';
import OutstandingFinance from './OutstandingFinance';
import InsuranceWriteOff from './InsuranceWriteOff';
import MileageAnomaly from './MileageAnomaly';
import ColourChange from './ColourChange';
import MotResultDisplay from './MOTResultDisplay'; // you already have
import ValuationResults from './ValuationResults';
import StolenVehicleChecks from './StolenVehicleChecks';
import ScrappedInfo from './ScrappedInfo';
import ImportedInfo from './ImportedInfo';

export default function HpiResultDisplay({ hpiData, userProfile }) {
  console.log('hpiData:', hpiData);
  if (!hpiData) {
    return <div className="alert alert-warning">No HPI data available.</div>;
  }

  // We only want to use:
  //   vdiCheckFull,
  //   vehicleAndMotHistory,
  //   valuation,
  //   images

const { motTaxStatus } = hpiData;

// HpiResultDisplay.js
const { vdiCheckFull, vehicleAndMotHistory, valuation, images } = hpiData;

  // DataItems for convenience
  const dataItems = vdiCheckFull?.DataItems || {};

  // For the MOT, we'll assume vehicleAndMotHistory has the MOT data
  const motHistory = vehicleAndMotHistory?.MotHistory || {};

  // The images array might be in images?.VehicleImages?.ImageDetailsList or a similar structure
  // Example:
 // const vehicleImages = images?.VehicleImages?.ImageDetailsList || [];

  return (
    <div className="container my-4">
      <h2 className="mb-4">HPI Check Report</h2>

      {/* Vehicle Details Panel */}
      <VehicleDetails
      dataItems={dataItems}
      images={images}              // pass the entire images object
      vdiCheckFull={vdiCheckFull} // so the child can read MileageRecordList
    />

      {/* "At a Glance" section => anchors to sub-panels */}
     <AtAGlance
  dataItems={dataItems}
  motTaxStatus={motTaxStatus} // pass motTaxStatus exactly
/>

      {/* Valuation Summary (could be part of "At a Glance" or separate) */}
      {/* Or just a smaller summary that links to Valuation Results */}
      <div id="valuationSummary">
        <h3>Valuation Summary</h3>
        <p>
          {/* Example: Quick 3-value summary */}
        </p>
        {/* Could be replaced by a small subcomponent or a card group */}
        <ValuationResults
          valuation={valuation}
          isSummary
        />
      </div>

      {/* Detailed Panels (linked from AtAGlance) */}
      <div className="mt-5" id="financeSection">
        <OutstandingFinance dataItems={dataItems} />
      </div>

      <div className="mt-5" id="writeoffSection">
        <InsuranceWriteOff dataItems={dataItems} />
      </div>

      <div className="mt-5" id="mileageAnomalySection">
        <MileageAnomaly dataItems={dataItems} />
      </div>

      <div className="mt-5" id="colourChangeSection">
        <ColourChange dataItems={dataItems} />
      </div>

      <div className="mt-5" id="motHistorySection">
      <MotResultDisplay motCheck={motTaxStatus} />
      </div>

      <div className="mt-5" id="valuationSection">
        <ValuationResults valuation={valuation} />
      </div>

      <div className="mt-5" id="stolenSection">
        <StolenVehicleChecks dataItems={dataItems} />
      </div>

      <div className="mt-5" id="scrappedSection">
        <ScrappedInfo dataItems={dataItems} />
      </div>

      <div className="mt-5" id="importedSection">
        <ImportedInfo dataItems={dataItems} />
      </div>
    </div>
  );
}
