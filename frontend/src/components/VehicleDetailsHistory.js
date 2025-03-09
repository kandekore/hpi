import React from 'react';
import { formatNumber } from '../utils/formatNumber';

export default function VehicleDetails({ dataItems, motapi }) {
  // Basic data
  const manufacturer = dataItems.Make || 'N/A';
  const model = dataItems.Model || 'N/A';
  const engineCapacity = dataItems.EngineCapacity || 'N/A';
  const colour = dataItems.Colour || 'N/A';
  const yearOfManufacture = dataItems.YearOfManufacture || 'N/A';

  // Safely handle the MOT recordList to find last odometer
  const recordList = motapi?.RecordList || [];
  let odometer = null;
  if (recordList.length > 0) {
    odometer = recordList[0].OdometerReading; 
  }

  return (
    <div className="card mb-4" id="vehicleDetailsSection">
      <div className="card-header">
        <h3 className="mb-0">Vehicle Details</h3>
      </div>
      <div className="card-body">
        <div className="row row-cols-1 row-cols-sm-2 g-2">
          <div className="col">
            <strong>Manufacturer:</strong> {manufacturer}
          </div>
          <div className="col">
            <strong>Model:</strong> {model}
          </div>
          <div className="col">
            <strong>Engine Capacity (cc):</strong> {engineCapacity}
          </div>
          <div className="col">
            <strong>Colour:</strong> {colour}
          </div>
          <div className="col">
            <strong>Year of Manufacture:</strong> {yearOfManufacture}
          </div>
          <div className="col">
            <strong>Last Recorded Mileage:</strong> {formatNumber(odometer)}
          </div>
        </div>
      </div>
    </div>
  );
}
