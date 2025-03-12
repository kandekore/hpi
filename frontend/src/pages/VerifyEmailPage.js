// src/pages/VerifyEmailPage.js

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL } from '../graphql/mutations'; // or wherever your GQL is

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifyEmail, { data, loading, error }] = useMutation(VERIFY_EMAIL);

  useEffect(() => {
    if (token) {
      verifyEmail({ variables: { token } });
    }
  }, [token, verifyEmail]);

  if (loading) return <p>Verifying...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (data?.verifyEmail) {
    return <p>Email verified! You can now login.</p>;
  }
  return <p>Missing or invalid token.</p>;
}

export default VerifyEmailPage;
