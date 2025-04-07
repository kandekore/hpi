import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';


function RegisterPage() {
  const [captchaToken, setCaptchaToken] = useState(null);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [userIntention, setUserIntention] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [registerMutation, { loading, error }] = useMutation(REGISTER);
  const captchaRef = useRef(null);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleRegister = async () => {
    // If we already succeeded, no need to let them re-submit:
    if (successMsg) return;

   // Basic client-side checks
   if (!email) {
    setErrorMsg('Please enter an email.');
    captchaRef.current?.reset();
    setCaptchaToken(null);
    return;
  }
  if (!password || !confirmPassword) {
    setErrorMsg('Please enter and confirm your password.');
    captchaRef.current?.reset();
    setCaptchaToken(null);
    return;
  }
  if (password !== confirmPassword) {
    setErrorMsg('Passwords do not match.');
    captchaRef.current?.reset();
    setCaptchaToken(null);
    return;
  }
  if (!termsAccepted) {
    setErrorMsg('You must accept the terms and conditions.');
    captchaRef.current?.reset();
    setCaptchaToken(null);
    return;
  }
  
    const finalUsername = username.trim() || email.trim();

    setErrorMsg('');

    try {
      const { data } = await registerMutation({
        variables: {
          email,
          password,
          username: finalUsername,
          phone,
          userIntention,
          termsAccepted,
          captchaToken, 
        },
      });

      // Our server's register resolver returns a string message
      // e.g. "Registration successful! Please check your email to verify your account."
      if (data.register) {
        // 1) We do NOT store authToken or navigate
        // 2) Instead, display success message
        setSuccessMsg(data.register);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  // If successful, we hide or disable the form
  const isFormDisabled = !!successMsg;

  return ( <><style>{`.captcha {
    text-align: center;
    align-items: center;
    padding: 10px;
}`}</style>
    <div className="container my-4">
      <div className="card p-4 shadow-sm">
        <h1 className="card-title mb-4">Register</h1>

        {/* Show either error or success message */}
        {errorMsg && (
          <div className="alert alert-danger">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <>
            <div className="alert alert-success">
              {successMsg}
            </div>
            <p>
              Didn’t receive verification email?
              <Link to="/resend-verification">Click here</Link> to resend it.
            </p>
          </>
        )}
        
        {error && (
          <div className="alert alert-danger">
            {error.message}
          </div>
        )}

        {!successMsg && (
          <>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input 
                type="email" 
                placeholder="Email" 
                className="form-control"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
              />
            </div>

            {/* User intention */}
            <div className="mb-3">
              <label className="form-label">What brings you here?</label>
              <select
                className="form-select"
                value={userIntention}
                onChange={(e) => setUserIntention(e.target.value)}
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
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
                disabled={isFormDisabled}
              />
              <label className="form-check-label" htmlFor="termsCheck">
                I agree to the <a href="/terms" target="_blank" rel="noreferrer">terms and conditions</a>.
              </label>
            </div>
                        <div className="mb-3 d-flex justify-content-center">

<ReCAPTCHA
                ref={captchaRef}
        sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
        onChange={onCaptchaChange}
      /></div>
            {/* Submit button */}
            <button 
              onClick={handleRegister}
              className="btn btn-primary w-100" 
              disabled={loading || isFormDisabled || !captchaToken}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </>
        )}
      </div>

      <p className="mt-3 text-center">
        Already have an account? <a href="/login">Login here</a>.
      </p>

      
    </div></>
  );
}

export default RegisterPage;
