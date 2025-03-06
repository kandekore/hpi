import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient';  // <-- Make sure this import path is correct
import MOTPage from './pages/MOTPage';    // new MOT page
import HomePage from './pages/HomePage';
import VdiCheckPage from './pages/VdiCheckPage';
import CreditManagementPage from './pages/CreditManagementPage';
import ServicesPage from './pages/ServicesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import SearchDetailPage from './pages/SearchDetailPage';
import HpiCheckPage from './pages/HpiCheckPage';

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
            <Route path="/mot" element={<MOTPage />} />
            <Route path="/credits" element={<CreditManagementPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search/:id" element={<SearchDetailPage />} />
            <Route path="/hpi" element={<HpiCheckPage />} />
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
