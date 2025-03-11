import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [userIntention, setUserIntention] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const [registerMutation, { loading, error }] = useMutation(REGISTER);
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Basic client-side validation
    if (!email) {
      setErrorMsg('Please enter an email.');
      return;
    }
    if (!password || !confirmPassword) {
      setErrorMsg('Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('You must accept the terms and conditions.');
      return;
    }
    // If username is empty, fallback to email
    const finalUsername = username.trim() || email.trim();

    // Clear local error
    setErrorMsg('');

    try {
      // Make sure your REGISTER mutation & server accept these new fields
      const { data } = await registerMutation({
        variables: {
          email,
          password,
          username,
          phone,
          userIntention,
          termsAccepted, // the boolean from your checkbox
        },
      });
      

      if (data.register) {
        // Typically you want them to verify email before login,
        // but if your backend still returns an auth token here,
        // we store it:
        localStorage.setItem('authToken', data.register);
        
        // If there's some pending reg logic:
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
      // The "error" from useMutation also might capture this
      // but to be safe:
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="container my-4">
      <div className="card p-4 shadow-sm">
        <h1 className="card-title mb-4">Register</h1>

        {/* GraphQL or internal error */}
        {(errorMsg || error) && (
          <div className="alert alert-danger">
            {errorMsg || error.message}
          </div>
        )}

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input 
            type="email" 
            placeholder="Email" 
            className="form-control"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        {/* Username */}
        <div className="mb-3">
          <label className="form-label">Username (optional)</label>
          <input 
            type="text" 
            placeholder="Username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <small className="text-muted">
            Leave blank to use your email as your username.
          </small>
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="form-label">Phone (optional)</label>
          <input 
            type="text"
            placeholder="Phone Number"
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* User intention */}
        <div className="mb-3">
          <label className="form-label">What brings you here?</label>
          <select
            className="form-select"
            value={userIntention}
            onChange={(e) => setUserIntention(e.target.value)}
          >
            <option value="">-- Please choose --</option>
            <option value="buying">Buying</option>
            <option value="selling">Selling</option>
            <option value="nosey">Just being nosey</option>
          </select>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password *</label>
          <input 
            type="password" 
            placeholder="Password" 
            className="form-control" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label className="form-label">Confirm Password *</label>
          <input 
            type="password" 
            placeholder="Confirm Password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="termsCheck"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="termsCheck">
            I agree to the <a href="/terms" target="_blank" rel="noreferrer">terms and conditions</a>.
          </label>
        </div>

        {/* Submit button */}
        <button 
          onClick={handleRegister}
          className="btn btn-primary w-100" 
          disabled={loading}
        >
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
