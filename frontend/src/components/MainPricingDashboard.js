import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubPricing from './SubPricing';

export default function MainPricing({
  isLoggedIn,
  hasUsedFreeMOT,
  onPurchase,
}) {
  const [subProduct, setSubProduct] = useState(null);

  // Access the current path
  const location = useLocation();
  const isCreditsPage = location.pathname === '/credits';

  const handleBuy = (productKey) => {
    setSubProduct(productKey);
  };

  // const renderMOTButton = () => {
  //   if (!isLoggedIn || !hasUsedFreeMOT) {
  //     return (
  //       <a href="/register" style={{ textDecoration: 'none' }}>
  //         <button style={styles.registerButton}>Register</button>
  //       </a>
  //     );
  //   } else {
  //     return (
  //       <button onClick={() => handleBuy('MOT')} style={styles.buyButton}>
  //         Buy
  //       </button>
  //     );
  //   }
  // };

  // Decide panel width based on isCreditsPage
  const panelFlex = isCreditsPage ? '0 0 300px' : '0 0 400px';
  // Merge styles
  const panelStyle = {
    ...styles.panel,
    flex: panelFlex,
  };

  return (
    <div style={styles.pricingWrapper}>
      {/* Show sub pricing modal if selected */}
      {subProduct && (
        <SubPricing
          product={subProduct}
          isLoggedIn={isLoggedIn}
          onClose={() => setSubProduct(null)}
          onPurchase={onPurchase}
        />
      )}

      <div style={styles.tieredContainer}>
        {/* MOT Panel */}
        <div style={panelStyle}>
        <h3 style={styles.title}>
        MOT
        <br />
        Full History
      </h3>
      <img src='/images/moticon.png' />
      <hr />
      <p style={styles.subheading}>From*</p>
      <p style={styles.price}>FREE</p>
      <p style={styles.small}><br /></p>
      <hr />
     
      <p>3  Searches – FREE*</p>
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
          <button onClick={() => handleBuy('MOT')} style={styles.buyButton}>Buy</button>
        </div>

        {/* Valuation Panel */}
        <div style={panelStyle}>
        <h3 style={styles.title}>
        Vehicle Valuation
        <br />
        + Full MOT History
      </h3>
      <img src='/images/valueicon.png' />
      <hr />
      <p style={styles.subheading}>From*</p>
      <p style={styles.price}>£2.99</p>
      <p style={styles.small}>per search</p>
      <hr />
      <p>1 Search    –  £4.99</p>
      <p>3 Searches  –  £12.49</p>
      <p>10 Searches –  £29.99*</p>
      <hr />
      <p style={styles.dataTitle}>Data Includes:</p>
      <ul style={styles.list}>
        <li>Private Valuation</li>
        <li>Retail Valuation</li>
        <li>Trade Valuation</li>
        <li>-</li>
        <li style={styles.addon}>
          <strong>MOT Full History</strong>
        </li>
      </ul>
      <hr />
          <button onClick={() => handleBuy('Valuation')} style={styles.buyButton}>
            Buy
          </button>
        </div>

        {/* VDI Panel */}
        <div style={panelStyle}>
        <h3 style={{ ...styles.title, color: '#003366' }}>
        Detailed Vehicle Data
        <br />
        &amp; Full Vehicle History
      </h3>
      <img src='/images/reporticon.png' />
      <hr />
      <p style={styles.subheading}>From*</p>
      <p style={styles.price}>£5.99</p>
      <p style={styles.small}>per search</p>
      <hr />
      
      <p>1 Search – £9.49</p>
      <p>3 Searches – £22.49</p>
      <p>10 Searches – £59.99*</p>
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
        <li>-</li>
        <li style={styles.addon}>
          <strong>Vehicle Valuation</strong>
        </li>
        <li style={styles.addon}>
          <strong>MOT Full History</strong>
        </li>
      </ul>
      <hr />
          <button onClick={() => handleBuy('FULL_HISTORY')} style={styles.buyButton}>
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pricingWrapper: {
    position: 'relative',
    paddingTop: '3rem',
    paddingBottom: '3rem',
    backgroundColor: '#fff',
  },
  tieredContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    backgroundColor: '#fffff',
  },
  panel: {
    border: '2px solid rgb(89, 90, 92)',
    borderRadius: '25px',
    backgroundColor: '#fdfdfd',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    minWidth: '280px',
  },
  title: {
    marginBottom: '1rem',
    fontSize: '1.5rem',
    lineHeight: '2rem',
    color: '#003366',
    textShadow: '1px 1px #1560bf',
  },
  subheading: {
    marginBottom: '-20px',
    fontWeight: '600',
  },
  price: {
    fontWeight: 'bold',
    color: '#003366',
    fontSize: '2rem',
    lineHeight: '2.3',
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
  addon: {
    color: '#003366',
    fontWeight: '600',
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
  small: {
  fontSize: '.875em',
  marginTop: '-40px',
},
};
