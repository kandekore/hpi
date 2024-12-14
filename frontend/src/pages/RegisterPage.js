import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerMutation, { loading, error }] = useMutation(REGISTER);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const { data } = await registerMutation({ variables: { email, password } });
      if (data.register) {
        // Save token
        localStorage.setItem('authToken', data.register);

        // If you want to handle pendingReg here as well:
        const pendingReg = sessionStorage.getItem('pendingReg');
        if (pendingReg) {
          sessionStorage.removeItem('pendingReg');
          navigate(`/?autoCheck=${pendingReg}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      /><br/><br/>
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      /><br/><br/>
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p>Already have an account? <a href="/login">Login here</a>.</p>
      <div className="ad-banner" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default RegisterPage;
