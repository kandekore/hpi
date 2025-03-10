// src/components/VedCo2Emissions.js
import React from 'react';

// Data-driven CO₂ bands
const CO2_BANDS = [
  { letter: 'A', min: 0,   max: 100,  rangeLabel: '0-100 g/km',  color: '#8E44AD', width: 60 },
  { letter: 'B', min: 101, max: 110,  rangeLabel: '101-110 g/km',color: '#2E86C1', width: 100 },
  { letter: 'C', min: 111, max: 120,  rangeLabel: '111-120 g/km',color: '#1ABC9C', width: 120 },
  { letter: 'D', min: 121, max: 130,  rangeLabel: '121-130 g/km',color: '#27AE60', width: 140 },
  { letter: 'E', min: 131, max: 140,  rangeLabel: '131-140 g/km',color: '#F1C40F', width: 160 },
  { letter: 'F', min: 141, max: 150,  rangeLabel: '141-150 g/km',color: '#F39C12', width: 180 },
  { letter: 'G', min: 151, max: 165,  rangeLabel: '151-165 g/km',color: '#E67E22', width: 200 },
  { letter: 'H', min: 166, max: 175,  rangeLabel: '166-175 g/km',color: '#D35400', width: 220 },
  { letter: 'I', min: 176, max: 185,  rangeLabel: '176-185 g/km',color: '#C0392B', width: 240 },
  { letter: 'J', min: 186, max: 200,  rangeLabel: '186-200 g/km',color: '#A93226', width: 260 },
  { letter: 'K', min: 201, max: 225,  rangeLabel: '201-225 g/km',color: '#884EA0', width: 280 },
  { letter: 'L', min: 226, max: 255,  rangeLabel: '226-255 g/km',color: '#6E2C00', width: 300 },
  { letter: 'M', min: 256, max: 9999, rangeLabel: '256+ g/km',    color: '#000000', width: 320 },
];

// A helper subcomponent to draw two light-blue circles for 6-mo & 12-mo rates
// If both are null, returns nothing
function RateCircles({ title, sixMonth, twelveMonth }) {
  if (sixMonth == null && twelveMonth == null) return null;

  return (
    <div className="mb-4 text-center"> 
      <h5 className="mb-2">{title}</h5>

      {/* Use Bootstrap flex classes or a custom style to center horizontally */}
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


// Main component combines CO₂ chart (left) + Tax rates (right)
export default function VedCo2Emissions({ co2Value, vedRate }) {
  // Inline CSS for demonstration
  const css = `
    /* Card styles */
    .co2-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 1rem;
    }
    .co2-card-header {
      background-color: #f8f9fa;
      padding: 1rem;
      border-bottom: 1px solid #ddd;
    }
    .co2-card-body {
      padding: 1rem;
    }

    /* Row for CO2 (left) & tax (right) */
    .co2-tax-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .co2-col {
      flex: 1 1 0; /* Grow equally */
      min-width: 300px; /* so it doesn't collapse too narrow */
    }

    /* CO2 Chart */
    .co2-title {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .co2-bands-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .co2-band-row {
      position: relative;
      margin: 6px 0;
      display: flex;
      align-items: center; 
    }
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
    }
    .co2-bar {
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      color: #fff;
      font-weight: bold;
      padding-left: 8px;
    }
    .co2-indicator {
      position: absolute;
      top: 0;
      right: -160px; 
      background-color: #2E86C1;
      color: #fff;
      padding: 6px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      font-size: 0.9rem;
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
    }
    .co2-summary {
      display: flex;
      align-items: center;
      margin-top: 1rem;
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
      margin-right: 1rem;
      border-radius: 4px;
      font-weight: bold;
    }
    .co2-summary-details .co2-value {
      font-size: 1.2rem;
      font-weight: bold;
    }

    /* Tax Rate Circles */
    .rate-circle {
      width: 80px;
      height: 80px;
      background-color: #5bc0de; /* light blue */
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
      font-size: 1rem;
    }
      .co2-indicator {
    position: absolute;
    top: -7px;
    right: -250px;
}
    .rate-circle {
    width: 125px;
    height: 125px;
    background-color: #003366;
}
    .rate-value {
    font-size: 25px;
}
    .heading3 {    
    text-align: center;
    padding-bottom: 25px;}
    .co2-card-header {
    text-align: center;
    color: #fff;
    background: #003366;
    --bs-card-border-radius: var(--bs-border-radius);
    --bs-card-box-shadow: ;
    --bs-card-inner-border-radius: calc(var(--bs-border-radius) - var(--bs-border-width));
    --bs-card-cap-padding-y: 0.5rem;
    --bs-card-cap-padding-x: 1rem;
    --bs-card-cap-bg: rgba(var(--bs-body-color-rgb), 0.03);
}
  `;

  // QUICK CHECKS
  // If no co2Value and no vedRate, just show a minimal message
  if (co2Value == null && !vedRate) {
    return (
      <>
        <style>{css}</style>
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

  // === 1) Handle CO2 logic ===
  let co2Content = null;
  if (co2Value != null) {
    // Find band
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
          <div className="co2-title heading3">CO₂ Banding</div>
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
                  />
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
          {/* Summary */}
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
                This is the amount of Carbon Dioxide (CO₂) this vehicle
                emits based on standard EU tests.
              </div>
            </div>
          </div>
        </>
      );
    }
  } else {
    co2Content = (
      <p>No CO₂ data available.</p>
    );
  }

  // === 2) Handle Tax Rate logic ===
  let taxContent = null;
  if (!vedRate) {
    taxContent = <p>No vehicle tax rate data available.</p>;
  } else {
    const firstYear = vedRate.FirstYear || {};
    const standard = vedRate.Standard || {};
    const premium = vedRate.PremiumVehicle || {};
    const year2to6 = premium.YearTwoToSix || {};

    taxContent = (
      <>
        <h4 className="mb-3 heading3">Tax Rates</h4>

        {/* Show first year if there's any data */}
        <RateCircles
          title="First Year"
          sixMonth={firstYear.SixMonth}
          twelveMonth={firstYear.TwelveMonth}
        />

        {/* Show standard if there's any data */}
        <RateCircles
          title="Standard Rate"
          sixMonth={standard.SixMonth}
          twelveMonth={standard.TwelveMonth}
        />

        {/* Show Premium if YearTwoToSix is populated */}
        {(year2to6.SixMonth != null || year2to6.TwelveMonth != null) && (
          <RateCircles
            title="Premium (Years 2-6)"
            sixMonth={year2to6.SixMonth}
            twelveMonth={year2to6.TwelveMonth}
          />
        )}

        {/* If literally none of the above had data => mention it */}
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

  // === 3) Final Render: 2 columns => left = CO2, right = Tax
  return (
    <>
      <style>{css}</style>
      <div className="co2-card">
        <div className="co2-card-header">
          <h3>Emissions &amp; Tax Rates</h3>
        </div>
        <div className="co2-card-body">
          <div className="co2-tax-row">
            {/* Left: CO2 */}
            <div className="co2-col">
              {co2Content}
            </div>
            {/* Right: Tax */}
            <div className="co2-col tax-col">
              {taxContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
