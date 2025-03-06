// src/components/HPIResultDisplay.js
import React from 'react';

/**
 * Expects an hpiData object from hpiCheck, e.g.:
 * {
 *   reg: "...",
 *   timestamp: "...",
 *   vdiCheckFull: {...},
 *   vedData: {...},
 *   vehicleAndMotHistory: {...},
 *   vehicleData: {...},
 *   valuation: {...},
 *   motTaxStatus: {...},
 *   images: {...},
 *   specAndOptions: {...}
 * }
 *
 * We'll show each of these in its own Card with a nested list of fields.
 */

export default function HPIResultDisplay({ hpiData }) {
  if (!hpiData) {
    return (
      <div className="alert alert-warning">
        No HPI data available. Make sure hpiCheck was called.
      </div>
    );
  }

  const {
    reg,
    timestamp,
    vdiCheckFull,
    vedData,
    vehicleAndMotHistory,
    vehicleData,
    valuation,
    motTaxStatus,
    images,
    specAndOptions,
  } = hpiData;

  // Convert timestamp to something readable
  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleString()
    : 'N/A';

  return (
    <div className="container my-4">
      <h1 className="mb-3">Full HPI Data (Categorized List)</h1>
      <p>
        <strong>Registration:</strong> {reg || 'N/A'} <br />
        <strong>Generated:</strong> {formattedTimestamp}
      </p>

      {/* A helper that returns a card with a nested bullet list for each object */}
      <HpiApiResultList title="VDI Check Full" data={vdiCheckFull} />
      <HpiApiResultList title="VED Data" data={vedData} />
      <HpiApiResultList
        title="Vehicle & MOT History"
        data={vehicleAndMotHistory}
      />
      <HpiApiResultList title="Vehicle Data" data={vehicleData} />
      <HpiApiResultList title="Valuation Data" data={valuation} />
      <HpiApiResultList title="MOT & Tax Status" data={motTaxStatus} />
      <HpiApiResultList title="Images" data={images} />
      <HpiApiResultList title="Spec & Options" data={specAndOptions} />
    </div>
  );
}

/**
 * Renders a Bootstrap card containing a nested bullet list of all fields in "data".
 * If data is null or undefined, we show a 'No data...' message.
 */
function HpiApiResultList({ title, data }) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h4 className="mb-0">{title}</h4>
      </div>
      <div className="card-body">
        {data ? (
          <div>{renderNestedData(data)}</div>
        ) : (
          <p className="text-muted">No data returned.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Recursively renders an object or array as a nested <ul>.
 * Primitives are shown as "key: value".
 */
function renderNestedData(obj) {
  // If it's not an object (e.g. string, number, boolean) or null => show as string
  if (typeof obj !== 'object' || obj === null) {
    return <span>{String(obj)}</span>;
  }

  // If it's an array => map each item
  if (Array.isArray(obj)) {
    return (
      <ul>
        {obj.map((item, idx) => (
          <li key={idx}>{renderNestedData(item)}</li>
        ))}
      </ul>
    );
  }

  // Otherwise it's a plain object => iterate over keys
  return (
    <ul>
      {Object.entries(obj).map(([key, val]) => (
        <li key={key}>
          <strong>{key}:</strong>{' '}
          {typeof val === 'object' && val !== null ? (
            // For objects/arrays, recurse
            renderNestedData(val)
          ) : (
            // For primitives, just show the string
            <span>{String(val)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
