import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SAMPLE_SEARCH_BY_ID } from '../graphql/queries'; 
import { Helmet } from 'react-helmet-async';
import MOTResultDisplay from '../components/MOTResultDisplay';
import ValuationAggregatorDisplayHistory from '../components/ValuationAggregatorDisplayHistory';
import VdiResultDisplay from '../components/VdiResultDisplay';
import HpiSample from '../components/HpiSample'; // or HpiSearchHistory, etc.
import MOTResultDisplayValuation from '../components/MOTResultDisplayValuation';
import heroBg from '../images/full-vehicle-check.jpg'; // your background image

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
  const MOT_SEARCH_ID = '67d9f2258b58f829acf6fb29';       // searchType === 'MOT'
  const VAL_SEARCH_ID = '67d9f1ce8b58f829acf6fb1d';       // searchType === 'Valuation'
  const VDI_SEARCH_ID = '67dc126c8b58f829acf6fb8c';       // searchType === 'VDI' or 'HPI'

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
    console.log('record =>', record);
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
    const motData = responseData?.vehicleAndMotHistory?.DataItems?.MotHistory;


    console.log('searchType =>', searchType);

    return (
      <>
        <Helmet>
                  <title>Full Vehicle History Example Reports | HPI / VDI Type Check | MOT & Vehicle Valuations</title>
                  <meta name="description" content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more." />
          
                  {/* Open Graph tags for social sharing */}
                  <meta property="og:title" content="Full Vehicle History | HPI / VDI Type Check | MOT & Vehicle Valuations" />
                  <meta property="og:description" content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more." />
                  <meta property="og:image" content={heroBg} />
                  <meta property="og:url" content="https://vehicledatainformation.co.uk" />
                  <meta property="og:type" content="website" />
          
                  {/* Twitter Card tags */}
                  <meta name="twitter:title" content="Full Vehicle History | HPI / VDI Type Check | MOT & Vehicle Valuations" />
                  <meta name="twitter:description" content="Access complete vehicle history: outstanding finance, insurance write-offs, theft records, and more." />
                  <meta name="twitter:image" content={heroBg} />
                  <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
                <style>{
        `.plate-input {
        flex: 1;
          background-color: #FFDE46;
    color: #000;
    font-weight: bold;
    font-size: 7rem;
    border: 10px solid;
    text-transform: uppercase;
    padding: 0 1rem;
    outline: none;
    line-height: 1;
    text-align: center;
    padding: 10px;
    border-radius: 25px;
      }
    .search-type {
    text-align: center;
    font-weight: 600;
    color: #003366;
    font-size: 30px !important;
}
      @media (max-width: 768px) {
     .plate-input {
       font-size: 4.25rem;
     }}
    `}</style>
    <div>
  {searchType === 'MOT' && (
    <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
      <div className="col">
        <h5 className='plate-input'>{vehicleReg}</h5>
      </div>
      <div className="col search-type">
        <img src="/images/moticon.png" alt="MOT" className="img-fluid" />
        <h5 className='search-type'>Full MOT History</h5>
      </div>
    </div>
  )}
     {searchType === 'Valuation' && (
    <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
      <div className="col">
        <h5 className='plate-input'>{vehicleReg}</h5>
      </div>
      <div className="col search-type">
        <img src="/images/valueicon.png" alt="Valuation" className="img-fluid" />
        <h5 className='search-type'>Vehicle Valuation</h5>
      </div>
    </div>
  )}
     {(searchType === 'HPI' || searchType === 'VDI' || searchType === 'FULL_HISTORY')  && (
    <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
      <div className="col">
        <h5 className='plate-input'>{vehicleReg}</h5>
      </div>
      <div className="col search-type">
        <img src="/images/reporticon.png" alt="Full HistoryOT" className="img-fluid" />
        <h5 className='search-type'>Full Vehicle History</h5>
      </div>
    </div>
  )}
</div>


        {/* Use the same logic as SearchDetailPage to display results */}
        {searchType === 'MOT' && (
          <MOTResultDisplay motCheck={responseData} userProfile={null} />
        )}

        {(searchType === 'VALUATION' || searchType === 'Valuation') && (
          
          <ValuationAggregatorDisplayHistory 
            valData={responseData}
            userProfile={null}
          />
          
        )}
        {(searchType === 'VALUATION' || searchType === 'Valuation') && (
        <MOTResultDisplayValuation motData={motData} userProfile={null} /> 
      )}
        {/* If your sample record for "VDI" or "HPI" uses the same or different component */}
        {(searchType === 'HPI' || searchType === 'FULL_HISTORY') && (
          <HpiSample hpiData={responseData} />
        )}

      </>
    );
  }

  return (
    <div className="container my-4">
      <h2>Public Example Reports</h2>
      <p className="text-muted">
        Below are three sample searches (MOT, Valuation, and Full History). Select a tab to 
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
            Full History Example
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
