// src/graphql/queries.js
import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
      id
      email
      motCredits
      vdiCredits
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

