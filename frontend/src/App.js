import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VdiCheckPage from './pages/VdiCheckPage';
import CreditManagementPage from './pages/CreditManagementPage';
import ServicesPage from './pages/ServicesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Simple function to check auth status
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Protected route component
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Add a navigation bar or header here if desired */}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/vdi" element={<VdiCheckPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Route: only logged-in users can access the credit management page */}
          <Route 
            path="/credits" 
            element={
              <PrivateRoute>
                <CreditManagementPage />
              </PrivateRoute>
            }
          />

          {/* Catch-all Route for undefined paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer or ads could go here */}
      </div>
    </Router>
  );
}

export default App;
