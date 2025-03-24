 // src/pages/SearchDetailPage.js
 import React from 'react';
 import { useParams } from 'react-router-dom';
 import { useQuery } from '@apollo/client';
 import { GET_SEARCH_BY_ID, GET_USER_PROFILE } from '../graphql/queries';
 import MOTResultDisplay from '../components/MOTResultDisplay';
 import VdiResultDisplay from '../components/VdiResultDisplay';
 import HpiSearchHistory from '../components/HpiSearchHistory';
 import ValuationAggregatorDisplayHistory from '../components/ValuationAggregatorDisplayHistory';
 import MOTResultDisplayValuation from '../components/MOTResultDisplayValuation';
 
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
   // pass the user profile so those components can check free checks/dashboard
   const userProfile = userData?.getUserProfile || null;
 
   // Basic info about the search
   const { vehicleReg, searchType, timestamp, responseData } = record;

   // console.log('Server: responseData =>', responseData);
 
   // Use our custom function instead of new Date(...)
   const dateString = formatTimestamp(timestamp);
   const hpiResponseData = responseData.vdiCheckFull;
   // console.log('Server: hpiResponseData =>', hpiResponseData);
   const motData = responseData?.vehicleAndMotHistory?.DataItems?.MotHistory;

   
   return (
    <><style>{
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
      <br></br>
        <h3><strong>ID:</strong> {id}</h3>
       <h3><strong>Date/Time:</strong> {dateString}</h3>
    </div>
    <div className="col search-type">
      <img src="/images/moticon.png" alt="MOT" className="img-fluid" />
    
      <h5 className='search-type'>Full MOT History</h5>
    </div>
  </div>
)}
   {(searchType === 'Valuation' || searchType === 'VALUATION') && (
  <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
    <div className="col">
      <h5 className='plate-input'>{vehicleReg}</h5>
       <br></br>
        <h3><strong>ID:</strong> {id}</h3>
       <h3><strong>Date/Time:</strong> {dateString}</h3>
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
       <br></br>
        <h3><strong>ID:</strong> {id}</h3>
       <h3><strong>Date/Time:</strong> {dateString}</h3>
    </div>
    <div className="col search-type">
      <img src="/images/reporticon.png" alt="Full HistoryOT" className="img-fluid" />
      <h5 className='search-type'>Full Vehicle History</h5>
    </div>
  </div>
)}
</div>

 
       {searchType === 'MOT' && (
         <>
           
           {/* 
             Pass userProfile so MOTResultDisplay can do the free check 
             vs. advanced data logic (locked/unlocked).
           */}
           <MOTResultDisplay 
             motCheck={responseData} 
             userProfile={userProfile} 
           />
         </>
       )}
 
       {(searchType === 'Valuation' || searchType === 'VALUATION')&& (
         <>
           
           {/* If you have partial logic for VDI, pass userProfile similarly */}
           <ValuationAggregatorDisplayHistory 
             valData={responseData} 
             userProfile={userProfile} 
           />
            <MOTResultDisplayValuation motData={motData} userProfile={userProfile} />
         </>
       )}
        {(searchType === 'HPI' || searchType === 'VDI' || searchType === 'FULL_HISTORY') && (
  <>
    
    <HpiSearchHistory 
      hpiData={responseData}      // <--- rename here
      userProfile={userProfile} 
    />
  </>
)}
     
     </>
   );
 }
 
 export default SearchDetailPage;  