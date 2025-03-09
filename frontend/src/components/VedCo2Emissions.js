// src/components/VedCo2Emissions.js
import React from 'react';

export default function VedCo2Emissions({ co2Value }) {
  // If no co2Value
  if (!co2Value && co2Value !== 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>CO2 Emissions</h3>
        </div>
        <div className="card-body">
          <p className="alert alert-warning">No CO2 data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>CO2 Emissions</h3>
      </div>
      <div className="card-body">
        <p>The CO2 emissions for this vehicle are <strong>{co2Value}</strong> g/km.</p>
      </div>
    </div>
  );
}
