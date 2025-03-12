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
    <div style={{ position: 'relative', paddingTop: '3rem', paddingBottom: '3rem',backgroundColor: '#1560bd' }}>
    
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
        // <div style={styles.centerPanel}>
          <h3 style={styles.title}>MOT<br></br>Full History</h3>
          <p style={styles.subheading}>3 Searches</p>
          <p style={styles.price}>FREE</p>
          <hr />
          <p style={styles.subheading}>Bulk Buy</p>
          <p>10 Searches – £1.50</p>
          <p>50 Searches – £4.00</p>
          <hr />
          <p style={styles.dataTitle}>Data Includes:</p>
          <ul style={styles.list}>
            <li className='feature'>Dates &amp; Test Number</li>
            <li className='feature'>Mileage</li>
            <li className='feature'>Advisory &amp; Failure Details</li>
          </ul>
          <hr />
          {renderMOTButton()}
        </div>
        <div style={styles.centerPanel}>
        <h3 style={styles.title}>Vehicle Valuation<br></br>+Full MOT History</h3>
        <p style={styles.subheading}>1 Search</p>
        <p style={styles.price}>£4.99</p>
        <hr />
        <p style={styles.subheading}>Bulk Buy</p>
        <p>3 Searches – £12.49</p>
        <p>10 Searches – £30.00</p>
        <hr />
        <p style={styles.dataTitle}>Data Includes:</p>
        <ul style={styles.list}>
        
          <li className='feature'>Private Valuation</li>
          <li className='feature'>Retail Valuation</li>
          <li className='feature'>Trade Valuation</li>
          <li>-</li>
          <li style={styles.addon}><strong>MOT Full History
        </strong></li>
        </ul>
        <hr />
        <button onClick={() => handleBuy('Valuation')} style={styles.buyButton}>
          Buy
        </button>
      </div>
        {/* CENTER: VDI Full Lookup (primary) */}
        <div style={styles.centerPanel}>
          <h3 style={{ ...styles.title, color: '#003366'}}>
            Detailed Vehicle Data<br></br>& Full Vehicle History
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
            <li className='feature'>Outstanding Finance</li>
            <li className='feature'>Insurance Write Off</li>
            <li className='feature'>Ownership &amp; Car Identity</li>
            <li className='feature'>VIN Confirmation</li>
            <li className='feature'>Scrapped / Mileage Anomaly / Colour Change</li>
            <li className='feature'>Import Check / Emissions &amp; Tax Rates</li>
            <li className='feature'>Technical Details</li>
            <li>-</li>
            <li style={styles.addon}><strong>Vehicle Valuation</strong></li>
            <li style={styles.addon}><strong>MOT Full History
        </strong></li>
          </ul>
          <hr />
          <button onClick={() => handleBuy('VDI')} style={styles.buyButton}>
            Buy
          </button>
        </div>

        {/* RIGHT: Vehicle Valuation */}
     
      </div>
    </div>
  );
}

// Minimal inline styles – you can move to .css if you prefer
const styles = {

 addon: {
    color:'#003366',
    fontWeight:'600'
},
  tieredContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '1rem',
    position: 'relative',
    backgroundColor: '#1560bd',
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
    position: 'top',
    // Overlap effect:
    top: '0px',
    zIndex: 2,
    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '2rem',
    lineHeight: '2.15rem',
    color: '#003366',
    textShadow:'1px 1px #1560bf'
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
    listStyle: 'none',
    padding: '3px',
    textAlign: 'center',
    
    margin: '0 auto',
    width: '85%',
    lineHeight: '1.4',
   
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
  padding: '60px 0px!important;',
  alignItems: 'flex-start !important;',
},

};
