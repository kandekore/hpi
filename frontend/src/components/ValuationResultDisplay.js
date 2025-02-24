// src/components/ValuationResultDisplay.js
import React from 'react';

/**
 * Expects `data` to look like:
 * {
 *   "StatusCode": "Success",
 *   "StatusMessage": "Success",
 *   "MetaDataForKeys": [...],
 *   "MetaDataForItems": {
 *     "ExtractNumber": { "Name": "ExtractNumber", "Type": "String" },
 *     "Mileage": { "Name": "Mileage", "Type": "String" },
 *     ...
 *   }
 * }
 */

function ValuationResultDisplay({ data, isFreeSearch }) {
  // 1) Debug: Show the entire raw object.
  //    This helps confirm whether the shape matches our assumptions.
  console.log('ValuationResultDisplay received data:', data);

  if (!data) {
    return <p>No valuation data returned from the server.</p>;
  }

  // According to your structure, these should be at the top level
  const { StatusCode, StatusMessage, MetaDataForItems } = data;

  // 2) We can also show a debug <pre> to see raw data in the browser
  //    (not just the console). You can remove it later.
  return (
    <div className="card my-4 shadow-sm">
      <div className="card-header bg-info text-white">
        Valuation Data
      </div>
      <div className="card-body">
        <p><strong>Debug Dump:</strong></p>
        <pre>{JSON.stringify(data, null, 2)}</pre>

        {/* Basic status info */}
        <p><strong>StatusCode:</strong> {StatusCode}</p>
        <p><strong>StatusMessage:</strong> {StatusMessage}</p>

        {/* If "MetaDataForItems" doesn't exist, show a fallback message. */}
        {!MetaDataForItems ? (
          <p>No valuation metadata available (MetaDataForItems missing).</p>
        ) : (
          <>
            <h5 className="mt-3">MetaDataForItems</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>ExtractNumber:</strong> {MetaDataForItems.ExtractNumber?.Name}
                {' (Type: '}
                {MetaDataForItems.ExtractNumber?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>Mileage:</strong> {MetaDataForItems.Mileage?.Name}
                {' (Type: '}
                {MetaDataForItems.Mileage?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>PlateYear:</strong> {MetaDataForItems.PlateYear?.Name}
                {' (Type: '}
                {MetaDataForItems.PlateYear?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>ValuationBook:</strong> {MetaDataForItems.ValuationBook?.Name}
                {' (Type: '}
                {MetaDataForItems.ValuationBook?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>ValuationList:</strong> {MetaDataForItems.ValuationList?.Name}
                {' (Type: '}
                {MetaDataForItems.ValuationList?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>ValuationTime:</strong> {MetaDataForItems.ValuationTime?.Name}
                {' (Type: '}
                {MetaDataForItems.ValuationTime?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>VehicleDescription:</strong> {MetaDataForItems.VehicleDescription?.Name}
                {' (Type: '}
                {MetaDataForItems.VehicleDescription?.Type}
                {')'}
              </li>
              <li className="list-group-item">
                <strong>Vrm:</strong> {MetaDataForItems.Vrm?.Name}
                {' (Type: '}
                {MetaDataForItems.Vrm?.Type}
                {')'}
              </li>
            </ul>
          </>
        )}

        {/* If you want to hide or show more fields for paid searches only: */}
        {!isFreeSearch && (
          <div className="mt-3">
            <em>(Additional premium fields would go here.)</em>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValuationResultDisplay;
