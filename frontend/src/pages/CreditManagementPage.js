import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  GET_USER_PROFILE,
  GET_SEARCH_HISTORY,
  GET_TRANSACTIONS
} from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION, CHANGE_PASSWORD } from '../graphql/mutations';
import MainPricingDashboard from '../components/MainPricingDashboard';

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
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

function getMakeModel(record) {
  const { searchType, responseData } = record;
  if (!responseData) return 'N/A';

  if (searchType === 'MOT') {
    const make = responseData.DataItems?.VehicleDetails?.Make || 'Unknown';
    const model = responseData.DataItems?.VehicleDetails?.Model || 'Unknown';
    return `${make} ${model}`;
  } else if (searchType === 'Valuation') {
    const make =
      responseData.vehicleAndMotHistory?.DataItems?.ClassificationDetails?.Dvla
        ?.Make || 'ValMake?';
    const model =
      responseData.vehicleAndMotHistory?.DataItems?.ClassificationDetails?.Dvla
        ?.Model || 'ValModel?';
    return `${make} ${model}`;
  } else if (searchType === 'VDI' || searchType === 'HPI') {
    const make = responseData.vdiCheckFull?.DataItems?.Make || 'N/A';
    const model = responseData.vdiCheckFull?.DataItems?.Model || '';
    return `${make} ${model}`;
  }
  return 'N/A';
}

export default function CreditManagementPage() {
  // On mount, set body background to #1560bf
  useEffect(() => {
    document.body.style.backgroundColor = '#1560bf';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const [activeTab, setActiveTab] = useState('credits');

  const [motCredits, setMotCredits] = useState(0);
  const [valuationCredits, setValuationCredits] = useState(0);
  const [hpiCredits, setHpiCredits] = useState(0);
  const [freeMotChecksUsed, setFreeMotChecksUsed] = useState(0);

  const [profileInfo, setProfileInfo] = useState(null);

  // For password changes
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

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

  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);
  const [changePasswordMutation, { loading: cpLoading, error: cpError }] =
    useMutation(CHANGE_PASSWORD);

  // Populate user data
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

  console.log("Profile Data", profileData);
  console.log("Profile Info", profileInfo)

  const dateRegistered = profileInfo?.createdAt
    ? formatTimestamp(profileInfo.createdAt)
    : 'N/A';

  // Purchase logic
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      Valuation: 'VALUATION',
      VDI: 'VDI',
      MOT: 'MOT'
    };
    const creditType = productMap[product] || 'VDI';
    try {
      const { data } = await createSession({ variables: { creditType, quantity } });
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change password logic
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
    <>
      {/* Inlined style to handle the tab colors & container backgrounds */}
      <style>{`
        .nav-tabs {
          background-color: #1560bd !important; /* entire tab bar is #1560bd by default */
          border: none !important;
        }
        .nav-tabs .nav-link {
          color: #fff !important; 
          background-color: #1560bd !important; /* inactive tab is #1560bd */
          border: none !important;
          margin-right: 2px; /* small gap */
        }
        .nav-tabs .nav-link:hover {
          background-color: #1282d2 !important; /* slight hover effect */
        }
        .nav-tabs .nav-link.active {
          background-color: #003366 !important; /* active tab is #003366 */
          border-bottom: 3px solid #fff !important;
        }
        /* Make the tab content background white */
        .tab-content {
          background: #fff;
          border: 1px solid #ddd;
          border-top: none;
          padding: 2rem;
          border-radius: 0 0 5px 5px;
        }
        /* Remove container background so we see the page background (#1560bf) behind the tabs */
        .dashboard-container {
          background: none; 
        }
        /* Full-width for MainPricing area */
        .pricing-fullwidth {
          width: 100%;
          margin-left: -15px; 
          margin-right: -15px; 
        }
         
        @media (min-width: 576px) {
          /* On small+ breakpoints, or you can do further logic to truly go edge to edge if you have row/col classes */
          .pricing-fullwidth {
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>

      <div className="container my-4 dashboard-container">
        <h1 className="mb-4" style={{ color: '#fff' }}>User Dashboard</h1>

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
        </ul>

        <div className="tab-content py-3">
          {/* CREDITS TAB */}
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

              {/* FULL-WIDTH MAINPRICING SECTION */}
              <div className="pricing-fullwidth">
                <MainPricingDashboard
                  isLoggedIn={!!localStorage.getItem('authToken')}
                  hasUsedFreeMOT={freeMotChecksUsed >= 3}
                  onPurchase={(product, quantity) => handlePurchase(product, quantity)}
                />
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="tab-pane active">
              <h2>Search History</h2>
              {historyLoading && (
                <div className="text-center my-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading history...</span>
                  </div>
                </div>
              )}
              {historyError && (
                <div className="alert alert-danger">Error: {historyError.message}</div>
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

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="tab-pane active">
              <h2>Transactions</h2>
              {transactionsLoading && (
                <div className="text-center my-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading transactions...</span>
                  </div>
                </div>
              )}
              {transactionsError && (
                <div className="alert alert-danger">Error: {transactionsError.message}</div>
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

          {/* PROFILE TAB */}
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
          
        </div>
      </div>
    </>
  );
}
