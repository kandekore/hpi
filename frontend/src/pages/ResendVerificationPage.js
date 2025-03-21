import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { RESEND_VERIFICATION } from '../graphql/mutations';
import ReCAPTCHA from 'react-google-recaptcha';

function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [resendVerificationEmail, { data, loading, error }] = useMutation(RESEND_VERIFICATION);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    try {
      await resendVerificationEmail({ variables: { email } });
      // The “data” from the mutation is used to show the success alert below
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4" style={{ maxWidth: '500px' }}>
      <div className="card p-4 shadow-sm">
        <h3 className="card-title mb-3">Resend Verification Email</h3>

        {error && (
          <div className="alert alert-danger">
            {error.message}
          </div>
        )}

        {data && (
          <div className="alert alert-success">
          If that email is in our system, you'll receive a validation link shortly.
          </div>
        )}

        <form onSubmit={handleResend}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Email Address
            </label>
            <input
              id="emailInput"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 d-flex justify-content-center">
            <ReCAPTCHA
            
              sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
              onChange={onCaptchaChange}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !captchaToken}
          >
            {loading ? 'Sending...' : 'Resend'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResendVerificationPage;
