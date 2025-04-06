import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL, LOGIN } from '../graphql/mutations';
import ReCAPTCHA from 'react-google-recaptcha';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // For verifying the email
  const [verifyEmail, { data: verifyData, loading: verifyLoading, error: verifyError }] 
    = useMutation(VERIFY_EMAIL);

  // For the inline login form (after successful verification)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const [loginMutation, { loading: loginLoading, error: loginError }] 
    = useMutation(LOGIN);

    useEffect(() => {
      if (token) {
        verifyEmail({ variables: { token } })
          .then(({ data }) => {
            if (data?.verifyEmail) {
              // This is your JWT
              localStorage.setItem('authToken', data.verifyEmail);
              // Optionally redirect
              window.location.href = '/dashboard';
            }
          })
          .catch(err => {
            console.error('Email verify error:', err);
          });
      }
    }, [token, verifyEmail]);
    

  const handleLogin = async (e) => {
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
        // Save token and redirect, or do something else
        localStorage.setItem('authToken', data.login);
        window.location.href = '/dashboard'; // or navigate('/profile'), etc.
      }
    } catch (err) {
      console.error(err);
      captchaRef.current?.reset();
  setCaptchaToken(null);
      
    }
  };
  const captchaRef = useRef(null);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <div className="container my-4" style={{ maxWidth: '500px' }}>
      <div className="card p-4 shadow-sm">
        <h2 className="card-title mb-4">Verify Email</h2>

        {/* Verification loading/error/success states */}
        {verifyLoading && (
          <div className="alert alert-info">Verifying email...</div>
        )}
        {verifyError && (
          <div className="alert alert-danger">
            {verifyError.message}
          </div>
        )}
        {!token && !verifyLoading && !verifyError && (
          <div className="alert alert-warning">
            Missing or invalid token.
          </div>
        )}
        {verifyData?.verifyEmail && (
          <div className="alert alert-success">
            Your email has been verified successfully! You can now log in.
          </div>
        )}

        {/* If email is verified, show a login form */}
        {verifyData?.verifyEmail && (
          <>
            <hr />
            <h4>Login Now</h4>
            {loginError && (
              <div className="alert alert-danger">
                {loginError.message}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
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
                className="btn btn-primary w-100"
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

export default VerifyEmailPage;
