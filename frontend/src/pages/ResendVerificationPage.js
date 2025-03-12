import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { RESEND_VERIFICATION } from '../graphql/mutations';

function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [resendVerificationEmail, { data, loading, error }] = useMutation(RESEND_VERIFICATION);

  const handleResend = async () => {
    try {
      await resendVerificationEmail({ variables: { email } });
      alert('Verification email resent! Check your inbox.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <h3>Resend Verification Email</h3>
      <div className="mb-3">
        <input
          type="email"
          placeholder="Email"
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <button 
        className="btn btn-primary"
        disabled={loading}
        onClick={handleResend}
      >
        {loading ? 'Sending...' : 'Resend'}
      </button>

      {error && <div className="alert alert-danger mt-3">{error.message}</div>}
      {data && <div className="alert alert-success mt-3">Email resent! Check your inbox.</div>}
    </div>
  );
}

export default ResendVerificationPage;
