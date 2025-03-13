import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { formatNumber } from '../utils/formatNumber';

export default function VehicleDetails({ dataItems, images, motapi }) {
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const manufacturer = dataItems.Make || 'N/A';
  const model = dataItems.Model || 'N/A';
  const engineCapacity = dataItems.EngineCapacity || 'N/A';
  const colour = dataItems.Colour || 'N/A';
  const yearOfManufacture = dataItems.YearOfManufacture || 'N/A';

  // For images
  const imageList = images?.DataItems?.VehicleImages?.ImageDetailsList || [];
  const firstImageUrl =
    imageList.length > 0 ? imageList[0].ImageUrl : '/placeholder-vehicle.jpg';

  // For MOT odometer
  const recordList = motapi.RecordList || [];
  let odometer = null;
  if (recordList.length > 0) {
    odometer = recordList[0].OdometerReading;
  }

  const handleImageClick = (imgUrl) => {
    setModalImage(imgUrl);
    setShowModal(true);
  };

  return (
    <div className="card mb-4" id="vehicleDetailsSection">
      <div className="card-header">
        <h3 className="mb-0">Vehicle Details</h3>
      </div>

      {/* 
        Use Bootstrap row/col layout:
        - col-12 col-md-4 for the image
        - col-12 col-md-8 for the table
        - order classes so image is first on mobile (order-1) but second on md (order-md-2)
      */}
      <div className="card-body">
        <div className="row">
          {/* TEXT DETAILS */}
          <div className="col-12 col-md-8 order-2 order-md-1 p-2">
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
                  <td>{odometer ? formatNumber(odometer) : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* IMAGE */}
          <div className="col-12 col-md-4 order-1 order-md-2 p-2 d-flex align-items-center justify-content-center">
            <img
              src={firstImageUrl}
              alt="Vehicle"
              className="img-fluid"
              style={{
                cursor: 'pointer',
                maxHeight: '250px',
                objectFit: 'cover',
              }}
              onClick={() => handleImageClick(firstImageUrl)}
            />
          </div>
        </div>
      </div>

      {/* Modal for larger image preview */}
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
