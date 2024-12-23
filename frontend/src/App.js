import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VdiCheckPage from './pages/VdiCheckPage';
import CreditManagementPage from './pages/CreditManagementPage';
import ServicesPage from './pages/ServicesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// const client = new ApolloClient({
 
//   uri: process.env.REACT_APP_GRAPHQL_URI || "/graphql",

// cache: new InMemoryCache(),
// })
const client = new ApolloClient({
  uri: "/graphql", // Relative path since frontend and backend are on the same domain
  cache: new InMemoryCache(),
});

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

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
    </ApolloProvider>

  );
}

export default App;
