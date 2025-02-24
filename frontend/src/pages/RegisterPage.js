// src/pages/RegisterPage.js
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
        localStorage.setItem('authToken', data.register);
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
    <div className="container my-4">
      <div className="card p-4 shadow-sm">
        <h1 className="card-title mb-4">Register</h1>
        {error && <div className="alert alert-danger">{error.message}</div>}
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
        <button onClick={handleRegister} className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
      <p className="mt-3 text-center">
        Already have an account? <a href="/login">Login here</a>.
      </p>
      <div className="card border rounded p-3 mt-4 text-center">
        [Ad Banner]
      </div>
    </div>
  );
}

export default RegisterPage;
