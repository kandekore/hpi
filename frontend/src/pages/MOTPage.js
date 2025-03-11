import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';

export default function MOTPage() {
  const [reg, setReg] = useState('');
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // For the main MOT check
  const [motCheck, { data: motData, loading: motLoading, error: motError }] = useLazyQuery(MOT_CHECK);

  const hasResults = !!(motData && motData.motCheck);

  const handleCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn) return;
    await motCheck({ variables: { reg } });
  };

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    // If you want to limit to 8 chars:
    if (val.length <= 8) {
      setReg(val);
    }
  };

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
        }
        .hero {
          width: 100%;
          min-height: 100vh;
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

      <div className="hero">
        <div className="hero-content">
          <h1>MOT Check</h1>
          <p>
            Enter your vehicle registration to see its MOT history
            and whether it’s up to date.
          </p>

          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              className="plate-input"
              placeholder="AB12CDE"
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
                onClick={handleCheck}
                disabled={motLoading}
              >
                {motLoading ? 'Checking...' : 'Check MOT'}
              </button>
            )}
          </div>

          {/* If user not logged in */}
          {attemptedSearch && !isLoggedIn && (
            <div className="alert alert-info mt-2">
              Please login or register to do a MOT check.
            </div>
          )}
          {motError && (
            <div className="alert alert-danger mt-2">
              {motError.message}
            </div>
          )}
        </div>

        {/* Show results if we have them */}
        {motData && motData.motCheck && (
          <MOTResultDisplay 
            motCheck={motData.motCheck}
            userProfile={userProfile}
          />
        )}
      </div>
    </>
  );
}
