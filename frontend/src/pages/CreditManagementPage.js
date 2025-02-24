// src/pages/CreditManagementPage.js
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { CREATE_CREDIT_PURCHASE_SESSION } from '../graphql/mutations';

function CreditManagementPage() {
  const { data, loading, error } = useQuery(GET_USER_PROFILE);
  const [createSession] = useMutation(CREATE_CREDIT_PURCHASE_SESSION);

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

  if (loading)
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading credits...</span>
        </div>
      </div>
    );
  if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

  const { email, motCredits, vdiCredits, freeMotChecksUsed } = data.getUserProfile;

  return (
    <div className="container my-4">
      <h1 className="mb-4">Credit Management</h1>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">User Profile</h5>
          <p className="card-text"><strong>Email:</strong> {email}</p>
          <p className="card-text"><strong>MOT Credits:</strong> {motCredits}</p>
          <p className="card-text"><strong>VDI Credits:</strong> {vdiCredits}</p>
          <p className="card-text"><strong>Free MOT Checks Used:</strong> {freeMotChecksUsed} / 3</p>
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
                <button className="btn btn-primary" onClick={() => handlePurchase('MOT', pkg.quantity)}>
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
                <button className="btn btn-primary" onClick={() => handlePurchase('VDI', pkg.quantity)}>
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
  );
}

export default CreditManagementPage;
