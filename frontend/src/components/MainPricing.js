// src/components/MainPricing.js

import React, { useState } from 'react';
import SubPricing from './SubPricing';

export default function MainPricing({
  isLoggedIn,
  hasUsedFreeMOT,
  onPurchase // (product, quantity) => triggers Stripe
}) {
  const [subProduct, setSubProduct] = useState(null);

  // Show sub table (modal) for the chosen product
  const handleBuy = (productKey) => {
    // e.g. "VDI", "Valuation", or "MOT"
    setSubProduct(productKey);
  };

  // Example MOT button logic:
  // If user is not logged in => "Register"
  // If user is logged in but hasn't used free => "Register"
  // If user is logged in and free used => "Buy"
  const renderMOTButton = () => {
    if (!isLoggedIn || !hasUsedFreeMOT) {
      return (
        <a href="/register" style={{ textDecoration: 'none' }}>
          <button style={styles.registerButton}>
            Register
          </button>
        </a>
      );
    } else {
      return (
        <button onClick={() => handleBuy('MOT')} style={styles.buyButton}>
          Buy
        </button>
      );
    }
  };

  return (
    <div style={{ position: 'relative', paddingTop: '3rem', paddingBottom: '3rem',backgroundColor: '#003366' }}>
    
      {/* SubPricing modal => appears if subProduct != null */}
      {subProduct && (
        <SubPricing
  product={subProduct}
  isLoggedIn={isLoggedIn} // <— pass it here
  onClose={() => setSubProduct(null)}
  onPurchase={onPurchase}
/>

      )}

  

      {/* 3-product container (tiered) */}
      <div style={styles.tieredContainer} className='tier'>
        
        {/* LEFT: MOT panel */}
        <div style={{ ...styles.sidePanel, marginTop: '10px' }}>
          <h3 style={styles.title}>MOT Full History</h3>
          <p style={styles.subheading}>3 Searches</p>
          <p style={styles.price}>FREE</p>
          <hr />
          <p style={styles.subheading}>Bulk Buy</p>
          <p>10 Searches – £1.50</p>
          <p>50 Searches – £4.00</p>
          <hr />
          <p style={styles.dataTitle}>Data Includes:</p>
          <ul style={styles.list}>
            <li>Dates &amp; Test Number</li>
            <li>Mileage</li>
            <li>Advisory &amp; Failure Details</li>
          </ul>
          <hr />
          {renderMOTButton()}
        </div>

        {/* CENTER: VDI Full Lookup (primary) */}
        <div style={styles.centerPanel}>
          <h3 style={{ ...styles.title, color: '#003366'}}>
            VDI / HPI Full Lookup
          </h3>
          <p style={styles.subheading}>1 Search</p>
          <p style={styles.price}>£9.99</p>
          <hr />
          <p style={styles.subheading}>Bulk Buy</p>
          <p>3 Searches – £22.49</p>
          <p>10 Searches – £60.00</p>
          <hr />
          <p style={styles.dataTitle}>Data Includes:</p>
          <ul style={styles.list}>
            <li>Outstanding Finance</li>
            <li>Insurance Write Off</li>
            <li>Ownership &amp; Car Identity</li>
            <li>VIN Confirmation</li>
            <li>Scrapped / Mileage Anomaly / Colour Change</li>
            <li>Import Check / Emissions &amp; Tax Rates</li>
            <li>Technical Details</li>
            <li>Valuation &amp; Full MOT History</li>
          </ul>
          <hr />
          <button onClick={() => handleBuy('VDI')} style={styles.buyButton}>
            Buy
          </button>
        </div>

        {/* RIGHT: Vehicle Valuation */}
        <div style={{ ...styles.sidePanel, marginTop: '10px' }}>
          <h3 style={styles.title}>Vehicle Valuation</h3>
          <p style={styles.subheading}>1 Search</p>
          <p style={styles.price}>£4.99</p>
          <hr />
          <p style={styles.subheading}>Bulk Buy</p>
          <p>3 Searches – £12.49</p>
          <p>10 Searches – £30.00</p>
          <hr />
          <p style={styles.dataTitle}>Data Includes:</p>
          <ul style={styles.list}>
            <li>Private Valuation</li>
            <li>Retail Valuation</li>
            <li>Trade Valuation</li>
          </ul>
          <hr />
          <button onClick={() => handleBuy('Valuation')} style={styles.buyButton}>
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

// Minimal inline styles – you can move to .css if you prefer
const styles = {
  tieredContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '1rem',
    position: 'relative',
    backgroundColor: '#003366',
  },
  sidePanel: {
    flex: '0 0 300px',
    // remove fixed height => auto adjusts
    border: '5px solid #ccc',
    borderRadius: '25px',
    backgroundColor: '#f9f9f9',
    padding: '1rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  centerPanel: {
    flex: '0 0 400px',
    border: '2px solidrgb(89, 90, 92)',
    borderRadius: '25px',
    backgroundColor: '#fdfdfd',
    padding: '1rem',
    textAlign: 'center',
    position: 'relative',
    // Overlap effect:
    top: '-10px',
    zIndex: 2,
    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '2rem',
    lineHeight: '2.3',
    color: '#003366',
  },
  subheading: {
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  price: {
    fontWeight: 'bold',
    color: '#003366',
    fontSize: '2rem',
    lineHeight: '2.3',
    margin: '0.5rem 0',
  },
  dataTitle: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    textAlign: 'left',
    margin: '0 auto',
    width: '85%',
    lineHeight: '1.4',
    paddingLeft: '1.2rem',
  },
  buyButton: {
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#003366',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  registerButton: {
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#28a745',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  },
tier: {
  padding: '60px 0px!important;'
},
};
