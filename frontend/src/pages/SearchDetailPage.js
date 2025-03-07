// src/pages/SearchDetailPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_SEARCH_BY_ID, GET_USER_PROFILE } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';
import VdiResultDisplay from '../components/VdiResultDisplay';
import HpiResultDisplay from '../components/HpiResultDisplay';
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

function SearchDetailPage() {
  const { id } = useParams();

  // 1) Query user profile for partial vs. advanced logic
  const { data: userData } = useQuery(GET_USER_PROFILE);

  // 2) Query the single search record
  const { data, loading, error } = useQuery(GET_SEARCH_BY_ID, {
    variables: { id },
    fetchPolicy: 'no-cache', // optional
  });

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading search record...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error.message}</div>;
  }

  const record = data?.getSearchById;
  if (!record) {
    return <div className="alert alert-warning">No search record found with this ID.</div>;
  }

  // If you want partial/advanced logic in the result display,
  // pass the user profile so those components can check free checks/credits
  const userProfile = userData?.getUserProfile || null;

  // Basic info about the search
  const { vehicleReg, searchType, timestamp, responseData } = record;

  // Use our custom function instead of new Date(...)
  const dateString = formatTimestamp(timestamp);

  return (
    <div className="container my-4">
      <h2>Search Details</h2>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Vehicle Reg:</strong> {vehicleReg}</p>
      <p><strong>Search Type:</strong> {searchType}</p>
      <p><strong>Date/Time:</strong> {dateString}</p>

      {searchType === 'MOT' && (
        <>
          <h3>MOT Data</h3>
          {/* 
            Pass userProfile so MOTResultDisplay can do the free check 
            vs. advanced data logic (locked/unlocked).
          */}
          <MOTResultDisplay 
            data={responseData} 
            userProfile={userProfile} 
          />
        </>
      )}

      {searchType === 'VDI' && (
        <>
          <h3>VDI Data</h3>
          {/* If you have partial logic for VDI, pass userProfile similarly */}
          <VdiResultDisplay 
            data={responseData} 
            userProfile={userProfile} 
          />
        </>
      )}
        {searchType === 'HPI' && (
        <>
          <h3>HPI Data</h3>
          {/* If you have partial logic for VDI, pass userProfile similarly */}
          <HpiResultDisplay 
            hpidata={responseData} 
            userProfile={userProfile} 
          />
        </>
      )}
    </div>
  );
}

export default SearchDetailPage;
