import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD, LOGIN } from '../graphql/mutations'; 
import ReCAPTCHA from 'react-google-recaptcha';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // New password fields for reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // For the reset-password step
  const [resetPasswordMutation, { loading: resetLoading, error: resetError }] 
    = useMutation(RESET_PASSWORD);

  // Inline login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const [loginMutation, { loading: loginLoading, error: loginError }] 
    = useMutation(LOGIN);

  // Ref for resetting captcha
  const captchaRef = useRef(null);

  // If there's no token => can't reset
  if (!token) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger">Missing reset token.</div>
      </div>
    );
  }

  // Handle reset password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetErrorMsg('');
    // 1) Check match
    if (newPassword !== confirmPassword) {
      setResetErrorMsg('Passwords do not match.');
      // Clear any captcha that might be rendered
      captchaRef.current?.reset();
      setCaptchaToken(null);
      return;
    }
    try {
      const { data } = await resetPasswordMutation({
        variables: { token, newPassword }
      });
      if (data.resetPassword) {
        setResetMessage('Password reset successful! You can now log in below.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // reCAPTCHA callback
  const onCaptchaChange = (tokenVal) => {
    setCaptchaToken(tokenVal);
  };

  // Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: {
          email: loginEmail,
          password: loginPassword,
          captchaToken
        }
      });
      if (data.login) {
        // Save token and redirect
        localStorage.setItem('authToken', data.login);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      captchaRef.current?.reset();
  setCaptchaToken(null);
    }
  };

  // We'll show the login form only if resetMessage indicates success
  const resetSuccess = resetMessage === 'Password reset successful! You can now log in below.';

  return (
    <div className="container my-4" style={{ maxWidth: '500px' }}>
      <div className="card p-4 shadow-sm">
        <h2 className="card-title mb-4">Reset Your Password</h2>

        {/* If there's a server error from Apollo */}
        {resetError && (
          <div className="alert alert-danger">{resetError.message}</div>
        )}

        {/* If there's a local mismatch error */}
        {resetErrorMsg && (
          <div className="alert alert-danger">{resetErrorMsg}</div>
        )}

        {/* If we have a success message */}
        {resetMessage && (
          <div className="alert alert-success">{resetMessage}</div>
        )}

        {/* Show the reset form only if not fully successful */}
        {!resetSuccess && (
          <form onSubmit={handleResetSubmit}>
            {resetLoading && (
              <div className="mb-2 text-muted">Resetting...</div>
            )}

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={resetLoading}
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Inline Login Form (only appear AFTER success) */}
        {resetSuccess && (
          <>
            <hr />
            <h4>Login Now</h4>

            {/* Show Apollo error from login if any */}
            {loginError && (
              <div className="alert alert-danger">{loginError.message}</div>
            )}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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
                className="btn btn-success w-100"
                disabled={loginLoading || !captchaToken}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
