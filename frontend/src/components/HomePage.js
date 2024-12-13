import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { MOT_CHECK } from '../graphql/queries';

function HomePage() {
  const [reg, setReg] = useState('');
  const [motCheck, { data, error }] = useLazyQuery(MOT_CHECK);

  const handleCheck = () => {
    motCheck({ variables: { reg } });
  };

  return (
    <div>
      <h1>Check your MOT for free</h1>
      <input value={reg} onChange={e => setReg(e.target.value)} placeholder="Vehicle Registration" />
      <button onClick={handleCheck}>Check MOT</button>
      {error && <p>{error.message}</p>}
      {data && <pre>{JSON.stringify(data.motCheck, null, 2)}</pre>}
      <p>Check the HPI status of a car <a href="/vdi">here</a></p>
      {/* Ads and other UI elements */}
    </div>
  );
}

export default HomePage;
