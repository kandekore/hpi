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
import OwnershipAndIdentity from './OwnershipAndIdentity';
import VehicleTaxRates from './VehicleTaxRates';
import VedCo2Emissions from './VedCo2Emissions';
import TechnicalDetails from './TechnicalDetails';
import VehicleDetailsHistory from './VehicleDetailsHistory';
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

  // Let's say in HpiResultDisplay or VehicleAndMotHistory
const vedRate = vehicleAndMotHistory?.DataItems?.VehicleStatus?.MotVed?.VedRate;

const co2Value = vehicleAndMotHistory?.DataItems?.VehicleStatus?.MotVed?.VedCo2Emissions;

const techDataItems = vehicleAndMotHistory?.DataItems || {};
const vinNo = vehicleAndMotHistory?.DataItems?.VehicleRegistration?.Vin;

const vehicleDetails = vehicleAndMotHistory?.DataItems.VehicleRegistration || {};

const motApi = vehicleAndMotHistory?.DataItems.MotHistory || {};
  // The images array might be in images?.VehicleImages?.ImageDetailsList or a similar structure
  // Example:
 // const vehicleImages = images?.VehicleImages?.ImageDetailsList || [];

  return (
    <>
    <style>
      {`.card-header {
    background-color: #003366;
    border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);
    color: #fff;
    margin-bottom: 0;
    padding: var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);
    text-align: center;
}`}
    </style>
    <div className="container my-4">
    

      {/* Vehicle Details Panel */}
      <VehicleDetailsHistory
      dataItems={vehicleDetails}
      motapi={motApi}
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
    
        <ValuationResults
          valuation={valuation}
          isSummary
        />
      </div>
    <div className="mt-5" id="ownershipAndIdentitySection">
         <OwnershipAndIdentity dataItems={vdiCheckFull?.DataItems || {}} vinNo={vinNo}/>
         </div>
         <div className="mt-5" id="co2Section"><VedCo2Emissions co2Value={co2Value} vedRate={vedRate} />
</div>
      {/* Detailed Panels (linked from AtAGlance) */}
      <div className="mt-5" id="financeSection">
        <OutstandingFinance dataItems={dataItems} />
      </div>

      <div className="mt-5" id="writeoffSection">
        <InsuranceWriteOff dataItems={dataItems} />
      </div>
      <div className="mt-5" id="stolenSection">
      <StolenVehicleChecks dataItems={dataItems} />
    </div>
      <div className="mt-5" id="mileageAnomalySection">
        <MileageAnomaly dataItems={dataItems} />
      </div>

      <div className="mt-5" id="motHistorySection">
      <MotResultDisplay motCheck={motTaxStatus} />
      </div>
      <div className="mt-5" id="scrappedSection">
        <ScrappedInfo dataItems={dataItems} />
      </div>
      <div className="mt-5" id="colourChangeSection">
      <ColourChange dataItems={dataItems} />
    </div>
      <div className="mt-5" id="importedSection">
        <ImportedInfo dataItems={dataItems} />
      </div>
    
      <div className="mt-5" id="valuationSection">
        <ValuationResults valuation={valuation} />
      </div>

<div className="mt-5" id="techSection"><TechnicalDetails dataItems={techDataItems} />
</div>
    </div>
    </>
  );
}
