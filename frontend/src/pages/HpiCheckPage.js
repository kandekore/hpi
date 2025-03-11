import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, HPI_CHECK } from '../graphql/queries';
import HpiResultDisplay from '../components/HpiResultDisplay';

/*
  If your drkbgd.jpg is inside src/images, you'll import it like this.
  Adjust the relative path as needed (if HpiCheckPage is in /src/pages, 
  then ../images might be correct).
*/
import drkbgd from '../images/backgrd.jpg';

export default function HpiCheckPage() {
  const [reg, setReg] = useState('');
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  // If you're checking for credits:
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');
  const hasHpiCredits = (userProfile?.hpiCredits ?? 0) > 0;

  const [fetchHpi, { loading, error, data: queryData }] = useLazyQuery(HPI_CHECK);

  // Once data is returned, we show "Make another search"
  const hasResults = !!(queryData && queryData.hpiCheck);

  const handleSearch = () => {
    setAttemptedSearch(true);

    if (!reg) return;
    if (!isLoggedIn) return;
    if (!hasHpiCredits) return;

    fetchHpi({ variables: { reg } });
  };

  // Limit input to 8 characters
  const handleRegChange = (e) => {
    const inputVal = e.target.value.toUpperCase();
    if (inputVal.length <= 8) {
      setReg(inputVal);
    }
  };

  return (
    <>
      {/* Remove default browser margin so hero is truly full-width */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
        }
        /* The hero container (full screen width, top) */
        .hero {
          width: 100%;
          min-height: 100vh; /* fill vertical space as well */
          /* background: url(${drkbgd}) center top repeat-y; */
        
          /* optional: if you want some spacing for the content: */
          display: flex;
          flex-direction: column;
        }
        /* The content within the hero, so text isn't flush against the edges */
        .hero-content {
          flex: 1; /* push content to fill available space if you like */
          padding: 2rem; /* adjust to suit spacing needs */
        }

        /* Plate container (same as your code) */
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

        .plate-button {
          display: inline-block;
          margin-top: 1rem;
          background-color: #1560BD;
          color: #fff;
          font-weight: bold;
          padding: 10px 25px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 3.5rem;
        }
        .plate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive / Mobile styles */
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
        }
      `}</style>

      {/* Hero wrapper */}
      <div className="hero">
        {/* Content area inside the hero */}
        <div className="hero-content">

          <h1>Full HPI Check</h1>
          <p>
            A Full HPI Check combines multiple data sources—finance records,
            outstanding finance, stolen checks, accident history, mileage anomalies,
            plus VED and MOT data, all in one report.
          </p>

          {/* The big plate (unchanged) */}
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              type="text"
              className="plate-input"
              placeholder="AB12 CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          <div className="submit">
            {hasResults ? (
              <a
                href="#"
                style={{ fontSize: '2rem', textDecoration: 'underline' }}
                onClick={() => window.location.reload()}
              >
                Make another search
              </a>
            ) : (
              <button
                className="plate-button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Run HPI Check'}
              </button>
            )}
          </div>

          {/* Alerts if needed */}
          {attemptedSearch && !reg && (
            <div className="alert alert-warning mt-2">
              Please enter a valid registration.
            </div>
          )}
          {attemptedSearch && isLoggedIn && !hasHpiCredits && (
            <div className="alert alert-danger mt-2">
              You have no HPI Credits left. Please purchase more.
            </div>
          )}
          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info mt-2">
              Please login or register to run an HPI check.
            </div>
          )}
          {error && (
            <div className="alert alert-danger mt-2">
              Error: {error.message}
            </div>
          )}

          {/* If data => show result */}
         
        </div>
        <div> {queryData && queryData.hpiCheck && (
          <HpiResultDisplay hpiData={queryData.hpiCheck} />
        )}</div>
      </div>
    </>
  );
}
