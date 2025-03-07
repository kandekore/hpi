import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  GET_USER_PROFILE,
  GET_SEARCH_HISTORY,
  GET_TRANSACTIONS
} from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';

/*************************************************************
 * parse +00:00 => Z, or numeric timestamps as epoch ms
 * Adds console logs to debug each step
 *************************************************************/
function formatTimestamp(ts) {
  if (!ts) {
    console.log("formatTimestamp => no timestamp provided");
    return 'N/A';
  }

  console.log("formatTimestamp => original:", ts);

  // 1) If it's purely digits => parse as integer (epoch ms)
  if (/^\d+$/.test(ts)) {
    const ms = Number(ts);
    console.log("formatTimestamp => recognized numeric ms =>", ms);
    if (!isNaN(ms)) {
      const d = new Date(ms);
      if (!isNaN(d.getTime())) {
        const localStr = d.toLocaleString();
        console.log("formatTimestamp => parsed numeric date =>", localStr);
        return localStr;
      }
    }
    console.log("formatTimestamp => numeric parse failed =>", ts);
    return 'N/A';
  }

  // 2) Else handle potential ISO string with +00:00
  let trimmed = ts.trim();
  if (trimmed.endsWith('+00:00')) {
    trimmed = trimmed.replace('+00:00', 'Z');
    console.log("formatTimestamp => replaced +00:00 -> Z =>", trimmed);
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) {
    console.log("formatTimestamp => invalid date =>", trimmed);
    return 'N/A';
  }

  const localStr = d.toLocaleString();
  console.log("formatTimestamp => final parsed =>", localStr);
  return localStr;
}

function CreditManagementPage() {
  // 1) State for credits
  const [motCredits, setMotCredits] = useState(0);
  const [vdiCredits, setVdiCredits] = useState(0);
  const [hpiCredits, setHpiCredits] = useState(0); // <-- NEW
  const [freeMotChecksUsed, setFreeMotChecksUsed] = useState(0);

  // 2) Fetch user profile
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery(GET_USER_PROFILE);

  // 3) Once profileData is loaded or updated, sync to state
  useEffect(() => {
    if (profileData && profileData.getUserProfile) {
      const { motCredits, vdiCredits, freeMotChecksUsed, hpiCredits } = profileData.getUserProfile;
      setMotCredits(motCredits);
      setVdiCredits(vdiCredits);
      setFreeMotChecksUsed(freeMotChecksUsed);
      setHpiCredits(hpiCredits || 0); // fallback if undefined
    }
  }, [profileData]);

  // 4) Create credit purchase session mutation
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // 5) Tab state
  const [activeTab, setActiveTab] = useState('credits');

  // 6) Search History and Transactions queries, skipped unless that tab is active
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError
  } = useQuery(GET_SEARCH_HISTORY, {
    skip: activeTab !== 'history',
    fetchPolicy: 'network-only'
  });

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError
  } = useQuery(GET_TRANSACTIONS, {
    skip: activeTab !== 'transactions',
    fetchPolicy: 'network-only'
  });

  // 7) Handler to create purchase session
  const handlePurchase = async (creditType, quantity) => {
    try {
      const { data } = await createSession({ variables: { creditType, quantity }});
      if (data.createCreditPurchaseSession) {
        // redirect to Stripe
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8) Handle loading/error states
  if (profileLoading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }
  if (profileError) {
    return <div className="alert alert-danger">Error: {profileError.message}</div>;
  }

  // 9) Render the UI using the state for credits
  return (
    <div className="container my-4">
      <h1 className="mb-4">Account</h1>
      {/* Nav tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            Credit Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Search History
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </li>
      </ul>

      <div className="tab-content py-3">
        {/* TAB 1: CREDITS */}
        {activeTab === 'credits' && (
          <div>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">User Profile</h5>
                <p className="card-text">
                  <strong>MOT Credits:</strong> {motCredits}
                </p>
                <p className="card-text">
                  <strong>VDI Credits:</strong> {vdiCredits}
                </p>
                <p className="card-text">
                  <strong>HPI Credits:</strong> {hpiCredits}
                </p>
                <p className="card-text">
                  <strong>Free MOT Checks Used:</strong> {freeMotChecksUsed} / 3
                </p>
              </div>
            </div>

            <h2>Purchase MOT Credits</h2>
            <div className="row">
              {[
                { quantity: 10, price: '£1.50' },
                { quantity: 20, price: '£2.00' },
                { quantity: 50, price: '£4.00' },
                { quantity: 100, price: '£7.50' },
              ].map((pkg) => (
                <div key={pkg.quantity} className="col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-header">MOT Credits</div>
                    <div className="card-body">
                      <h5 className="card-title">{pkg.quantity} Credits</h5>
                      <p className="card-text">{pkg.price}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handlePurchase('MOT', pkg.quantity)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-5">Purchase VDI Credits</h2>
            <div className="row">
              {[
                { quantity: 1, price: '£6.99' },
                { quantity: 10, price: '£60' },
                { quantity: 20, price: '£100' },
                { quantity: 50, price: '£200' },
                { quantity: 100, price: '£350' },
              ].map((pkg) => (
                <div key={pkg.quantity} className="col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-header">VDI Credits</div>
                    <div className="card-body">
                      <h5 className="card-title">{pkg.quantity} Checks</h5>
                      <p className="card-text">{pkg.price}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handlePurchase('VDI', pkg.quantity)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 30% Higher Price Than VDI */}
            <h2 className="mt-5">Purchase Full HPI Credits</h2>
            <div className="row">
              {[
                { quantity: 1, price: '£9.09' },   // ~30% higher than £6.99
                { quantity: 10, price: '£78.00' }, // ~30% higher than £60
                { quantity: 20, price: '£130.00' },// ~30% higher than £100
                { quantity: 50, price: '£260.00' },// ~30% higher than £200
                { quantity: 100, price: '£455.00' },// ~30% higher than £350
              ].map((pkg) => (
                <div key={pkg.quantity} className="col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-header">HPI Credits</div>
                    <div className="card-body">
                      <h5 className="card-title">{pkg.quantity} Checks</h5>
                      <p className="card-text">{pkg.price}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handlePurchase('HPI', pkg.quantity)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mt-4 border-secondary">
              <div className="card-body text-center">
                [Ad Banner]
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h2>Search History</h2>
            {historyLoading && (
              <div className="text-center my-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading history...</span>
                </div>
              </div>
            )}
            {historyError && (
              <div className="alert alert-danger">
                Error: {historyError.message}
              </div>
            )}

            {historyData && historyData.getSearchHistory && (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Vehicle Reg</th>
                      <th>Search Type</th>
                      <th>Date</th>
                      <th>Make &amp; Model</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.getSearchHistory.map((record) => {
                      console.log("SearchRecord =>", record);

                      // If record.timestamp is absent, try record.responseData?.timestamp
                      const rawTimestamp =
                        record.timestamp || record.responseData?.timestamp;
                      console.log("rawTimestamp =>", rawTimestamp);

                      const dateStr = formatTimestamp(rawTimestamp);
                      console.log("Final dateStr =>", dateStr);

                      // // MOT vs VDI extraction
                      // const dataItems = record.responseData?.DataItems || {};
                      // const motMake = dataItems.VehicleDetails?.Make;
                      // const motModel = dataItems.VehicleDetails?.Model;
                      // const vdiMake = dataItems.Make;
                      // const vdiModel = dataItems.Model;

                      

                      // let makeModel = 'N/A';
                      // if (motMake && motModel) {
                      //   makeModel = `${motMake} ${motModel}`;
                      // } else if (vdiMake && vdiModel) {
                      //   makeModel = `${vdiMake} ${vdiModel}`;
                      // } else if (dataItems.VehicleDescription) {
                      //   makeModel = dataItems.VehicleDescription;
                      // }
                      // Pseudocode
let makeModel = 'N/A';

if (record.searchType === 'MOT') {
  const dataItems = record.responseData?.DataItems || {};
  const motMake = dataItems.VehicleDetails?.Make;
  const motModel = dataItems.VehicleDetails?.Model;
  if (motMake && motModel) {
    makeModel = `${motMake} ${motModel}`;
  }
} else if (record.searchType === 'VDI') {
  const dataItems = record.responseData?.DataItems || {};
  const vdiMake = dataItems.Make;
  const vdiModel = dataItems.Model;
  if (vdiMake && vdiModel) {
    makeModel = `${vdiMake} ${vdiModel}`;
  }
} else if (record.searchType === 'HPI') {
  // The aggregator structure
  const hpiVdi = record.responseData?.vdiCheckFull?.DataItems || {};
  // or use motTaxStatus if that’s simpler
  const hpiMake = hpiVdi.Make || record.responseData?.motTaxStatus?.DataItems?.VehicleDetails?.Make;
  const hpiModel = hpiVdi.Model || record.responseData?.motTaxStatus?.DataItems?.VehicleDetails?.Model;
  if (hpiMake && hpiModel) {
    makeModel = `${hpiMake} ${hpiModel}`;
  }
}


                      console.log("Final makeModel =>", makeModel);

                      return (
                        <tr key={record.id}>
                          <td>{record.vehicleReg}</td>
                          <td>{record.searchType}</td>
                          <td>{dateStr}</td>
                          <td>{makeModel}</td>
                          <td>
                            {/* 
                              "View" button linking to /search/:id 
                              You need a <Route path="/search/:id" element={<SearchDetailPage />} /> 
                            */}
                            <Link
                              to={`/search/${record.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div>
            <h2>Transactions</h2>
            {transactionsLoading && (
              <div className="text-center my-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading transactions...</span>
                </div>
              </div>
            )}
            {transactionsError && (
              <div className="alert alert-danger">
                Error: {transactionsError.message}
              </div>
            )}

            {transactionsData && transactionsData.getTransactions && (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Credits Purchased</th>
                      <th>Credit Type</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsData.getTransactions.map((tx) => {
                      const rawTimestamp = tx.timestamp || tx.responseData?.timestamp;
                      console.log('rawTimestamp =>', rawTimestamp);

                      const dateStri = formatTimestamp(rawTimestamp);
                      console.log('Final dateStr =>', dateStri);

                      return (
                        <tr key={tx.id}>
                          <td>{tx.transactionId}</td>
                          <td>{tx.creditsPurchased}</td>
                          <td>{tx.creditType}</td>
                          <td>£{(tx.amountPaid / 100).toFixed(2)}</td>
                          <td>{dateStri}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreditManagementPage;
