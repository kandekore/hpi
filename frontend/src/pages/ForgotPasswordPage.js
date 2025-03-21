import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET } from '../graphql/mutations';
import ReCAPTCHA from 'react-google-recaptcha';

// Enhanced email validator
function isValidEmail(email) {
  // Must have "something@something.something"
  // and at least 2 letters after the final dot, e.g. .com, .io
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const [requestPasswordReset, { loading, error }] = useMutation(REQUEST_PASSWORD_RESET);

  // For resetting the reCAPTCHA widget
  const captchaRef = useRef(null);

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setCaptchaToken(null);
  };

  // Called by the reCAPTCHA
  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');  // Clear any previous errors

    // Local validation: must match our stronger email pattern
    if (!isValidEmail(email)) {
      setErrorMsg(`"${email}" is not a valid email address.`);
      resetCaptcha();
      return;
    }

    try {
      const { data } = await requestPasswordReset({ variables: { email } });
      
      // If your server returns "false" for "No user found," handle it here:
      if (!data.requestPasswordReset) {
        setErrorMsg('No user found with that email.');
        resetCaptcha();
        return;
      }

      // If it returns true => success
      if (data.requestPasswordReset) {
        setMessage("If that email is in our system, you'll receive a reset link shortly.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message); // e.g. "No user found with that email."
      resetCaptcha();
    }
  };

  return (
    <div className="container my-4" style={{ maxWidth: '500px' }}>
      <div className="card p-4 shadow-sm">
        <h2 className="card-title mb-4">Forgot Password</h2>

        {/* Local or server error messages */}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {error && <div className="alert alert-danger">{error.message}</div>}

        {/* If we have a success message, show it. Otherwise, show the form */}
        {message ? (
          <div className="alert alert-success">{message}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label">
                Email Address
              </label>
              <input
                id="emailInput"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3 d-flex justify-content-center">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
                onChange={onCaptchaChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading || !captchaToken}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
