import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMutation, { loading, error }] = useMutation(LOGIN);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      if (data.login) {
        localStorage.setItem('authToken', data.login);

        // Now handle pendingReg logic INSIDE the success block
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
      <h1>Login</h1>
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
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>Don't have an account? <a href="/register">Register here</a>.</p>
      <div className="ad-banner" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        [Ad Banner]
      </div>
    </div>
  );
}

export default LoginPage;
