// src/pages/PleaseLoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function PleaseLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="container my-4">
      <div className="card p-4 text-center">
        <h1 className="mb-3">Please Login or Register</h1>
        <p>You need to login or register to use your free MOT checks.</p>
        <div className="d-flex justify-content-center my-3">
          <button className="btn btn-primary me-2" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-secondary" onClick={() => navigate('/register')}>Register</button>
        </div>
        <div className="card mt-3 border">
          <div className="card-body">[Ad Banner]</div>
        </div>
      </div>
    </div>
  );
}

export default PleaseLoginPage;
