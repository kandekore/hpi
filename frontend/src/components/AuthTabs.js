import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN, REGISTER } from '../graphql/mutations';
import ReCAPTCHA from 'react-google-recaptcha';

export default function AuthTabs({ onAuthSuccess }) {
  // Default to "register" tab
  const [activeTab, setActiveTab] = useState('register');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptcha, setLoginCaptcha] = useState(null);
  const loginCaptchaRef = useRef(null);

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regCaptcha, setRegCaptcha] = useState(null);
  const regCaptchaRef = useRef(null);

  // Apollo
  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [registerMutation, { loading: regLoading, error: regError }] = useMutation(REGISTER);

  // ------------------- LOGIN SUBMIT -------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: {
          email: loginEmail,
          password: loginPassword,
          captchaToken: loginCaptcha,
        },
      });
      if (data?.login) {
        // success => store token
        localStorage.setItem('authToken', data.login);
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      console.error('Login error =>', err);
      // Reset reCAPTCHA
      if (loginCaptchaRef.current) {
        loginCaptchaRef.current.reset();
      }
      setLoginCaptcha(null);
    }
  };

  // ------------------- REGISTER SUBMIT -------------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      alert('Passwords do not match.');
      // Reset the captcha
      if (regCaptchaRef.current) {
        regCaptchaRef.current.reset();
      }
      setRegCaptcha(null);
      return;
    }
    try {
      const { data } = await registerMutation({
        variables: {
          email: regEmail,
          password: regPassword,
          termsAccepted: true,
          captchaToken: regCaptcha,
        },
      });
      if (data?.register) {
        // Typically => "Check your email to verify"
        alert(data.register);
      }
    } catch (err) {
      console.error('Register error =>', err);
      // Reset reCAPTCHA
      if (regCaptchaRef.current) {
        regCaptchaRef.current.reset();
      }
      setRegCaptcha(null);
    }
  };

  // ------------------- RENDER -------------------
  return (
    <>
      <style>{`.alert.alert-info.mt-3 {
        background: #fff;
        border: 5px solid #003366;
        border-radius: 25px;
        box-shadow: 3px 1px #e0e0e04a;
        color: #003366!important;
      }
      button.nav-link {
        font-size: 25px;
      }`}</style>

      <div style={{ marginTop: '1rem' }}>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
          </li>
        </ul>

        <div style={{ border: '1px solid #ddd', padding: '1rem' }}>
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              {loginError && <p style={{ color: 'red' }}>{loginError.message}</p>}
              <div className="mb-3">
                <label>Email</label>
                <input
                  className="form-control"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {/* Center the reCAPTCHA */}
              <div className="mb-3 d-flex justify-content-center">
                <ReCAPTCHA
                  ref={loginCaptchaRef}
                  sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
                  onChange={(token) => setLoginCaptcha(token)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={loginLoading || !loginCaptcha}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              {regError && <p style={{ color: 'red' }}>{regError.message}</p>}
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {/* Center the reCAPTCHA */}
              <div className="mb-3 d-flex justify-content-center">
                <ReCAPTCHA
                  ref={regCaptchaRef}
                  sitekey="6LfIofgqAAAAAA1cDXWEiZBj4VquUQyAnWodIzfH"
                  onChange={(token) => setRegCaptcha(token)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={regLoading || !regCaptcha}
              >
                {regLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
