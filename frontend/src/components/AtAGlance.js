import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

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

  // 2) Retrieve ExpiryDate from the *first* MOT history record
  const recordList = motTaxStatus?.DataItems?.MotHistory?.RecordList || [];
  let motExpiryString = 'N/A';
  let isMotExpired = false;

  if (recordList.length > 0) {
    const expiryStr = recordList[0].ExpiryDate;
    if (expiryStr) {
      const motDate = dayjs(expiryStr, 'DD/MM/YYYY');
      if (motDate.isValid()) {
        motExpiryString = motDate.format('DD/MM/YYYY');
        if (motDate.isBefore(dayjs(), 'day')) {
          isMotExpired = true;
        }
      } else {
        motExpiryString = expiryStr;
      }
    }
  }

  // 3) Helper to pick color for each tile
  const tileStyle = (danger) =>
    `card p-2 m-2 ${danger ? 'bg-danger text-white' : 'bg-success text-white'}`;

  return (
    <>
      {/* -------------- INLINE STYLES -------------- */}
      <style>
        {`
          /* Example of custom CSS within this component */
          .card.p-2.m-2.text-white {
            text-align: center !important;
            text-decoration: none !important;
            font-weight: 600 !important;
            font-size: 21px !important;
          }

          /* Override the link style so it doesn't appear underlined */
          .card.p-2.m-2.text-white a {
            color: inherit;
            text-decoration: none;
          }
        `}
      </style>
      {/* ------------------------------------------ */}

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="mb-0">At a Glance</h3>
        </div>
        <div className="card-body">
          <div className="row g-3">

            {/* Finance */}
            <div className="col-md-3">
              <a href="#financeSection" className={tileStyle(hasFinance)}>
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
              <a href="#mileageAnomalySection" className={tileStyle(mileageAnomaly)}>
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
              <a href="#colourChangeSection" className={tileStyle(isColourChanged)}>
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

            {/* MOT Expiry (from first record) */}
            <div className="col-md-3">
              <a href="#motHistorySection" className={tileStyle(isMotExpired)}>
                <div>MOT Expiry Date</div>
                <div>
                  {motExpiryString}{' '}
                  {isMotExpired && motExpiryString !== 'N/A' && <span> - Expired</span>}
                  {!isMotExpired && motExpiryString !== 'N/A' && <span> ✓</span>}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
