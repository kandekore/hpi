import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';

// 1) Import the HOOK from react-to-print


export default function MOTPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialReg = searchParams.get('reg') || '';
  const [reg, setReg] = useState(initialReg);
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  const [motCheck, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK);
  const hasResults = !!(motData && motData.motCheck);



  useEffect(() => {
    if (initialReg) {
      handleCheck();
      navigate('/mot', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn) return;
    if (!reg) return;
    await motCheck({ variables: { reg } });
  };

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
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
        /* Removed min-height: 100vh to avoid forced full-height hero. */
        .hero {
          width: 100%;
        }
        .hero-content {
          padding: 2rem;
          text-align: center;
        }
        .plate-container {
          width: 55%;
          height: 200px;
          margin: 2rem auto;
          display: flex;
          align-items: stretch;
          border: 2px solid #000;
          border-radius: 25px;
          overflow: hidden;
              max-width: 785px;

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
            height: 120px;
            margin: 1rem auto;
          }
          .plate-blue {
            width: 80px;
            font-size: 3rem;
          }
          .plate-input {
            font-size: 3.5rem;
            padding-left: 5%;
          }
        }
      `}</style>

      <div className="hero">
      <div className="hero-content">
        <h1>MOT Check</h1>
        <p>Enter your vehicle registration to see its full MOT history.</p>

        <div className="plate-container">
          <div className="plate-blue">GB</div>
          <input
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
              onClick={handleCheck}
              disabled={motLoading}
            >
              {motLoading ? 'Checking...' : 'Check MOT'}
            </button>
          )}
        </div>

        {attemptedSearch && !isLoggedIn && (
          <div className="alert alert-info mt-2">
            Please login or register to do an MOT check.
          </div>
        )}
        {motError && (
          <div className="alert alert-danger mt-2">
            {motError.message}
          </div>
        )}
      </div>

      {/* Conditionally show results & "Print" button if we have data */}
      {motData?.motCheck && (
        <div className="container mb-5">
          {/* 4) Standard button that calls handlePrint */}
         
          {/* 
            5) The part we actually want to print, 
            wrapped in a div with ref={printRef}
          */}
         
            <MOTResultDisplay 
              motCheck={motData.motCheck}
              userProfile={userProfile}
            />
          </div>
      
      )}
    </div>
  </>
);
}
