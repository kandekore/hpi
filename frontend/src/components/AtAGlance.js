import React from 'react';
import dayjs from 'dayjs';

export default function AtAGlance({ dataItems, motTaxStatus }) {
  // 1) Determine booleans for your existing fields
  const isWrittenOff = dataItems.WrittenOff === true;
  const financeRecordCount = dataItems.FinanceRecordCount || 0;
  const hasFinance = financeRecordCount > 0;
  const isStolen = dataItems.Stolen === true;
  const mileageAnomaly = dataItems.MileageAnomalyDetected === true;
  const isScrapped = dataItems.Scrapped === true;
  const colourChangeCount = dataItems.ColourChangeCount || 0;
  const isColourChanged = colourChangeCount > 0;
  const isImported = dataItems.Imported === true;

  // 2) Retrieve Next MOT Due Date from the new MOT & Tax Status data
  //    i.e. the result from fetchMotHistoryAndTaxStatusData(reg).
  //    This is typically at motTaxStatus.VehicleStatus.NextMotDueDate
  let motExpiryString = 'N/A';
  let isMotExpired = false;

  const nextMotDueDate = motTaxStatus?.VehicleStatus?.NextMotDueDate || null;
  if (nextMotDueDate) {
    // Attempt to parse it as a date:
    const motDate = dayjs(nextMotDueDate); 
    // If your data is guaranteed to be in ISO8601 or recognized by dayjs, 
    // you can parse directly. If the date is in dd/mm/yyyy, do:
    // const motDate = dayjs(nextMotDueDate, "DD/MM/YYYY");

    // Format for display:
    motExpiryString = motDate.isValid() 
      ? motDate.format('DD/MM/YYYY') 
      : nextMotDueDate; // fallback, in case parse fails

    // Check if it's before "today"
    if (motDate.isBefore(dayjs())) {
      isMotExpired = true;
    }
  }

  // 3) Helper to pick color for each tile
  const tileStyle = (danger) =>
    `card p-2 m-2 ${danger ? 'bg-danger text-white' : 'bg-success text-white'}`;

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3 className="mb-0">At a Glance</h3>
      </div>
      <div className="card-body">
        <div className="row g-3">

          {/* Finance */}
          <div className="col-md-3">
            <a href="#financeSection"
               className={tileStyle(hasFinance)}
               style={{ textDecoration: 'none' }}
            >
              <div>Outstanding Finance</div>
              <div>{hasFinance ? 'Finance Found' : 'Clear'}</div>
            </a>
          </div>

          {/* Insurance Written-off */}
          <div className="col-md-3">
            <a href="#writeoffSection" className={tileStyle(isWrittenOff)}>
              <div>Insurance Written-off</div>
              <div>{isWrittenOff ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* Stolen */}
          <div className="col-md-3">
            <a href="#stolenSection" className={tileStyle(isStolen)}>
              <div>Stolen</div>
              <div>{isStolen ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* Mileage anomaly */}
          <div className="col-md-3">
            <a href="#mileageAnomalySection"
               className={tileStyle(mileageAnomaly)}
            >
              <div>Mileage Anomaly</div>
              <div>{mileageAnomaly ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* Scrapped */}
          <div className="col-md-3">
            <a href="#scrappedSection" className={tileStyle(isScrapped)}>
              <div>Scrapped</div>
              <div>{isScrapped ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* Colour changed */}
          <div className="col-md-3">
            <a href="#colourChangeSection"
               className={tileStyle(isColourChanged)}
            >
              <div>Colour Changed</div>
              <div>{isColourChanged ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* Imported */}
          <div className="col-md-3">
            <a href="#importedSection" className={tileStyle(isImported)}>
              <div>Imported</div>
              <div>{isImported ? 'Yes' : 'No'}</div>
            </a>
          </div>

          {/* MOT Expiry */}
          <div className="col-md-3">
            <a href="#motHistorySection" className={tileStyle(isMotExpired)}>
              <div>MOT Expiry Date</div>
              <div>
                {motExpiryString}{' '}
                {isMotExpired && motExpiryString !== 'N/A' && <span> - Expired</span>}
                {!isMotExpired && motExpiryString !== 'N/A' && (
                  <span> ✓</span>
                )}
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
