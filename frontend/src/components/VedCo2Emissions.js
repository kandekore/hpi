import React from 'react';

// Data-driven CO₂ bands
const CO2_BANDS = [
  { letter: 'A', min: 0,   max: 100,  rangeLabel: '0–100 g/km',   color: '#8E44AD', width: 60 },
  { letter: 'B', min: 101, max: 110,  rangeLabel: '101–110 g/km', color: '#2E86C1', width: 100 },
  { letter: 'C', min: 111, max: 120,  rangeLabel: '111–120 g/km', color: '#1ABC9C', width: 120 },
  { letter: 'D', min: 121, max: 130,  rangeLabel: '121–130 g/km', color: '#27AE60', width: 140 },
  { letter: 'E', min: 131, max: 140,  rangeLabel: '131–140 g/km', color: '#F1C40F', width: 160 },
  { letter: 'F', min: 141, max: 150,  rangeLabel: '141–150 g/km', color: '#F39C12', width: 180 },
  { letter: 'G', min: 151, max: 165,  rangeLabel: '151–165 g/km', color: '#E67E22', width: 200 },
  { letter: 'H', min: 166, max: 175,  rangeLabel: '166–175 g/km', color: '#D35400', width: 220 },
  { letter: 'I', min: 176, max: 185,  rangeLabel: '176–185 g/km', color: '#C0392B', width: 240 },
  { letter: 'J', min: 186, max: 200,  rangeLabel: '186–200 g/km', color: '#A93226', width: 260 },
  { letter: 'K', min: 201, max: 225,  rangeLabel: '201–225 g/km', color: '#884EA0', width: 280 },
  { letter: 'L', min: 226, max: 255,  rangeLabel: '226–255 g/km', color: '#6E2C00', width: 300 },
  { letter: 'M', min: 256, max: 9999, rangeLabel: '256+ g/km',    color: '#000000', width: 320 },
];

// Subcomponent for 6‑mo & 12‑mo tax rate circles
function RateCircles({ title, sixMonth, twelveMonth }) {
  if (sixMonth == null && twelveMonth == null) return null;

  return (
    <div className="mb-4 text-center"> 
      <h5 className="mb-2">{title}</h5>
      <div className="d-flex flex-row gap-3 justify-content-center">
        {sixMonth != null && (
          <div className="rate-circle">
            <div className="rate-label">6 mo</div>
            <div className="rate-value">£{sixMonth}</div>
          </div>
        )}
        {twelveMonth != null && (
          <div className="rate-circle">
            <div className="rate-label">12 mo</div>
            <div className="rate-value">£{twelveMonth}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VedCo2Emissions({ co2Value, vedRate }) {
  const styles = `
    .co2-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 1rem;
    }
    .co2-card-header {
      background-color: #003366;
      color: #fff;
      text-align: center;
      padding: 1rem;
      border-bottom: 1px solid #ddd;
    }
    .co2-card-body {
      padding: 1rem;
    }

    .co2-tax-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .co2-col {
      flex: 1 1 0;
      min-width: 280px;
    }

    /* CO2 Title & Container */
    .co2-title {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      text-align: center;
    }
    .co2-bands-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    /* Each band row & bar + letter + indicator */
    .co2-band-row {
      display: flex;
      align-items: center;
      margin: 6px 0;
      /* Keep them on the same line */
      justify-content: flex-start;
    }

    /* Circle that shows the band letter (A,B,C...) */
    .co2-letter-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #fff;
      color: #000;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      border: 2px solid #ccc;
      flex-shrink: 0; /* so it doesn't squish */
    }

    /* The colored bar behind the text */
    .co2-bar {
      height: 32px;
      border-radius: 6px;
      color: #fff;
      font-weight: bold;
      display: flex;
      align-items: center;
      padding-left: 8px;
      flex-shrink: 0; /* so it doesn't squish too much */
    }

    /* The indicator: we place it on the right side, in the same row */
    .co2-indicator {
      background-color: #2E86C1;
      color: #fff;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      margin-left: auto; /* push it to the right of the row */
    }
    .co2-indicator-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: #fff;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;
      font-weight: bold;
      flex-shrink: 0;
    }

    /* Summary area under the chart */
    .co2-summary {
      display: flex;
      align-items: center;
      margin-top: 1rem;
      flex-wrap: wrap; 
      gap: 1rem;
    }
    .co2-summary-letter {
      background-color: #2E86C1;
      color: #fff;
      font-size: 1.5rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .co2-summary-details .co2-value {
      font-size: 1.2rem;
      font-weight: bold;
    }

    /* Tax Rate Circles */
    .rate-circle {
      width: 100px;
      height: 100px;
      background-color: #003366;
      color: #fff;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .rate-label {
      font-size: 0.8rem;
      margin-bottom: 2px;
    }
    .rate-value {
      font-size: 1.1rem;
    }

    /* On smaller screens, scale down the row so it stays on one line */
    @media (max-width: 500px) {
      .co2-band-row {
        transform: scale(0.9);
        transform-origin: left center;
      }
      .co2-indicator {
        font-size: 0.75rem;
        padding: 4px 8px;
      }
      .co2-indicator-circle {
        width: 22px;
        height: 22px;
        margin-right: 4px;
      }
      .co2-bar {
        font-size: 0.8rem;
      }
    }
  `;

  // If no co2Value and no vedRate => minimal message
  if (co2Value == null && !vedRate) {
    return (
      <>
        <style>{styles}</style>
        <div className="co2-card">
          <div className="co2-card-header">
            <h3>Emissions &amp; Tax Rates</h3>
          </div>
          <div className="co2-card-body">
            <p>No CO₂ data or Tax Rate data available.</p>
          </div>
        </div>
      </>
    );
  }

  // ----- Build up CO2 content -----
  let co2Content;
  if (co2Value != null) {
    const activeBand = CO2_BANDS.find(
      (band) => co2Value >= band.min && co2Value <= band.max
    );
    if (!activeBand) {
      co2Content = (
        <p>Emissions: {co2Value} g/km, but no matching band (A–M).</p>
      );
    } else {
      co2Content = (
        <>
          <div className="co2-title">CO₂ Banding</div>
          <div className="co2-bands-container">
            {CO2_BANDS.map((band) => {
              const isActive = band.letter === activeBand.letter;
              return (
                <div key={band.letter} className="co2-band-row">
                  <div className="co2-letter-circle">{band.letter}</div>
                  <div
                    className="co2-bar"
                    style={{
                      backgroundColor: band.color,
                      width: band.width,
                    }}
                  >
                    {/* Optionally, you can put text in the bar */}
                  </div>
                  {isActive && (
                    <div className="co2-indicator">
                      <div className="co2-indicator-circle">
                        {band.letter}
                      </div>
                      {band.rangeLabel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="co2-summary">
            <div
              className="co2-summary-letter"
              style={{ backgroundColor: activeBand.color }}
            >
              {activeBand.letter}
            </div>
            <div className="co2-summary-details">
              <div className="co2-value">
                {co2Value.toFixed(1)} g/km
              </div>
              <div>
                This is the estimated CO₂ (carbon dioxide) emission 
                level for the vehicle under standard test conditions.
              </div>
            </div>
          </div>
        </>
      );
    }
  } else {
    co2Content = <p>No CO₂ data available.</p>;
  }

  // ----- Build up VED/tax content -----
  let taxContent;
  if (!vedRate) {
    taxContent = <p>No vehicle tax rate data available.</p>;
  } else {
    const firstYear = vedRate.FirstYear || {};
    const standard = vedRate.Standard || {};
    const premium = vedRate.PremiumVehicle || {};
    const year2to6 = premium.YearTwoToSix || {};

    taxContent = (
      <>
        <h4 className="mb-3" style={{ textAlign: 'center' }}>
          Tax Rates
        </h4>
        <RateCircles
          title="First Year"
          sixMonth={firstYear.SixMonth}
          twelveMonth={firstYear.TwelveMonth}
        />
        <RateCircles
          title="Standard Rate"
          sixMonth={standard.SixMonth}
          twelveMonth={standard.TwelveMonth}
        />
        {(year2to6.SixMonth != null || year2to6.TwelveMonth != null) && (
          <RateCircles
            title="Premium (Years 2–6)"
            sixMonth={year2to6.SixMonth}
            twelveMonth={year2to6.TwelveMonth}
          />
        )}

        {firstYear.SixMonth == null &&
         firstYear.TwelveMonth == null &&
         standard.SixMonth == null &&
         standard.TwelveMonth == null &&
         (year2to6.SixMonth == null && year2to6.TwelveMonth == null) && (
          <p>No vehicle tax rate data available.</p>
        )}
      </>
    );
  }

  // Final render: side-by-side columns for CO2 + Tax
  return (
    <>
      <style>{styles}</style>
      <div className="co2-card">
        <div className="co2-card-header">
          <h3>Emissions &amp; Tax Rates</h3>
        </div>
        <div className="co2-card-body">
          <div className="co2-tax-row">
            {/* Left column => CO2 */}
            <div className="co2-col">
              {co2Content}
            </div>
            {/* Right column => Tax */}
            <div className="co2-col">
              {taxContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
