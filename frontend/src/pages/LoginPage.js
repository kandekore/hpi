// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMutation, { loading, error }] = useMutation(LOGIN);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      if (data.login) {
        // Store the token immediately in localStorage
        localStorage.setItem('authToken', data.login);

        // Check for pending registration (pendingReg) in sessionStorage
        const pendingReg = sessionStorage.getItem('pendingReg');
        if (pendingReg) {
          sessionStorage.removeItem('pendingReg');
          // Redirect to home page with autoCheck parameter (or wherever needed)
          navigate(`/?autoCheck=${pendingReg}`);
        } else {
          // Redirect to home page
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <h1>Login</h1>
      {error && <div className="alert alert-danger">{error.message}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-3">
        Don't have an account? <a href="/register">Register here</a>.
      </p>
      <div className="ad-banner mt-4 p-3 border rounded">
        [Ad Banner]
      </div>
    </div>
  );
}

export default LoginPage;
