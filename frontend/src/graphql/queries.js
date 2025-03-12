// src/graphql/queries.js
import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
      id
      email
      motCredits
      valuationCredits
      hpiCredits
      freeMotChecksUsed
    }
  }
`;
export const MOT_CHECK = gql`
  query MotCheck($reg: String!) {
    motCheck(reg: $reg)
  }
`;
export const MOT_CHECK_PAID = gql`
  query MotCheckPaid($reg: String!) {
    motCheckPaid(reg: $reg)
  }
`;

// Also your VDI_CHECK, VALUATION_CHECK, etc...


export const VDI_CHECK = gql`
  query VdiCheck($reg: String!) {
    vdiCheck(reg: $reg)
  }
`;

export const VALUATION_CHECK = gql`
  query ValuationCheck($reg: String!) {
    valuation(reg: $reg)
  }
`;

// Existing
export const GET_SEARCH_HISTORY = gql`
  query GetSearchHistory {
    getSearchHistory {
      id
      vehicleReg
      searchType
      timestamp
      responseData
    }
  }
`;

// New query if you have a backend resolver for transactions
export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    getTransactions {
      id
      transactionId
      creditsPurchased
      creditType
      amountPaid
      timestamp
    }
  }
`;

export const GET_SEARCH_BY_ID = gql`
  query GetSearchById($id: ID!) {
    getSearchById(id: $id) {
      id
      vehicleReg
      searchType
      timestamp
      responseData
    }
  }
`;

export const GET_SAMPLE_SEARCH_BY_ID = gql`
  query GetSampleSearchById($id: ID!) {
    getSampleSearchById(id: $id) {
      id
      vehicleReg
      searchType
      timestamp
      responseData
    }
  }
`;
export const HPI_CHECK = gql`
  query HpiCheck($reg: String!) {
    hpiCheck(reg: $reg)
  }
`;

