import React, { useState, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GET_USER_PROFILE, MOT_CHECK } from '../graphql/queries';
import MOTResultDisplay from '../components/MOTResultDisplay';
import { useReactToPrint } from 'react-to-print';
import VehicleDetailsMOT from '../components/VehicleDetailsMOT';

// You can import a background if you want, or reuse your drkbgd.jpg
import heroBg from '../images/drkbgd.jpg';

export default function MOTPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialReg = searchParams.get('reg') || '';
  const [reg, setReg] = useState(initialReg);
  const [attemptedSearch, setAttemptedSearch] = useState(false);

  // Query user
  const { data: profileData } = useQuery(GET_USER_PROFILE);
  const userProfile = profileData?.getUserProfile || null;
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Lazy query for MOT
  const [motCheck, { data: motData, loading: motLoading, error: motError }] =
    useLazyQuery(MOT_CHECK);

  const hasResults = !!(motData && motData.motCheck);

  // For printing
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `MOT_Report_${reg}`,
  });

  // If there's a ?reg= param, auto-check once
  React.useEffect(() => {
    if (initialReg) {
      handleCheck();
      navigate('/mot', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  const handleRegChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 8) setReg(val);
  };

  const handleCheck = async () => {
    setAttemptedSearch(true);
    if (!isLoggedIn) return;
    if (!reg) return;
    await motCheck({ variables: { reg } });
  };

  return (
    <>
      <style>{`
        .mot-hero {
          width: 100%;
          min-height: 50vh;
          background: url(${heroBg}) center top no-repeat;
          background-size: cover;
          color: #fff;
          text-align: center;
          padding: 3rem 1rem;
        }
        .mot-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .mot-hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .plate-container {
          width: 70%;
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
        @media (max-width: 768px) {
          .plate-container {
            width: 100%;
            height: 120px;
            margin: 1rem auto;
          }
          .plate-blue {
            width: 80px;
            font-size: 2.5rem;
          }
          .plate-input {
            font-size: 3rem;
            padding-left: 5%;
          }
        }
        /* Additional info section styling */
        .mot-info-section {
          background: #fff;
          padding: 3rem 1rem;
          margin-top: 2rem;
        }
        .mot-info-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
        }
      `}</style>

      <div className="mot-hero">
        <h1>MOT Check</h1>
        <p>Instantly retrieve your vehicle’s MOT history and advisories.</p>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="plate-container">
            <div className="plate-blue">GB</div>
            <input
              className="plate-input"
              placeholder="AB12 CDE"
              value={reg}
              onChange={handleRegChange}
            />
          </div>

          <div className="text-center">
            {hasResults ? (
              <button
                onClick={() => window.location.reload()}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#1560BD',
                  color: '#fff',
                  marginTop: '1rem',
                }}
              >
                Search Again
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={motLoading}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  padding: '0.5rem 2rem',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#1560BD',
                  color: '#fff',
                  marginTop: '1rem',
                }}
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
      </div>

      {motData?.motCheck && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="text-end mb-2">
            
          </div>
           <div>
           <VehicleDetailsMOT
                dataItems={motData.motCheck}
                userProfile={userProfile}
                // so the child can read MileageRecordList
              /></div> 
         <div>
            <MOTResultDisplay motCheck={motData.motCheck} userProfile={userProfile} />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mot-info-section">
        <h2>Why is an MOT Check Important?</h2>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p>
            Regular MOT checks ensure your vehicle meets the minimum safety 
            standards required by law. Our MOT service helps you quickly see 
            the car’s test results, mileage records, and advisories, so 
            you’ll never be in the dark about a vehicle’s condition.
          </p>
          <ul>
            <li>Uncover hidden or recurring faults</li>
            <li>Validate the accuracy of the stated mileage</li>
            <li>Check for signs of poor maintenance</li>
          </ul>
          <p>
            By running an MOT check through our system, you’ll have peace 
            of mind before committing to a purchase or taking a long trip 
            with your car.
          </p>
        </div>
      </div>
    </>
  );
}
