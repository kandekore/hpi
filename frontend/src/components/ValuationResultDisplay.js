import React from 'react';

function ValuationResultDisplay({ data, isFreeSearch }) {
  // Check that data is available and structured as expected.
  if (!data || !data.Response || !data.Response.MetaDataForItems) {
    return <p className="text-danger">No valuation data available.</p>;
  }

  const items = data.Response.MetaDataForItems;
  // Destructure common fields
  const {
    VehicleDescription,
    Vrm,
    Mileage,
    PlateYear,
    // Fields available in advanced searches
    ValuationBook,
    ExtractNumber,
    ValuationTime,
    ValuationList
  } = items;

  return (
    <div className="card my-4 shadow-sm">
      <div className="card-header bg-info text-white">
        Valuation Details
      </div>
      <div className="card-body">
        <h5 className="card-title">Vehicle: {VehicleDescription || 'N/A'}</h5>
        <p className="card-text">
          <strong>Registration:</strong> {Vrm || 'N/A'} <br />
          <strong>Mileage:</strong> {Mileage || 'N/A'} <br />
          <strong>Plate Year:</strong> {PlateYear || 'N/A'}
        </p>
        {!isFreeSearch && (
          <>
            <hr />
            <p className="card-text">
              <strong>Valuation Book:</strong> {ValuationBook || 'N/A'} <br />
              <strong>Extract Number:</strong> {ExtractNumber || 'N/A'} <br />
              <strong>Valuation Time:</strong> {ValuationTime || 'N/A'}
            </p>
            {ValuationList && Array.isArray(ValuationList) && ValuationList.length > 0 && (
              <div>
                <h6>Valuation List:</h6>
                <ul className="list-group list-group-flush">
                  {ValuationList.map((val, idx) => (
                    <li key={idx} className="list-group-item">{val}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ValuationResultDisplay;
