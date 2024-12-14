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
        // Redirect user to Stripe Checkout
        window.location.href = data.createCreditPurchaseSession;
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading credits...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error.message}</p>;

  const { email, motCredits, vdiCredits, freeMotChecksUsed } = data.getUserProfile;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Credit Management</h1>
      <p>Email: {email}</p>
      <p>MOT Credits: {motCredits}</p>
      <p>VDI Credits: {vdiCredits}</p>
      <p>Free MOT Checks Used: {freeMotChecksUsed} / 3</p>

      <h2>Purchase MOT Credits</h2>
      <button onClick={() => handlePurchase('MOT', 10)}>Buy 10 MOT Credits (£1.50)</button>
      <button onClick={() => handlePurchase('MOT', 20)}>Buy 20 MOT Credits (£2.00)</button>
      <button onClick={() => handlePurchase('MOT', 50)}>Buy 50 MOT Credits (£4.00)</button>
      <button onClick={() => handlePurchase('MOT', 100)}>Buy 100 MOT Credits (£7.50)</button>

      <h2>Purchase VDI Credits</h2>
      <button onClick={() => handlePurchase('VDI', 1)}>Buy 1 VDI Check (£6.99)</button>
      <button onClick={() => handlePurchase('VDI', 10)}>Buy 10 VDI Credits (£60)</button>
      <button onClick={() => handlePurchase('VDI', 20)}>Buy 20 VDI Credits (£100)</button>
      <button onClick={() => handlePurchase('VDI', 50)}>Buy 50 VDI Credits (£200)</button>
      <button onClick={() => handlePurchase('VDI', 100)}>Buy 100 VDI Credits (£350)</button>

      <div className="ad-banner" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default CreditManagementPage;
