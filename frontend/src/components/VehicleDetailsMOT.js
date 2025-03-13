import React from 'react';

export default function VehicleDetails({ dataItems }) {
  const manufacturer = dataItems.DataItems.VehicleDetails.Make || 'N/A';
  const model = dataItems.DataItems.VehicleDetails.Model || 'N/A';
  const colour = dataItems.DataItems.VehicleDetails.Colour || 'N/A';

  return (
    <div 
      className="card mb-4 mx-auto text-center" 
      id="vehicleDetailsSection"
      style={{ width: '60%', border: 'none' }} // 50% card width, centered horizontally
    >
      <div className="row">
        {/* Image column */}
        <div className="col-12 col-md-4 p-3 d-flex align-items-center justify-content-center">
          <img 
            src="/images/moticon.png" 
            alt="MOT" 
            className="img-fluid" 
          />
        </div>

        {/* Text details column */}
        <div className="col-12 col-md-8 p-3 d-flex align-items-center justify-content-center">
          <table 
            className="table table-borderless mb-0" 
            style={{ margin: 0 }}
          >
            <tbody>
              <tr>
                <td>Manufacturer: {manufacturer}</td>
              </tr>
              <tr>
                <td>Model: {model}</td>
              </tr>
              <tr>
                <td>Colour: {colour}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
