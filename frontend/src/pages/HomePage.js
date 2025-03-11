// src/pages/HomePage.js
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';

// If you have a background image:
import drkbgd from '../images/backgrd.jpg';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');
  
  // For MOT, check if free searches used up:
  const freeMotChecksUsed = userProfile?.freeMotChecksUsed ?? 0;
  const hasFreeMotLeft = freeMotChecksUsed < 3;

  // For Valuation credits:
  const hasValuationCredits = (userProfile?.valuationCredits ?? 0) > 0;

  // For VDI => in your logic, it might be userProfile?.valuationCredits also 
  // or hpiCredits? or a separate "vdiCredits"? 
  // Some apps treat VDI the same as "valuationCredits"? 
  // But if you have a separate "VDI credits," do that here:
  const hasVdiCredits = (userProfile?.hpiCredits?? 0)> 0
  // Or if you share them with Valuation, adapt as needed

  const navigate = useNavigate();

  // Limit the input to 8 chars
  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) {
      setReg(val);
    }
  };

  // Common check => if not logged in => show error
  // else if no credits => show error
  // else => navigate
// In HomePage.js (or wherever you handle the “MOT History” button):
const handleClickMOT = () => {
  setErrorMsg('');

  if (!reg) {
    setErrorMsg('Please enter a valid registration.');
    return;
  }

  if (!isLoggedIn) {
    setErrorMsg('Please login or register to do an MOT check.');
    return;
  }

  // userProfile might be undefined if not loaded. So check userProfile first:
  if (!userProfile) {
    setErrorMsg('Unable to fetch your profile. Please try again later.');
    return;
  }

  // We combine free check logic + purchased credit logic:
  const freeMotChecksUsed = userProfile.freeMotChecksUsed ?? 0;
  const motCredits = userProfile.motCredits ?? 0;

  if (freeMotChecksUsed < 3 || motCredits > 0) {
    // They have either free checks left or purchased credits
    navigate(`/mot?reg=${reg}`);
  } else {
    // No free checks and no purchased credits
    setErrorMsg('You have no MOT checks remaining. Please purchase MOT credits or wait for more free checks.');
  }
};

  const handleClickValuation = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg('Please login or register to do a Valuation check.');
      return;
    }
    if (!hasValuationCredits) {
      setErrorMsg('You have no Valuation credits left. Please purchase more.');
      return;
    }
    navigate(`/valuation?reg=${reg}`);
  };

  const handleClickVDI = () => {
    setErrorMsg('');
    if (!reg) {
      setErrorMsg('Please enter a valid registration.');
      return;
    }
    if (!isLoggedIn) {
      setErrorMsg('Please login or register to do a VDI check.');
      return;
    }
    if (!hasVdiCredits) {
      setErrorMsg('You have no VDI credits left. Please purchase more.');
      return;
    }
    navigate(`/hpi?reg=${reg}`);
  };

  return (
    <>
      <style>{`
        /* Full width / height hero with background image repeated or covered: */
        html, body {
          margin: 0;
          padding: 0;
        }
        .hero {
          width: 100%;
          min-height: 100vh;
          background: url(${drkbgd}) center top repeat-y; 
          /* or background-size: cover; if you want a full image that doesn't tile */
          display: flex;
          flex-direction: column;
        }
        .hero-content {
          flex: 1;
          padding: 2rem;
        }

        .plate-container {
          width: 40%;
          height: 200px;
          margin: 2rem auto;
          display: flex;
          align-items: stretch;
          border: 2px solid #000;
          border-radius: 25px;
          overflow: hidden;
        }
        .plate-blue {
          background-color: #003399;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 130px;
          font-size: 4.5rem;
          font-weight: bold;
          padding: 5px;
        }
        .plate-input {
          flex: 1;
          background-color: #FFDE46;
          color: #000;
          font-weight: bold;
          font-size: 7rem;
          border: none;
          text-transform: uppercase;
          padding: 0 1rem;
          outline: none;
          line-height: 1;
          padding-left: 10%;
        }

        .submit {
          text-align: center;
        }

        .button-group {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .action-button {
          background-color: #1560BD;
          color: #fff;
          font-weight: bold;
          border: none;
          border-radius: 25px;
          padding: 10px 25px;
          cursor: pointer;
          font-size: 2rem;
        }

        .action-button:hover {
          background-color: #0d4f9c;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* If you'd like a smaller input on mobile */
        @media (max-width: 768px) {
          .plate-container {
            width: 100%;
            height: 150px;
            margin: 1rem auto;
          }
          .plate-blue {
            width: 80px;
            font-size: 3rem;
          }
          .plate-input {
            font-size: 6.5rem;
            padding-left: 5%;
          }
          .action-button {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-content">
          <h1>All-In-One Vehicle Check</h1>
          <p>
            Enter your vehicle registration below, then pick from 
            MOT History, Valuation, or Full VDI Check. 
          </p>

          {/* Big plate */}
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              type="text"
              className="plate-input"
              placeholder="AB12CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          {/* Buttons side by side */}
          <div className="button-group">
            <button className="action-button" onClick={handleClickMOT}>
              MOT History
            </button>
            <button className="action-button" onClick={handleClickValuation}>
              Valuation
            </button>
            <button className="action-button" onClick={handleClickVDI}>
              Full VDI
            </button>
          </div>

          {/* Show error if needed */}
          {errorMsg && (
            <div className="alert alert-danger mt-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
