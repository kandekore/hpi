import React from 'react';
import { useNavigate } from 'react-router-dom';

function PleaseLoginPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Please Login or Register</h1>
      <p>You need to login or register to use your free MOT checks.</p>
      <button onClick={() => navigate('/login')} style={{ marginRight: '10px' }}>Login</button>
      <button onClick={() => navigate('/register')}>Register</button>
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default PleaseLoginPage;
