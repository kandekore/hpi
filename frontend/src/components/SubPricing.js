import React, { useState } from 'react';

export default function SubPricing({
  product,
  isLoggedIn,
  onClose,
  onPurchase
}) {
  // local state for any error message
  const [errorMsg, setErrorMsg] = useState('');

  let title = '';
  let deals = [];

  if (product === 'VDI') {
    title = 'VDI Full Lookup';
    deals = [
      { quantity: 1, label: '1 Search', price: '£9.99' },
      { quantity: 3, label: '3 Searches', price: '£22.49' },
      { quantity: 10, label: '10 Searches', price: '£60.00' },
    ];
  } else if (product === 'Valuation') {
    title = 'Vehicle Valuation';
    deals = [
      { quantity: 1, label: '1 Search', price: '£4.99' },
      { quantity: 3, label: '3 Searches', price: '£12.49' },
      { quantity: 10, label: '10 Searches', price: '£30.00' },
    ];
  } else if (product === 'MOT') {
    title = 'MOT Full History';
    deals = [
      { quantity: 10, label: '10 Searches', price: '£1.50' },
      { quantity: 50, label: '50 Searches', price: '£4.00' },
    ];
  }

  // When user clicks "Buy"
  const handleDealClick = (qty) => {
    if (!isLoggedIn) {
      // show error inside modal
      setErrorMsg(
        'You must be logged in to purchase. Please ' +
        'login or register using the links below.'
      );
      return;
    }
    // Otherwise proceed
    onPurchase(product, qty);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 style={styles.modalTitle}>{title} – Sub Pricing</h2>
        <p style={{ marginBottom: '1.5rem' }}>Select a package below:</p>

        {errorMsg && (
          <div style={styles.errorBox}>
            <p>{errorMsg}</p>
            <p>
              <a href="/login" style={styles.link}>Login</a> |{' '}
              <a href="/register" style={styles.link}>Register</a>
            </p>
          </div>
        )}

        <div style={styles.dealsContainer}>
          {deals.map((deal) => (
            <div key={deal.quantity} style={styles.dealBox}>
              <h4 style={styles.dealLabel}>{deal.label}</h4>
              <p style={styles.dealPrice}>{deal.price}</p>
              <button
                style={styles.dealButton}
                onClick={() => handleDealClick(deal.quantity)}
              >
                Buy
              </button>
            </div>
          ))}
        </div>

        <button style={styles.closeBottom} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '2rem',
    position: 'relative',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    border: 'none',
    background: 'transparent',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#666',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '0.5rem',
    color: '#003366',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c2c7',
    borderRadius: '5px',
    padding: '0.75rem',
    color: '#842029',
    marginBottom: '1rem',
  },
  link: {
    color: '#003366',
    textDecoration: 'underline',
  },
  dealsContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  dealBox: {
    flex: '0 0 120px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dealLabel: {
    margin: '0.5rem 0',
    fontWeight: '600',
    color: '#003366',
  },
  dealPrice: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    margin: '0.5rem 0 1rem 0',
  },
  dealButton: {
    backgroundColor: '#003366',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  closeBottom: {
    marginTop: '1.5rem',
    backgroundColor: '#999',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    float: 'right',
  },
};
