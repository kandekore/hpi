import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../images/vdilogo600x119.jpg'; // Adjust path if necessary
import ScrollToTopButton from './ScrollToTopButton';

function Layout({ children }) {
  const location = useLocation();

  // Check current path for full-width
  const isHpiRoute = location.pathname === '/hpi';
  const isHomeRoute = location.pathname === '/';
  const isMotRoute = location.pathname === '/mot';
  const isValuationRoute = location.pathname === '/valuation';
  const isDashboardRoute = location.pathname === '/credits';
  const isFullWidth = isHomeRoute || isHpiRoute || isMotRoute || isValuationRoute || isDashboardRoute;

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div className="d-flex flex-column min-vh-100">
      <header>
        {/* We keep navbar-dark for white text/icon on toggler, 
            but remove bg-dark. Inline style sets background to #003366 */}
        <nav 
          className="navbar navbar-expand-lg navbar-dark" 
          style={{
            backgroundColor: '#1560bd',
            minHeight: '150px',
            borderBottom: '5px solid #ffffff'
          }}
        >
          <div className="container">
            <Link className="navbar-brand d-flex align-items-center" to="/">
              <img 
                src={logo} 
                alt="Logo" 
                height="110" 
                className="d-inline-block me-2"
              />
            </Link>

            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav" 
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav" style={{ fontSize: '1.1rem' }}>
                {/* Always visible: Home & Services */}
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/">Home</Link>
                </li>
              
                {/* Only show these links if logged in */}
                {isLoggedIn && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/valuation">Valuation</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/mot">MOT Check</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/hpi">Full HPI Check</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/credits">Dashboard</Link>
                    </li>
                  </>
                )}

                {/* Always visible: Services */}
                 <li className="nav-item">
                <Link className="nav-link text-white" to="/sample">Sample Reports</Link>
              </li>

                {/* Auth Logic: Show Logout if logged in, otherwise show Login/Register */}
                {isLoggedIn ? (
                  <li className="nav-item">
                    <button 
                      className="btn btn-link nav-link text-white" 
                      onClick={() => { 
                        localStorage.removeItem('authToken'); 
                        window.location.href = '/';
                      }}
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Use a full-width layout for certain routes, container for others */}
      <main className={isFullWidth ? "flex-grow-1 p-0" : "flex-grow-1 container py-4"}>
        {children}
        <ScrollToTopButton />
      </main>
    
      <footer 
        className="footer text-center py-3 mt-auto"
        style={{
          backgroundColor: '#003366',
          color: '#fff'
        }}
      >
        {/* Inline style to force footer links to #FFDE46 */}
        <style>{`
          .footer a {
            color: #FFDE46 !important;
          }
        `}</style>

        <div className="container">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} VDI Information - <a href='https://hostdada.co.uk'>Website Hosting</a> & Maintenance By Host Dada
          </p>
          {/* Example link inside the footer (optional) */}
          {/* <p>
            <a href="/some-footer-link">Footer Link</a>
          </p> */}
        </div>
      </footer>
    </div>
  );
}

export default Layout;
