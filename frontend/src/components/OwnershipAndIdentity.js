import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';  // or your preferred modal
import Button from 'react-bootstrap/Button'; // if using react-bootstrap buttons
// You can also use FontAwesome or react-icons for tick/cross icons, e.g.:
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function UkPlateDisplay({ vrm }) {
  // Inline example; move to your CSS file if you prefer
  const plateStyles = `
    .uk-plate-container {
      display: inline-flex;
      align-items: center;
      border: 2px solid #000;  /* black border around plate */
      border-radius: 4px;
      overflow: hidden;        /* corners on left strip */
      font-weight: bold;
      font-family: sans-serif;
    }
    .uk-plate-blue {
      background-color: #003399; /* or any "Euro blue" shade */
      color: #fff;
      padding: 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .uk-plate-blue span {
      font-size: 0.7rem;  /* "GB" text smaller */
    }
    .uk-plate-yellow {
      background-color: #FFEB3B; /* bright yellow */
      color: #000;              /* black text */
      padding: 0 8px;
      font-size: 1rem;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
    }
      .uk-plate-container {

    background: #013399;
}
    table.table.table-sm.noborder.plate {
    text-align: center;
}
    h5 {
    text-align: center;}
  `;

  return (
    <>
      <style>{plateStyles}</style>
      <div className="uk-plate-container">
        <div className="uk-plate-blue">
          <span>GB</span>
        </div>
        <div className="uk-plate-yellow">
          {vrm}
        </div>
      </div>
    </>
  );
}


export default function OwnershipAndIdentity({ dataItems, vinNo }) {
  console.log('OwnershipAndIdentity => vinNo =>', vinNo);
  const [showModal, setShowModal] = useState(false);
  const [userVin, setUserVin] = useState('');  // the VIN the user types
  const [checkResult, setCheckResult] = useState(null); 
  // can be true, false, or null meaning "not checked yet"

  // Ownership fields
  const previousKeeperCount = dataItems.PreviousKeeperCount || 0;
  const plateChangeCount = dataItems.PlateChangeCount || 0;
  const plateChangeList = dataItems.PlateChangeList || [];
  const VinLast5 = dataItems.VinLast5 || 'N/A';

  const noOwnershipData =
    previousKeeperCount === 0 &&
    plateChangeCount === 0 &&
    plateChangeList.length === 0;

  if (noOwnershipData) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Ownership &amp; Identity</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-success">
            No ownership or plate change data found.
          </div>
        </div>
      </div>
    );
  }

  // Handlers for the modal
  const handleOpenModal = () => {
    setShowModal(true);
    setUserVin('');        // reset input
    setCheckResult(null);  // reset check result
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Compare user input to vinNo (case-insensitive)
  const handleCheckVin = () => {
    if (userVin.trim().toUpperCase() === (vinNo || '').toUpperCase()) {
      setCheckResult(true);
    } else {
      setCheckResult(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Ownership &amp; Identity</h3>
      </div>
      <div className="card-body">
        <table className="table table-sm mb-3">
          <tbody>
            <tr>
              <th>Previous Keeper Count</th>
              <td>{previousKeeperCount}</td>
            </tr>
            <tr>
              <th>Plate Change Count</th>
              <td>{plateChangeCount}</td>
            </tr>
            <tr>
              <th>
                Last 5 of Vin No{' '}
                {/* Link or button to open the modal */}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={handleOpenModal}
                  style={{ textDecoration: 'underline' }}
                >
                  (Check VIN Number)
                </Button>
              </th>
              <td>{VinLast5}</td>
            </tr>
          </tbody>
        </table>

        {plateChangeList.length > 0 && (
          <>
            <h5>Plate Change History</h5>
            {/* Remove table-bordered, or override it in CSS */}
            <table className="table table-sm noborder plate">
              <thead>
                <tr>
                  <th>Previous VRM</th>
                  <th>Date Changed</th>
                </tr>
              </thead>
              <tbody>
                {plateChangeList.map((change, idx) => (
                  <tr key={idx}>
                    <td>
                      {change.PreviousVrm 
                        ? <UkPlateDisplay vrm={change.PreviousVrm} />
                        : 'N/A'
                      }
                    </td>
                    <td>{change.DateChanged || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        
      </div>

      {/* Modal for checking the VIN */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Check VIN Number</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the full VIN or an expected substring, then click "Check"</p>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter VIN"
            value={userVin}
            onChange={(e) => setUserVin(e.target.value)}
          />
          {checkResult === true && (
            <div className="alert alert-success d-flex align-items-center">
              <FaCheckCircle className="me-2" />
              Correct VIN Number
            </div>
          )}
          {checkResult === false && (
            <div className="alert alert-danger d-flex align-items-center">
              <FaTimesCircle className="me-2" />
              Wrong VIN Number
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCheckVin}>
            Check
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
