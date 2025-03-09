// src/components/VehicleDetails.js
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { formatNumber } from '../utils/formatNumber';
// or from 'react-bootstrap' if you're using the standard approach
// Ensure you have bootstrap and react-bootstrap installed, or manually create a modal

export default function VehicleDetails({ dataItems, images, motapi}) {
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Possibly, the "last recorded mileage" might come from dataItems.MileageRecordList if present
  // or from dataItems.Mileage ?? "N/A"
  const manufacturer = dataItems.Make || 'N/A';
  const model = dataItems.Model || 'N/A';
  const engineCapacity = dataItems.EngineCapacity || 'N/A';
  const colour = dataItems.Colour || 'N/A';
  const yearOfManufacture = dataItems.YearOfManufacture || 'N/A';
  //const lastRecordedMileage = dataItems.Mileage || 'N/A';
// Instead of images?.VehicleImages...
const imageList = images?.DataItems?.VehicleImages?.ImageDetailsList || [];
const firstImageUrl = imageList.length > 0 
  ? imageList[0].ImageUrl
  : '/placeholder-vehicle.jpg';


  // const mileageRecords = vdiCheckFull?.DataItems?.MileageRecordList || [];
  // let lastMileage = 'N/A';
  // if (mileageRecords.length > 0) {
  //   // The first item is the newest if the array is already sorted descending
  //   const mostRecent = mileageRecords[0];
  //   lastMileage = mostRecent.Mileage ?? 'N/A';
  // }

// Safely access the array
const recordList = motapi.RecordList || [];

// Then check if it’s non-empty
let odometer = null;
if (recordList.length > 0) {
  // The first object in the array
  const firstRecord = recordList[0];
  // Extract the odometer
  odometer = firstRecord.OdometerReading;
}

console.log("First record odometer =>", odometer);

  const handleImageClick = (imgUrl) => {
    setModalImage(imgUrl);
    setShowModal(true);
  };

  return (
    <div className="card mb-4" id="vehicleDetailsSection">
      <div className="card-header">
        <h3 className="mb-0">Vehicle Details</h3>
      </div>
      <div className="card-body d-flex flex-row">
        {/* 1/3 for the image */}
        <div className="col-4 p-2 d-flex align-items-center justify-content-center">
        <img
        src={firstImageUrl}
        alt="Vehicle"
        className="img-fluid"
        style={{ cursor: 'pointer', maxHeight: '250px', objectFit: 'cover', verticalAlign: 'middle' }}
        onClick={() => handleImageClick(firstImageUrl)} 
      />
      
        </div>

        {/* 2/3 for the details */}
        <div className="col-8 p-2">
          <table className="table table-borderless mb-0">
            <tbody>
              <tr>
                <th>Manufacturer</th>
                <td>{manufacturer}</td>
              </tr>
              <tr>
                <th>Model</th>
                <td>{model}</td>
              </tr>
              <tr>
                <th>Engine Capacity (cc)</th>
                <td>{engineCapacity}</td>
              </tr>
              <tr>
                <th>Colour</th>
                <td>{colour}</td>
              </tr>
              <tr>
                <th>Year of Manufacture</th>
                <td>{yearOfManufacture}</td>
              </tr>
              <tr>
                <th>Last Recorded Mileage</th>
                <td>{formatNumber(odometer)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for large image preview */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vehicle Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {modalImage && (
            <img
              src={modalImage}
              alt="Large preview"
              className="img-fluid"
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
