import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient';  // <-- Make sure this import path is correct
import MOTPage from './pages/MOTPage';    // new MOT page
import HomePage from './pages/HomePage';
import ValuationPage from './pages/ValuationPage';
import CreditManagementPage from './pages/CreditManagementPage';
import ServicesPage from './pages/ServicesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import SearchDetailPage from './pages/SearchDetailPage';
import HpiCheckPage from './pages/HpiCheckPage';
import ExampleReportsPage from './pages/ExampleReportsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import { Helmet } from 'react-helmet';
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    
    <ApolloProvider client={client}>
    <style>
    {`
      /* Force no margin/padding on html/body so the hero can occupy full width & top */
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
        height: 100%;
      }
      /* If you’re using any default Bootstrap .container or .App classes,
         make sure they don't add margin:
         .App, .container {
           margin: 0 !important;
           padding: 0 !important;
         }
      */
    `}
  </style>
 
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/valuation" element={<ValuationPage />} />
            <Route path="/mot" element={<MOTPage />} />
            <Route path="/dashboard" element={<CreditManagementPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search/:id" element={<SearchDetailPage />} />
            <Route path="/hpi" element={<HpiCheckPage />} />
            <Route path="/sample" element={<ExampleReportsPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/resend-verification" element={<ResendVerificationPage />} />

            {/* Protected Route */}
            <Route 
              path="/dashboard"
              element={
                <PrivateRoute>
                  <CreditManagementPage />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
      
    </ApolloProvider>
    
  );
}

export default App;
