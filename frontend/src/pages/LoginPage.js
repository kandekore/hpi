import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';


function LoginPage() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMutation, { loading, error }] = useMutation(LOGIN);
  const navigate = useNavigate();

  const captchaRef = useRef(null);

    // When the user successfully completes the captcha:
    const onCaptchaChange = (token) => {
      setCaptchaToken(token);
    };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({ variables: { email, password, captchaToken } });
      if (data.login) {
        // Store token & redirect
        localStorage.setItem('authToken', data.login);
        const pendingReg = sessionStorage.getItem('pendingReg');
        if (pendingReg) {
          sessionStorage.removeItem('pendingReg');
          navigate(`/?autoCheck=${pendingReg}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      captchaRef.current?.reset();
  setCaptchaToken(null);
      
      // The error from useMutation is handled below in {error && ...}
    }
  };

  return (
    <><style>{`.captcha {
    text-align: center;
    align-items: center;
    padding: 10px;
}`}</style>
    <div className="container my-4">
      <div className="card p-4 shadow-sm">
        <h1 className="card-title mb-4">Login</h1>

        {/* Main error (invalid credentials or any server error) */}
        {error && (
          <div className="alert alert-danger">
            {error.message}
          </div>
        )}

        {/* 
          If the error is specifically "Please verify your email before logging in.",
          show a link to resend verification. 
        */}
        {error?.message === 'Please verify your email before logging in.' && (
          <div className="alert alert-info mt-2">
            Didn’t receive the verification email?{' '}
            <Link to="/resend-verification">Click here</Link> to resend it.
          </div>
        )}

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
          <div className="mb-3 d-flex justify-content-center">
          <ReCAPTCHA
          ref={captchaRef}
          sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
          onChange={onCaptchaChange}
        /></div>
        <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading || !captchaToken} // <-- Key line
      >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="mt-3 text-center">
  <Link to="/forgot-password">Forgot your password?</Link>
</p>

        </form>
      </div>

      <p className="mt-3 text-center">
        Don't have an account? <a href="/register">Register here</a>.
      </p>

     
    </div></>
  );
}

export default LoginPage;
