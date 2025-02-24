import React from 'react';

function ValuationResultDisplay({ data, isFreeSearch }) {
  // Ensure that data, Response, and MetaDataForItems exist
  if (!data || !data.Response || !data.Response.MetaDataForItems) {
    return <p className="text-danger">No valuation data available.</p>;
  }

  const items = data.Response.MetaDataForItems;

  // Each field is expected to be an object with a Name property,
  // except for ValuationTime (which might be a string) and ValuationList (which is an array).
  const {
    VehicleDescription,
    Vrm,
    Mileage,
    PlateYear,
    ValuationBook,
    ExtractNumber,
    ValuationTime,
    ValuationList,
  } = items;

  return (
    <div className="card my-4 shadow-sm">
      <div className="card-header bg-info text-white">
        Valuation Details
      </div>
      <div className="card-body">
        <h5 className="card-title">
          Vehicle: {VehicleDescription ? VehicleDescription.Name : 'N/A'}
        </h5>
        <p className="card-text">
          <strong>Registration:</strong> {Vrm ? Vrm.Name : 'N/A'} <br />
          <strong>Mileage:</strong> {Mileage ? Mileage.Name : 'N/A'} <br />
          <strong>Plate Year:</strong> {PlateYear ? PlateYear.Name : 'N/A'}
        </p>
        {/* Show additional fields for advanced (paid) searches */}
        {!isFreeSearch && (
          <>
            <hr />
            <p className="card-text">
              <strong>Valuation Book:</strong> {ValuationBook ? ValuationBook.Name : 'N/A'} <br />
              <strong>Extract Number:</strong> {ExtractNumber ? ExtractNumber.Name : 'N/A'} <br />
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
