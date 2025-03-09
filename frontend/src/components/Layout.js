// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              {/* Replace with your actual logo image */}
              <img 
                src="/logo-placeholder.png" 
                alt="Logo" 
                width="30" 
                height="30" 
                className="d-inline-block align-top me-2" 
              />
              Your Company
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav" 
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/valuation">Valuation</Link>
                </li>
                <li className="nav-item">
                <Link className="nav-link" to="/mot">MOT Check</Link>
              </li>
              <li className="nav-item">
              <a className="nav-link" href="/hpi">Full HPI Check</a>
            </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/credits">Credits</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/services">Services</Link>
                </li>
                {localStorage.getItem('authToken') ? (
                  <li className="nav-item">
                    <button 
                      className="btn btn-link nav-link" 
                      onClick={() => { 
                        localStorage.removeItem('authToken'); 
                        window.location.href = '/';
                      }}>
                      Logout
                    </button>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="flex-grow-1 container py-4">
        {children}
      </main>
      
      <footer className="bg-light text-center text-dark py-3 mt-auto">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} Your Company Name</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
