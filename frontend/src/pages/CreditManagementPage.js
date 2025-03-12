import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  GET_USER_PROFILE,
  GET_SEARCH_HISTORY,
  GET_TRANSACTIONS
} from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION, CHANGE_PASSWORD } from '../graphql/mutations';
import MainPricing from '../components/MainPricing';

// Utility to format timestamps
function formatTimestamp(ts) {
  if (!ts) {
    return 'N/A';
  }
  // 1) If purely digits => parse as integer (epoch ms)
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
  // 2) Otherwise handle potential ISO with +00:00
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

// Example function to extract make/model
function getMakeModel(record) {
  const { searchType, responseData } = record;
  if (!responseData) return 'N/A';
  console.log(record);
  console.log('responseData =>', responseData);

  // Example logic depends on how your data is actually structured
  if (searchType === 'MOT') {
    // Suppose MOT might have: responseData.DataItems?.Vehicle?.make / .model
    const make = responseData.DataItems.VehicleDetails.Make || 'Unknown';
    const model = responseData.DataItems.VehicleDetails.Model || 'Unknown';
    return `${make} ${model}`;
  } else if (searchType === 'Valuation') {
    // Maybe Valuation has: responseData.vehicleAndMotHistory?.make, model
    const make = responseData.vehicleAndMotHistory.DataItems.ClassificationDetails.Dvla.Make || 'ValMake?';
    const model = responseData.vehicleAndMotHistory.DataItems.ClassificationDetails.Dvla.Model || 'ValModel?';
    return `${make} ${model}`;
  } else if (searchType === 'VDI' || searchType === 'HPI') {
    // Suppose: responseData.vdiCheckFull.DataItems?.BasicData?.MakeModel?
    const make = responseData.vdiCheckFull.DataItems.Make || 'N/A';
    const model = responseData.vdiCheckFull.DataItems.Model || '';
    return `${make} ${model}`;
  }
  return 'N/A';
}


function CreditManagementPage() {

  useEffect(() => {
    document.body.style.backgroundColor = '#1560bf';
    return () => {
      // When the component unmounts, reset body background
      document.body.style.backgroundColor = '';
    };
  }, []);
  const [activeTab, setActiveTab] = useState('credits');

  // For user credits
  const [motCredits, setMotCredits] = useState(0);
  const [valuationCredits, setValuationCredits] = useState(0);
  const [hpiCredits, setHpiCredits] = useState(0);
  const [freeMotChecksUsed, setFreeMotChecksUsed] = useState(0);

  // For user profile info (email, username, phone, createdAt, etc.)
  const [profileInfo, setProfileInfo] = useState(null);

  // For password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 1) Query user profile
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError
  } = useQuery(GET_USER_PROFILE);

  // 2) Query search history if tab=history
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError
  } = useQuery(GET_SEARCH_HISTORY, {
    skip: activeTab !== 'history',
    fetchPolicy: 'network-only'
  });

  // 3) Query transactions if tab=transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError
  } = useQuery(GET_TRANSACTIONS, {
    skip: activeTab !== 'transactions',
    fetchPolicy: 'network-only'
  });

  // 4) Prepare purchase mutation
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

  // 5) Prepare change password mutation
  const [changePasswordMutation, { loading: cpLoading, error: cpError }] =
    useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    if (profileData && profileData.getUserProfile) {
      const user = profileData.getUserProfile;
      setMotCredits(user.motCredits);
      setValuationCredits(user.valuationCredits);
      setHpiCredits(user.hpiCredits || 0);
      setFreeMotChecksUsed(user.freeMotChecksUsed);
      console.log(user);

      // If the server returns these extra fields:
      setProfileInfo({
        email: user.email,
        username: user.username || '',
        phone: user.phone || '',
        // Suppose the backend Mongoose model has timestamps => user.createdAt
        createdAt: user.createdAt
      });
    }
  }, [profileData]);
console.log(profileData);
console.log(profileInfo)
  // Possibly format the dateRegistered
  const dateRegistered = profileInfo?.createdAt
    ? formatTimestamp(profileInfo.createdAt)
    : 'N/A';

  // Purchase credits
  const handlePurchase = async (product, quantity) => {
    const productMap = {
      'Valuation': 'VALUATION',
      'VDI': 'VDI',
      'MOT': 'MOT',
    };
    const creditType = productMap[product] || 'VDI';

    try {
      const { data } = await createSession({ variables: { creditType, quantity }});
      if (data.createCreditPurchaseSession) {
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle change password
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
        variables: {
          currentPassword,
          newPassword
        }
      });
      if (data.changePassword) {
        setPassSuccess('Password changed successfully!');
        // clear fields
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
    return (
      <div className="alert alert-danger">
        Error: {profileError.message}
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">User Dashboard</h1>

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
          <div>
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

            <MainPricing
              isLoggedIn={!!localStorage.getItem('authToken')}
              hasUsedFreeMOT={freeMotChecksUsed >= 3}
              onPurchase={(product, quantity) => handlePurchase(product, quantity)}
            />
          </div>
        )}

        {/* HISTORY TAB */}
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
                      console.log('record', record);
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
                      const rawTimestamp = tx.timestamp || tx.responseData?.timestamp;
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
          <div>
            <h2>Your Profile</h2>
            {profileInfo ? (
              <>
                <p><strong>Email:</strong> {profileInfo.email}</p>
                <p><strong>Username:</strong> {profileInfo.username}</p>
                <p><strong>Phone:</strong> {profileInfo.phone}</p>
                <p><strong>Date Registered:</strong> {dateRegistered}</p>
              </>
            ) : (
              <p>Unable to load profile info.</p>
            )}

            <hr />

            <h3>Change Password</h3>
            {passError && (
              <div className="alert alert-danger">{passError}</div>
            )}
            {passSuccess && (
              <div className="alert alert-success">{passSuccess}</div>
            )}

            <div className="mb-3">
              <label htmlFor="currentPass" className="form-label">Current Password</label>
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
              <label htmlFor="newPass" className="form-label">New Password</label>
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
              <label htmlFor="confirmNewPass" className="form-label">Confirm New Password</label>
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
  );
}

export default CreditManagementPage;
