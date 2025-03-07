import React from 'react';
import dayjs from 'dayjs';

/**
 * Utility: format date from e.g. "2022-01-03T00:00:00" to "03/01/2022"
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const parsed = dayjs(dateString);
  if (!parsed.isValid()) return 'N/A';
  return parsed.format('DD/MM/YYYY');
}

/**
 * Utility: to color-code a boolean
 * - If true => <span className="badge bg-danger">Yes</span>
 * - If false => <span className="badge bg-success">No</span>
 */
function booleanBadge(value) {
  // If not strictly boolean, handle gracefully
  if (value === true) {
    return <span className="badge bg-danger">Yes</span>;
  } else if (value === false) {
    return <span className="badge bg-success">No</span>;
  }
  return <span className="badge bg-secondary">N/A</span>;
}

/**
 * Utility: compute finance text
 * - If array is empty or null => "Clear"
 * - Otherwise => find if any finance agreement end date is in the future
 */
function financeStatus(financeRecordList) {
  if (!financeRecordList || financeRecordList.length === 0) {
    return {
      label: 'Finance clear',
      isClear: true,
    };
  }
  
  // Example logic: look at the *first* record or combine them if multiple
  const record = financeRecordList[0];
  // record.AgreementDate might be "2022-01-03T00:00:00"
  // record.AgreementTerm might be 61 (months)

  const start = dayjs(record.AgreementDate);
  if (!start.isValid()) {
    // If date not valid, fallback
    return {
      label: 'Finance record invalid date - check details',
      isClear: false,
    };
  }

  const end = start.add(record.AgreementTerm, 'month');
  const now = dayjs();

  if (end.isBefore(now)) {
    // Agreement ended
    return {
      label: 'Finance cleared',
      isClear: true,
    };
  }

  // If end is after now => financed until that date
  return {
    label: `Financed until ${end.format('DD/MM/YYYY')}`,
    isClear: false,
  };
}

/**
 * Example HPIResultDisplay
 * hpiData is an object containing:
 *  {
 *    reg, timestamp,
 *    vdiCheckFull,
 *    vedData,
 *    vehicleAndMotHistory,
 *    vehicleData,
 *    valuation,
 *    motTaxStatus,
 *    images,
 *    specAndOptions
 *  }
 */
export default function HPIResultDisplay({ hpiData }) {
  if (!hpiData) {
    return (
      <div className="alert alert-warning">
        No HPI data available. Make sure hpiCheck was called.
      </div>
    );
  }

  const {
    reg,
    timestamp,
    vdiCheckFull,
    vedData,
    vehicleAndMotHistory,
    vehicleData,
    valuation,
    motTaxStatus,
    images,
    specAndOptions,
  } = hpiData;

  const generatedDate = timestamp ? formatDate(timestamp) : 'N/A';

  // ------------------------------------------
  // 1) "At a Glance" style data – we can source from vdiCheckFull if needed
  //    For example, let's assume:
  //    vdiCheckFull.DataItems.WrittenOff, .Stolen, .Scrapped, .Imported, etc.
  // ------------------------------------------
  const glanceDataItems = vdiCheckFull?.DataItems || {};
  const isWrittenOff = glanceDataItems.WrittenOff ?? false;
  const isStolen = glanceDataItems.Stolen ?? false;
  const isScrapped = glanceDataItems.Scrapped ?? false;
  const isImported = glanceDataItems.Imported ?? false;
  const colorChangedCount = glanceDataItems.ColourChangeCount ?? 0;
  const mileageAnomaly = glanceDataItems.MileageAnomalyDetected ?? false;

  // Finance
  const financeList = glanceDataItems.FinanceRecordList ?? [];
  const financeResult = financeStatus(financeList);

  // Example of the "At a Glance" array
  const glanceCards = [
    {
      label: 'Outstanding Finance',
      value: financeResult.label,
      isClear: financeResult.isClear,
    },
    {
      label: 'Insurance Written-off',
      value: isWrittenOff ? 'Yes' : 'No',
      isClear: !isWrittenOff,
    },
    {
      label: 'Police Stolen',
      value: isStolen ? 'Yes' : 'No',
      isClear: !isStolen,
    },
    {
      label: 'Mileage Anomaly',
      value: mileageAnomaly ? 'Yes' : 'No',
      isClear: !mileageAnomaly,
    },
    {
      label: 'Scrapped',
      value: isScrapped ? 'Yes' : 'No',
      isClear: !isScrapped,
    },
    {
      label: 'Colour Changed',
      value: colorChangedCount > 0 ? `Yes (${colorChangedCount})` : 'No',
      isClear: colorChangedCount === 0,
    },
    {
      label: 'Imported',
      value: isImported ? 'Yes' : 'No',
      isClear: !isImported,
    },
    // ... etc. Add or remove items as needed
  ];

  // ------------------------------------------
  // 2) DVLA/Vehicle details – unify from vdiCheckFull or vehicleData
  //    We'll just pick fields from vdiCheckFull for example
  // ------------------------------------------
  const vehicleDetails = {
    Manufacturer: glanceDataItems.Make || 'N/A',
    Model: glanceDataItems.Model || 'N/A',
    FirstRegistered: formatDate(glanceDataItems.DateFirstRegistered),
    EngineCapacity: glanceDataItems.EngineCapacity ?? 'N/A',
    Colour: glanceDataItems.Colour || 'N/A',
    YearOfManufacture: glanceDataItems.YearOfManufacture || 'N/A',
    // and so on...
  };

  // ------------------------------------------
  // 3) MOT History – we might get from vehicleAndMotHistory, or vdiCheckFull
  //    Here let's assume vehicleAndMotHistory has "MotHistory" object
  // ------------------------------------------
  const motHistory = vehicleAndMotHistory?.MotHistory?.RecordList || [];
  // parse them for display

  // ------------------------------------------
  // 4) Valuation – from .valuation data
  // ------------------------------------------
  const valuationItems = valuation?.DataItems?.ValuationList || {};

  // ------------------------------------------
  // Render the big, sectioned layout
  // ------------------------------------------
  return (
    <div className="container-fluid my-3">
      {/* Title / summary */}
      <div className="row">
        <div className="col-12">
          <h2>HPI / VDI Report for: {reg || 'N/A'}</h2>
          <p>
            Generated on: <strong>{generatedDate}</strong>
          </p>
        </div>
      </div>

      {/* "At a Glance" Section */}
      <div id="AtAGlance" className="mt-4">
        <h3>At a Glance</h3>
        <div className="row">
          {glanceCards.map((item, idx) => {
            // Determine color: green if isClear, red otherwise
            const colorClass = item.isClear ? 'AllClear' : 'Warning'; 
            // Could also do: 'badge bg-success' or 'badge bg-danger'
            return (
              <div key={idx} className="col-md-4 col-sm-6 col-xs-12 mb-2">
                <div className="border p-2 d-flex justify-content-between">
                  <strong>{item.label}</strong>
                  <span className={colorClass}>{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DVLA/Vehicle Details */}
      <div id="VehicleDetails" className="mt-4">
        <h3>DVLA Vehicle Details</h3>
        <div className="row">
          <div className="col-md-4 col-sm-6 mb-2">
            <label>Manufacturer</label>
            <div className="border p-2">{vehicleDetails.Manufacturer}</div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <label>Model</label>
            <div className="border p-2">{vehicleDetails.Model}</div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <label>Engine Capacity (cc)</label>
            <div className="border p-2">{vehicleDetails.EngineCapacity}</div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <label>Colour</label>
            <div className="border p-2">{vehicleDetails.Colour}</div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <label>Year of Manufacture</label>
            <div className="border p-2">{vehicleDetails.YearOfManufacture}</div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <label>First Registered</label>
            <div className="border p-2">{vehicleDetails.FirstRegistered}</div>
          </div>
        </div>
      </div>

      {/* Finance Section */}
      <div id="Finance" className="mt-4">
        <h3>Outstanding Finance</h3>
        {financeList.length === 0 ? (
          <div className="alert alert-success">No recorded finance entries. (Clear)</div>
        ) : (
          <div className={`alert ${financeResult.isClear ? 'alert-success' : 'alert-danger'}`}>
            {financeResult.label}
            <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(financeList, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* MOT History */}
      <div id="MOTHistory" className="mt-4">
        <h3>MOT History</h3>
        {motHistory.length === 0 ? (
          <div className="alert alert-info">No MOT records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Mileage</th>
                  <th>Result</th>
                  {/* add any other fields if exist */}
                </tr>
              </thead>
              <tbody>
                {motHistory.map((r, i) => (
                  <tr key={i}>
                    <td>{formatDate(r.TestDate)}</td>
                    <td>{r.OdometerReading ?? 'N/A'}</td>
                    <td>{r.TestResult ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Valuation */}
      <div id="Valuation" className="mt-4">
        <h3>Valuation Results</h3>
        {Object.keys(valuationItems).length === 0 ? (
          <div className="alert alert-info">No valuation data.</div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Description</th>
                <th>Valuation (GBP)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(valuationItems).map(([desc, val]) => (
                <tr key={desc}>
                  <td>{desc}</td>
                  <td>£{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* You can continue adding sections for:
          - Plate transfers
          - Keeper changes
          - Scrapped data
          - etc.
         Each section can reference the relevant data from vdiCheckFull or other API structures. 
      */}

      {/* Example Additional Section: Stolen Data */}
      <div id="StolenData" className="mt-4">
        <h3>Stolen Vehicle Checks</h3>
        <p>
          Stolen: {booleanBadge(isStolen)}
        </p>
        {/* Show Police force, StolenDate, etc. if relevant */}
      </div>

      {/* If you want to show raw data for debugging: */}
      {/* 
      <pre>{JSON.stringify(hpiData, null, 2)}</pre>
      */}
    </div>
  );
}

