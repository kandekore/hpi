// src/components/UserProfile.js
import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_PROFILE } from '../graphql/queries';
import { AuthContext } from '../context/AuthContext';

function UserProfile() {
  const { authToken } = useContext(AuthContext);
  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    skip: !authToken,
  });

  if (!authToken) return <p>Please log in to see your profile.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>ID: {data.getUserProfile.id}</p>
      <p>Email: {data.getUserProfile.email}</p>
      {/* More fields */}
    </div>
  );
}

export default UserProfile;
