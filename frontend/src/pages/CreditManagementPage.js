import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  GET_USER_PROFILE,
  GET_SEARCH_HISTORY,
  GET_TRANSACTIONS
} from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';

// Remove import for formatTimestamp
// import formatTimestamp from '../utils/formatTimestamp';

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
  const [motCredits, setMotCredits] = useState(0);
  const [valuationCredits, setValuationCredits] = useState(0);
  const [hpiCredits, setHpiCredits] = useState(0);
  const [freeMotChecksUsed, setFreeMotChecksUsed] = useState(0);

  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery(GET_USER_PROFILE);

  useEffect(() => {
    if (profileData && profileData.getUserProfile) {
      const { motCredits, valuationCredits, freeMotChecksUsed, hpiCredits } = profileData.getUserProfile;
      setMotCredits(motCredits);
      setValuationCredits(valuationCredits);
      setFreeMotChecksUsed(freeMotChecksUsed);
      setHpiCredits(hpiCredits || 0);
    }
  }, [profileData]);

  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  const [activeTab, setActiveTab] = useState('credits');

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

  const handlePurchase = async (creditType, quantity) => {
    try {
      const { data } = await createSession({ variables: { creditType, quantity }});
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="container my-4">
      <h1 className="mb-4">Account</h1>
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
        {activeTab === 'credits' && (
          <div>
            {/* Example new pricing table replacing the old */}
            <MainPricing
              isLoggedIn={!!localStorage.getItem('authToken')}
              hasUsedFreeMOT={freeMotChecksUsed >= 3}
              onPurchase={(product, quantity) => handlePurchase(product, quantity)}
            />
          </div>
        )}

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
                      const rawTimestamp =
                        record.timestamp || record.responseData?.timestamp;
                      const dateStr = formatTimestamp(rawTimestamp);

                      let makeModel = 'N/A';
                      // your logic for extracting makeModel ...
                      
                      return (
                        <tr key={record.id}>
                          <td>{record.vehicleReg}</td>
                          <td>{record.searchType}</td>
                          <td>{dateStr}</td>
                          <td>{makeModel}</td>
                          <td>
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
                      const rawTimestamp =
                        tx.timestamp || tx.responseData?.timestamp;
                      const dateStr = formatTimestamp(rawTimestamp);

                      return (
                        <tr key={tx.id}>
                          <td>{tx.transactionId}</td>
                          <td>{tx.creditsPurchased}</td>
                          <td>{tx.creditType}</td>
                          <td>£{(tx.amountPaid / 100).toFixed(2)}</td>
                          <td>{dateStr}</td>
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
