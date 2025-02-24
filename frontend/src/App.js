import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient';  // <-- Make sure this import path is correct

import HomePage from './pages/HomePage';
import VdiCheckPage from './pages/VdiCheckPage';
import CreditManagementPage from './pages/CreditManagementPage';
import ServicesPage from './pages/ServicesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';

function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/vdi" element={<VdiCheckPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Route */}
            <Route 
              path="/credits"
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
