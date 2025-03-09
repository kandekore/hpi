// src/components/TechnicalDetails.js
import React, { useState } from 'react';

export default function TechnicalDetails({ dataItems }) {
  // Extract the top-level object
  const technicalDetails = dataItems?.TechnicalDetails || {};

  // Sub-objects for each tab
  const dimensions = technicalDetails.Dimensions || {};
  const general = technicalDetails.General || {};
  const performance = technicalDetails.Performance || {};
  const consumption = technicalDetails.Consumption || {};

  // Tabs state: which section is active
  const [activeTab, setActiveTab] = useState('dimensions');

  // Quick helper to make a table row if the value is not null
  const renderRow = (label, value) => (
    <tr>
      <th>{label}</th>
      <td>{value !== null && value !== undefined ? value : 'N/A'}</td>
    </tr>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>Technical Details</h3>
      </div>
      <div className="card-body">
        {/* Bootstrap Nav Tabs */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'dimensions' ? 'active' : ''}`}
              onClick={() => setActiveTab('dimensions')}
            >
              Dimensions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'consumption' ? 'active' : ''}`}
              onClick={() => setActiveTab('consumption')}
            >
              Consumption
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {/* 1) Dimensions Tab */}
          {activeTab === 'dimensions' && (
            <div className="tab-pane active">
              <h5>Dimensions</h5>
              <table className="table table-sm">
                <tbody>
                  {renderRow('Body Shape', dimensions.BodyShape)}
                  {renderRow('Number of Seats', dimensions.NumberOfSeats)}
                  {renderRow('Unladen Weight', dimensions.UnladenWeight)}
                  {renderRow('Gross Vehicle Weight', dimensions.GrossVehicleWeight)}
                  {renderRow('Gross Combined Weight', dimensions.GrossCombinedWeight)}
                  {renderRow('Car Length (mm)', dimensions.CarLength)}
                  {renderRow('Height (mm)', dimensions.Height)}
                  {renderRow('Width (mm)', dimensions.Width)}
                  {renderRow('Wheel Base (mm)', dimensions.WheelBase)}
                </tbody>
              </table>
            </div>
          )}

          {/* 2) General Tab */}
          {activeTab === 'general' && (
            <div className="tab-pane active">
              <h5>General</h5>
              <table className="table table-sm">
                <tbody>
                  {renderRow('Power Delivery', general.PowerDelivery)}
                  {renderRow('Type Approval Category', general.TypeApprovalCategory)}
                  {renderRow('Driving Axle', general.DrivingAxle)}
                  {/* If you want more details from general.Engine: */}
                  {general.Engine && (
                    <>
                      {renderRow('Engine Make', general.Engine.Make)}
                      {renderRow('Cylinders', general.Engine.NumberOfCylinders)}
                      {renderRow('Aspiration', general.Engine.Aspiration)}
                      {renderRow('Stroke', general.Engine.Stroke)}
                      {renderRow('Bore', general.Engine.Bore)}
                      {renderRow('Valve Gear', general.Engine.ValveGear)}
                      {renderRow('Valves Per Cylinder', general.Engine.ValvesPerCylinder)}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3) Performance Tab */}
          {activeTab === 'performance' && (
            <div className="tab-pane active">
              <h5>Performance</h5>
              <table className="table table-sm">
                <tbody>
                  {performance.Torque && (
                    <>
                      {renderRow('Torque (Ft/Lb)', performance.Torque.FtLb)}
                      {renderRow('Torque (Nm)', performance.Torque.Nm)}
                      {renderRow('Torque RPM', performance.Torque.Rpm)}
                    </>
                  )}
                  {performance.Power && (
                    <>
                      {renderRow('Power (BHP)', performance.Power.Bhp)}
                      {renderRow('Power (KW)', performance.Power.Kw)}
                      {renderRow('Power RPM', performance.Power.Rpm)}
                    </>
                  )}
                  {performance.MaxSpeed && (
                    <>
                      {renderRow('Max Speed (MPH)', performance.MaxSpeed.Mph)}
                      {renderRow('Max Speed (KPH)', performance.MaxSpeed.Kph)}
                    </>
                  )}
                  {renderRow('CO2 (g/km)', performance.Co2)}
                  {/* If you want acceleration data: */}
                  {performance.Acceleration && (
                    <>
                      {renderRow('Acceleration 0-60 (mph)', performance.Acceleration.Mph)}
                      {renderRow('Acceleration 0-100 (kph)', performance.Acceleration.Kph)}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4) Consumption Tab */}
          {activeTab === 'consumption' && (
            <div className="tab-pane active">
              <h5>Consumption</h5>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Driving Mode</th>
                    <th>L/100km</th>
                    <th>MPG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Urban Cold</td>
                    <td>{consumption.UrbanCold?.Lkm ?? 'N/A'}</td>
                    <td>{consumption.UrbanCold?.Mpg ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Extra Urban</td>
                    <td>{consumption.ExtraUrban?.Lkm ?? 'N/A'}</td>
                    <td>{consumption.ExtraUrban?.Mpg ?? 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Combined</td>
                    <td>{consumption.Combined?.Lkm ?? 'N/A'}</td>
                    <td>{consumption.Combined?.Mpg ?? 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
