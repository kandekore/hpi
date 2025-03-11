import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SAMPLE_SEARCH_BY_ID } from '../graphql/queries'; 

import MOTResultDisplay from '../components/MOTResultDisplay';
import ValuationAggregatorDisplayHistory from '../components/ValuationAggregatorDisplayHistory';
import VdiResultDisplay from '../components/VdiResultDisplay';
import HpiSample from '../components/HpiSample'; // or HpiSearchHistory, etc.

function formatTimestamp(ts) {
  if (!ts) return 'N/A';

  // If it's purely digits => parse as integer (epoch ms)
  if (/^\d+$/.test(ts)) {
    const ms = Number(ts);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
    return 'N/A';
  }

  // Otherwise, handle potential ISO string with +00:00
  let trimmed = ts.trim();
  if (trimmed.endsWith('+00:00')) {
    trimmed = trimmed.replace('+00:00', 'Z');
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) {
    return 'N/A';
  }
  return d.toLocaleString();
}

export default function ExampleReportsPage() {
  const [activeTab, setActiveTab] = useState('mot');

  // Replace these IDs with your actual "sample" record IDs
  const MOT_SEARCH_ID = '67ccb04dba934cab25039552';       // searchType === 'MOT'
  const VAL_SEARCH_ID = '67d05c0dd2651e963d529342';       // searchType === 'Valuation'
  const VDI_SEARCH_ID = '67d06a9cd2651e963d529354';       // searchType === 'VDI' or 'HPI'

  // Query each record via getSampleSearchById 
  const {
    data: motData,
    loading: motLoading,
    error: motError
  } = useQuery(GET_SAMPLE_SEARCH_BY_ID, { variables: { id: MOT_SEARCH_ID } });

  const {
    data: valData,
    loading: valLoading,
    error: valError
  } = useQuery(GET_SAMPLE_SEARCH_BY_ID, { variables: { id: VAL_SEARCH_ID } });

  const {
    data: vdiData,
    loading: vdiLoading,
    error: vdiError
  } = useQuery(GET_SAMPLE_SEARCH_BY_ID, { variables: { id: VDI_SEARCH_ID } });

  function renderResult({ loading, error, data }, expectedSearchType) {
    if (loading) {
      return (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading sample record...</span>
          </div>
        </div>
      );
    }
    if (error) {
      return <div className="alert alert-danger">Error: {error.message}</div>;
    }

    // IMPORTANT: use data?.getSampleSearchById 
    const record = data?.getSampleSearchById;
    if (!record) {
      return (
        <div className="alert alert-warning">
          No {expectedSearchType} search record found with this ID.
        </div>
      );
    }

    // Basic info
    const { vehicleReg, searchType, timestamp, responseData } = record;
    const dateString = formatTimestamp(timestamp);

    return (
      <div>
        <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
          <div className="col">
            <h5><strong>Vehicle Reg:</strong> {vehicleReg}</h5>
          </div>
          <div className="col">
            <h5><strong>Search Type:</strong> {searchType}</h5>
          </div>
          <div className="col">
            <h5><strong>Date/Time:</strong> {dateString}</h5>
          </div>
        </div>

        {/* Use the same logic as SearchDetailPage to display results */}
        {searchType === 'MOT' && (
          <MOTResultDisplay motCheck={responseData} userProfile={null} />
        )}

        {searchType === 'Valuation' && (
          <ValuationAggregatorDisplayHistory 
            valData={responseData}
            userProfile={null}
          />
        )}

        {/* If your sample record for "VDI" or "HPI" uses the same or different component */}
        {searchType === 'HPI' && (
          <HpiSample hpiData={responseData} />
        )}

        {searchType === 'VDI' && (
          <VdiResultDisplay vdiData={responseData} userProfile={null} />
        )}
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2>Public Example Reports</h2>
      <p className="text-muted">
        Below are three sample searches (MOT, Valuation, and VDI). Select a tab to 
        see how an actual report looks based on real data from our system. 
        (No login required.)
      </p>

      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'mot' ? 'active' : ''}`}
            onClick={() => setActiveTab('mot')}
            type="button"
            role="tab"
          >
            MOT Example
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'valuation' ? 'active' : ''}`}
            onClick={() => setActiveTab('valuation')}
            type="button"
            role="tab"
          >
            Valuation Example
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'vdi' ? 'active' : ''}`}
            onClick={() => setActiveTab('vdi')}
            type="button"
            role="tab"
          >
            VDI Example
          </button>
        </li>
      </ul>

      <div className="tab-content mt-4">
        {activeTab === 'mot' && (
          <div className="tab-pane active">
            {renderResult(
              { loading: motLoading, error: motError, data: motData },
              'MOT'
            )}
          </div>
        )}

        {activeTab === 'valuation' && (
          <div className="tab-pane active">
            {renderResult(
              { loading: valLoading, error: valError, data: valData },
              'Valuation'
            )}
          </div>
        )}

        {activeTab === 'vdi' && (
          <div className="tab-pane active">
            {renderResult(
              { loading: vdiLoading, error: vdiError, data: vdiData },
              'VDI'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
