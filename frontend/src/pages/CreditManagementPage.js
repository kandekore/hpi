import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  GET_USER_PROFILE,
  GET_SEARCH_HISTORY,
  GET_TRANSACTIONS
} from '../graphql/queries';
import {
  CREATE_CREDIT_PURCHASE_SESSION,
  CHANGE_PASSWORD
  
} from '../graphql/mutations';
import MainPricingDashboard from '../components/MainPricingDashboard';
import SupportForm from '../components/SupportForm';
import SupportTicketPage from './SupportTicketPage';
import MyTickets from '../components/MyTickets';

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  // If purely digits => parse as integer (epoch ms)
  if (/^\d+$/.test(ts)) {
    const ms = Number(ts);
    if (!isNaN(ms)) {
      const d = new Date(ms);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString();
      }
    }
    return 'N/A';
  }
  // Otherwise handle potential ISO with +00:00
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

function getDisplayName(value) {
  switch (value) {
    case 'FULL_HISTORY':
      return 'Full History';
    case 'VALUATION':
      return 'Valuation';
    case 'MOT':
      return 'MOT';
    case 'HPI':
      // If you still have an 'HPI' type anywhere, handle it here:
      return 'Full History';
    default:
      return value;
  }
}

// Get a make/model for each record, with fallback logic
function getMakeModel(record) {
  console.log(record)
  const { searchType, responseData } = record;
  if (!responseData) return 'N/A';

  if (searchType === 'MOT') {
    const make = responseData.DataItems?.VehicleDetails?.Make || 'Unknown';
    const model = responseData.DataItems?.VehicleDetails?.Model || 'Unknown';
    return `${make} ${model}`;
  } else if (searchType === 'Valuation' || searchType === 'VALUATION') {
    const make =
      responseData.vehicleAndMotHistory?.DataItems?.ClassificationDetails?.Dvla
        ?.Make || 'ValMake?';
    const model =
      responseData.vehicleAndMotHistory?.DataItems?.ClassificationDetails?.Dvla
        ?.Model || 'ValModel?';
    return `${make} ${model}`;
  } else if (searchType === 'FULL_HISTORY' || searchType === 'HPI') {
    const make = responseData.vdiCheckFull?.DataItems?.Make || 'N/A';
    const model = responseData.vdiCheckFull?.DataItems?.Model || '';
    return `${make} ${model}`;
  }
  return 'N/A';
}

export default function CreditManagementPage() {
  // 1) Body background on mount/unmount
  useEffect(() => {
    document.body.style.backgroundColor = '#1560bf';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // 2) Tab state
  const [activeTab, setActiveTab] = useState('credits');

  // 3) States for credits (updated in real-time from profile data)
  const [motCredits, setMotCredits] = useState(0);
  const [valuationCredits, setValuationCredits] = useState(0);
  const [hpiCredits, setHpiCredits] = useState(0);
  const [freeMotChecksUsed, setFreeMotChecksUsed] = useState(0);

  // 4) Basic profile info (email, phone, etc.)
  const [profileInfo, setProfileInfo] = useState(null);

  // 5) Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 6) GraphQL queries
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError
  } = useQuery(GET_USER_PROFILE);

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

  // 7) Mutations
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);
  const [changePasswordMutation, { loading: cpLoading, error: cpError }] =
    useMutation(CHANGE_PASSWORD);

  // 8) Populate user data into our states
  useEffect(() => {
    if (profileData?.getUserProfile) {
      const user = profileData.getUserProfile;
      setMotCredits(user.motCredits);
      setValuationCredits(user.valuationCredits);
      setHpiCredits(user.hpiCredits || 0);
      setFreeMotChecksUsed(user.freeMotChecksUsed);

      setProfileInfo({
        email: user.email,
        username: user.username || '',
        phone: user.phone || '',
        createdAt: user.createdAt
      });
    }
  }, [profileData]);

  // 9) Possibly format date for "Date Registered"
  const dateRegistered = profileInfo?.createdAt
    ? formatTimestamp(profileInfo.createdAt)
    : 'N/A';

  // 10) Purchase logic
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      VALUATION: 'VALUATION',
    FULL_HISTORY: 'FULL_HISTORY',
      MOT: 'MOT'
    };
    const creditType = productMap[product] || 'FULL_HISTORY';
    try {
      const { data } = await createSession({
        variables: { creditType, quantity }
      });
      if (data.createCreditPurchaseSession) {
        // Direct user to payment
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 11) Change password logic
  const handleChangePassword = async () => {
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    try {
      const { data } = await changePasswordMutation({
        variables: { currentPassword, newPassword }
      });
      if (data.changePassword) {
        setPassSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      console.error(err);
      setPassError(err.message);
    }
  };

  // 12) Loading / error states for profile
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
    return (
      <div className="alert alert-danger">
        Error: {profileError.message}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .nav-tabs {
          background-color: #1560bd !important; /* entire tab bar is #1560bd */
          border: none !important;
        }
        .nav-tabs .nav-link {
          color: #fff !important; 
          background-color: #1560bd !important; 
          border: none !important;
          margin-right: 2px;
        }
        .nav-tabs .nav-link:hover {
          background-color: #1282d2 !important;
        }
        .nav-tabs .nav-link.active {
          background-color: #003366 !important;
          border-bottom: 3px solid #fff !important;
        }
        .tab-content {
          background: #fff;
          border: 1px solid #ddd;
          border-top: none;
          padding: 2rem;
          border-radius: 0 0 5px 5px;
        }
        .dashboard-container {
          background: none;
        }
        .pricing-fullwidth {
          width: 100%;
          margin-left: -15px;
          margin-right: -15px;
        }
        @media (min-width: 576px) {
          .pricing-fullwidth {
            margin-left: 0;
            margin-right: 0;
          }
        }

        /* Mobile-friendly table approach for search history & transactions */
        @media (max-width: 767px) {
          /* Hide table headers */
          .table thead {
            display: none;
          }
          .table-responsive td:not(:first-child) {
            border-top: 0;
          }
          .table tbody tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 0.5rem;
            background-color: #fff;
          }
          /* Each cell => label + value approach */
          .table td {
            display: flex;
            justify-content: space-between;
            padding: 0.4rem 0.6rem;
          }
          .table td::before {
            content: attr(data-label);
            font-weight: 600;
            margin-right: 1rem;
          }
        }
      `}</style>

      <div className="container my-4 dashboard-container">
        <h1 className="mb-4" style={{ color: '#fff' }}>
          User Dashboard
        </h1>

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
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </li>
          <li className="nav-item">
  <button
    className={`nav-link ${activeTab === 'support' ? 'active' : ''}`}
    onClick={() => setActiveTab('support')}
  >
    Support
  </button>
</li>

        </ul>

        <div className="tab-content py-3">
          {/* 1) Credits Tab */}
          {activeTab === 'credits' && (
            <div className="tab-pane active">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Credits Overview</h5>
                  <p className="card-text">
                    <strong>MOT Credits:</strong> {motCredits}
                  </p>
                  <p className="card-text">
                    <strong>Valuation Credits:</strong> {valuationCredits}
                  </p>
                  <p className="card-text">
                    <strong>HPI Credits:</strong> {hpiCredits}
                  </p>
                  <p className="card-text">
                    <strong>Free MOT Checks Used:</strong> {freeMotChecksUsed} / 3
                  </p>
                </div>
              </div>

              <div className="pricing-fullwidth">
                <MainPricingDashboard
                  isLoggedIn={!!localStorage.getItem('authToken')}
                  hasUsedFreeMOT={freeMotChecksUsed >= 3}
                  onPurchase={(product, quantity) => handlePurchase(product, quantity)}
                />
              </div>
            </div>
          )}

          {/* 2) Search History Tab */}
          {activeTab === 'history' && (
            <div className="tab-pane active">
              <h2 style={{ color: '#fff' }}>Search History</h2>
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
              {historyData?.getSearchHistory && (
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
                        const makeModel = getMakeModel(record);

                        return (
                          <tr key={record.id}>
                            <td data-label="Vehicle Reg">{record.vehicleReg}</td>
                            <td data-label="Search Type">
                            {getDisplayName(record.searchType)}
                          </td>
                            <td data-label="Date">{dateStr}</td>
                            <td data-label="Make &amp; Model">{makeModel}</td>
                            <td data-label="Action">
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

          {/* 3) Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="tab-pane active">
              <h2 style={{ color: '#fff' }}>Transactions</h2>
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
              {transactionsData?.getTransactions && (
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
                            <td data-label="Transaction ID">{tx.transactionId}</td>
                            <td data-label="Credits Purchased">{tx.creditsPurchased}</td>
                            <td data-label="Credit Type">{getDisplayName(tx.creditType)}</td>
                            <td data-label="Amount Paid">
                              £{(tx.amountPaid / 100).toFixed(2)}
                            </td>
                            <td data-label="Date">{dateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4) Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-pane active">
              <h2 className="text-dark">Your Profile</h2>
              {profileInfo ? (
                <>
                  <p className="text-dark"><strong>Email:</strong> {profileInfo.email}</p>
                  <p className="text-dark"><strong>Username:</strong> {profileInfo.username}</p>
                  <p className="text-dark"><strong>Phone:</strong> {profileInfo.phone}</p>
                  {/* If you want dateRegistered displayed:
                  <p className="text-dark"><strong>Date Registered:</strong> {dateRegistered}</p> */}
                </>
              ) : (
                <p className="text-dark">Unable to load profile info.</p>
              )}
          
              <hr />
          
              <h3 className="text-dark">Change Password</h3>
              {passError && <div className="alert alert-danger">{passError}</div>}
              {passSuccess && <div className="alert alert-success">{passSuccess}</div>}
          
              <div className="mb-3">
                <label htmlFor="currentPass" className="form-label text-dark">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPass"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={cpLoading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPass" className="form-label text-dark">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPass"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={cpLoading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmNewPass" className="form-label text-dark">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPass"
                  className="form-control"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={cpLoading}
                />
              </div>
          
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={cpLoading}
              >
                {cpLoading ? 'Changing...' : 'Change Password'}
              </button>
          
              {cpError && (
                <div className="alert alert-danger mt-3">
                  {cpError.message}
                </div>
              )}
            </div>
          )}
            {activeTab === 'support' && (
  <div className="tab-pane active">
    <SupportForm email={profileInfo?.email} />
    <hr />
    <MyTickets />
  </div>
)}

        </div>
      </div>
    </>
  );
}
