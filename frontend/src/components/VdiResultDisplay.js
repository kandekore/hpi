// src/components/VdiResultDisplay.js
import React from 'react';

/**
 * Sample VDI response structure (truncated):
 * {
 *   "StatusCode": "Success",
 *   "StatusMessage": "Success",
 *   "DataItems": {
 *     "DateFirstRegisteredUk": "15/06/2012",
 *     "WriteOffDate": null,
 *     "Make": "VOLKSWAGEN",
 *     "EngineCapacity": 1968,
 *     ...
 *     "VehicleImages": {
 *       "ImageDetailsCount": 1,
 *       "ImageDetailsList": [
 *         {
 *           "ImageUrl": "https://cdn2.vdicheck.com/VehicleImages/Image.ashx?Id=...",
 *           "ExpiryDate": "2025-02-27T00:00:00",
 *           "ViewPoint": "Exterior_Angle270"
 *         }
 *       ]
 *     },
 *     ...
 *   }
 * }
 */

function VdiResultDisplay({ data }) {
  // console.log("VDI Data =>", data);

  // If no data is given, show an alert
  if (!data) {
    return <div className="alert alert-warning">No VDI data available.</div>;
  }

  const { StatusCode, StatusMessage, DataItems } = data;

  // If DataItems is missing, we can't display the fields
  if (!DataItems) {
    return (
      <div className="alert alert-info">
        The response is missing DataItems. Nothing to display.
      </div>
    );
  }

  // Extract relevant fields from DataItems, including VehicleImages
  const {
    // Image stuff
    VehicleImages,

    // Various fields below
    DateFirstRegisteredUk,
    WriteOffDate,
    Make,
    EngineCapacity,
    FinanceRecordList,
    WrittenOff,
    VicTestDate,
    WriteOffRecordList,
    CertificateOfDestructionIssued,
    TransmissionType,
    PreviousKeepers,
    LatestKeeperChangeDate,
    PreviousColour,
    Model,
    PlateChangeList,
    Vrm,
    StolenContactNumber,
    ScrapDate,
    ImportedFromOutsideEu,
    ColourChangeCount,
    VicTested,
    Imported,
    StolenPoliceForce,
    LookupStatusCode,
    StolenMiaftrRecordList,
    GearCount,
    LatestV5cIssuedDate,
    StolenInfoSource,
    FuelType,
    StolenDate,
    WriteOffRecordCount,
    LatestColourChangeDate,
    MileageRecordList,
    ImportUsedBeforeUkRegistration,
    MileageAnomalyDetected,
    StolenStatus,
    StolenMiaftrRecordCount,
    MileageRecordCount,
    LookupStatusMessage,
    Scrapped,
    HighRiskRecordCount,
    Stolen,
    ImportDate,
    Exported,
    HighRiskRecordList,
    WriteOffCategory,
    ExportDate,
    VinLast5,
    VicTestResult,
    Data,
    DateFirstRegistered,
    Colour,
    PlateChangeCount,
    PreviousKeeperCount,
    FinanceRecordCount,
    YearOfManufacture,
  } = DataItems;
  const imageList = data?.DataItems?.VehicleImages?.ImageDetailsList;
  // console.log("imageList =>", imageList);
    const vehicleImageUrl =imageList[0].ImageUrl;

      // console.log("vehicleImageUrl =>", vehicleImageUrl);
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <h4 className="mb-3">VDI Check Details</h4>

      {/* Show top-level status info */}
      <div className="mb-3">
        <span className="badge bg-secondary me-2">
          Code: {StatusCode}
        </span>
        <span className="badge bg-success">
          Message: {StatusMessage}
        </span>
      </div>

      {/* Display the image (if any) above the table */}
      <div className="mb-4 text-center">
      <img
      src={vehicleImageUrl}
      alt="Vehicle"
      className="img-fluid"
      style={{ maxHeight: '300px', objectFit: 'contain' }}
    />
    
      </div>

      {/* Big table of every field from DataItems */}
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th scope="col" style={{ width: '40%' }}>Field</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row for each field */}
            <tr>
              <td>DateFirstRegisteredUk</td>
              <td>{DateFirstRegisteredUk ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>WriteOffDate</td>
              <td>{WriteOffDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Make</td>
              <td>{Make ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>EngineCapacity</td>
              <td>{EngineCapacity ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>FinanceRecordList</td>
              <td>{FinanceRecordList ? JSON.stringify(FinanceRecordList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>WrittenOff</td>
              <td>{String(WrittenOff ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>VicTestDate</td>
              <td>{VicTestDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>WriteOffRecordList</td>
              <td>{WriteOffRecordList ? JSON.stringify(WriteOffRecordList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>CertificateOfDestructionIssued</td>
              <td>{CertificateOfDestructionIssued ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>TransmissionType</td>
              <td>{TransmissionType ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PreviousKeepers</td>
              <td>{PreviousKeepers ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>LatestKeeperChangeDate</td>
              <td>{LatestKeeperChangeDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PreviousColour</td>
              <td>{PreviousColour ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Model</td>
              <td>{Model ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PlateChangeList</td>
              <td>{PlateChangeList ? JSON.stringify(PlateChangeList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>Vrm</td>
              <td>{Vrm ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>StolenContactNumber</td>
              <td>{StolenContactNumber ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ScrapDate</td>
              <td>{ScrapDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ImportedFromOutsideEu</td>
              <td>{String(ImportedFromOutsideEu ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>ColourChangeCount</td>
              <td>{ColourChangeCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>VicTested</td>
              <td>{VicTested ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Imported</td>
              <td>{String(Imported ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>StolenPoliceForce</td>
              <td>{StolenPoliceForce ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>LookupStatusCode</td>
              <td>{LookupStatusCode ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>StolenMiaftrRecordList</td>
              <td>{StolenMiaftrRecordList ? JSON.stringify(StolenMiaftrRecordList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>GearCount</td>
              <td>{GearCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>LatestV5cIssuedDate</td>
              <td>{LatestV5cIssuedDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>StolenInfoSource</td>
              <td>{StolenInfoSource ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>FuelType</td>
              <td>{FuelType ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>StolenDate</td>
              <td>{StolenDate ?? 'N/A'}</td>
            </tr>

            {/* Example custom table within a table for MileageRecordList */}
            <tr>
              <td>Mileage at MOT's</td>
              <td>
                {MileageRecordList && MileageRecordList.length > 0 ? (
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Mileage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MileageRecordList.map((record, idx) => (
                        <tr key={idx}>
                          <td>{record.DateOfInformation ?? 'N/A'}</td>
                          <td>{record.Mileage ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>

            <tr>
              <td>LatestColourChangeDate</td>
              <td>{LatestColourChangeDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>MileageRecordList</td>
              <td>{MileageRecordList ? JSON.stringify(MileageRecordList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>ImportUsedBeforeUkRegistration</td>
              <td>{ImportUsedBeforeUkRegistration ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>MileageAnomalyDetected</td>
              <td>{String(MileageAnomalyDetected ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>StolenStatus</td>
              <td>{StolenStatus ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>StolenMiaftrRecordCount</td>
              <td>{StolenMiaftrRecordCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>MileageRecordCount</td>
              <td>{MileageRecordCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>LookupStatusMessage</td>
              <td>{LookupStatusMessage ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Scrapped</td>
              <td>{String(Scrapped ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>HighRiskRecordCount</td>
              <td>{HighRiskRecordCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Stolen</td>
              <td>{String(Stolen ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>ImportDate</td>
              <td>{ImportDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Exported</td>
              <td>{String(Exported ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>HighRiskRecordList</td>
              <td>{HighRiskRecordList ? JSON.stringify(HighRiskRecordList) : 'N/A'}</td>
            </tr>
            <tr>
              <td>WriteOffCategory</td>
              <td>{WriteOffCategory ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>ExportDate</td>
              <td>{ExportDate ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>VinLast5</td>
              <td>{VinLast5 ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>VicTestResult</td>
              <td>{VicTestResult ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Data</td>
              <td>{Data ? JSON.stringify(Data) : 'N/A'}</td>
            </tr>
            <tr>
              <td>DateFirstRegistered</td>
              <td>{DateFirstRegistered ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>Colour</td>
              <td>{Colour ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PlateChangeCount</td>
              <td>{PlateChangeCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>PreviousKeeperCount</td>
              <td>{PreviousKeeperCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>FinanceRecordCount</td>
              <td>{FinanceRecordCount ?? 'N/A'}</td>
            </tr>
            <tr>
              <td>YearOfManufacture</td>
              <td>{YearOfManufacture ?? 'N/A'}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VdiResultDisplay;
