// src/components/VehicleTaxRates.jsimport React from 'react';

// A small helper component to render two circles for 6-month and 12-month
function RateCircles({ title, sixMonth, twelveMonth }) {
  // If neither rate is available, skip rendering entirely
  if (sixMonth == null && twelveMonth == null) {
    return null;
  }

  return (
    <div className="mb-4">
      <h5 className="mb-3">{title}</h5>
      <div className="d-flex flex-row gap-3">
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

export default function VehicleTaxRates({ vedRate }) {
  // If no data at all, show a friendly alert
  if (!vedRate) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Vehicle Excise Duty (Tax) Rates</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">No VED rate data found.</div>
        </div>
      </div>
    );
  }

  // Destructure the typical shape
  const firstYear = vedRate.FirstYear || {};
  const standard = vedRate.Standard || {};
  const premiumVehicle = vedRate.PremiumVehicle || {};

  // If PremiumVehicle has YearTwoToSix, we only want to show it if there's data
  const yearTwoToSix = premiumVehicle.YearTwoToSix || {};

  return (
    <>
      {/* Inline CSS for demonstration. Consider moving this to an external .css file. */}
      <style>{`
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
          font-size: 0.9rem;
        }
        .rate-value {
          font-size: 1rem;
        }
      `}</style>

      <div className="card">
        <div className="card-header">
          <h3>Vehicle Excise Duty (Tax) Rates</h3>
        </div>
        <div className="card-body">
          {/* 1) First Year (Only show if data is present) */}
          <RateCircles
            title="First Year Rate"
            sixMonth={firstYear.SixMonth}
            twelveMonth={firstYear.TwelveMonth}
          />

          {/* 2) Standard (Only show if data is present) */}
          <RateCircles
            title="Standard Rate"
            sixMonth={standard.SixMonth}
            twelveMonth={standard.TwelveMonth}
          />

          {/* 3) Premium Vehicle - Only if YearTwoToSix actually has data */}
          {yearTwoToSix.SixMonth != null || yearTwoToSix.TwelveMonth != null ? (
            <RateCircles
              title="Premium Vehicle (Years 2-6)"
              sixMonth={yearTwoToSix.SixMonth}
              twelveMonth={yearTwoToSix.TwelveMonth}
            />
          ) : null}

          {/* If everything was empty, show an alert */}
          {firstYear.SixMonth == null && firstYear.TwelveMonth == null &&
           standard.SixMonth == null && standard.TwelveMonth == null &&
           (yearTwoToSix.SixMonth == null && yearTwoToSix.TwelveMonth == null) && (
            <div className="alert alert-info">
              No vehicle tax rate data available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
