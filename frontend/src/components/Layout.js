import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#333', color: '#fff', padding: '10px' }}>
        <nav>
          <Link to="/" style={{ color: '#fff', marginRight: '10px' }}>Home</Link>
          <Link to="/vdi" style={{ color: '#fff', marginRight: '10px' }}>VDI Check</Link>
          <Link to="/credits" style={{ color: '#fff', marginRight: '10px' }}>Credits</Link>
          <Link to="/services" style={{ color: '#fff', marginRight: '10px' }}>Services</Link>
          {localStorage.getItem('authToken') ? (
            <>
              <button style={{ color: '#fff' }} onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/'; }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', marginRight: '10px' }}>Login</Link>
              <Link to="/register" style={{ color: '#fff' }}>Register</Link>
            </>
          )}
        </nav>
      </header>
      
      <main style={{ flex: '1', padding: '20px' }}>
        {children}
      </main>

      <footer style={{ background: '#f5f5f5', color: '#333', padding: '10px', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} Your Company Name</p>
      </footer>
    </div>
  );
}

export default Layout;
