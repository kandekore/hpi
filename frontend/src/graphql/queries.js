import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getUserProfile {
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

export const VDI_CHECK = gql`
  query VdiCheck($reg: String!) {
    vdiCheck(reg: $reg)
  }
`;

// Add the valuation query:
export const VALUATION_CHECK = gql`
  query ValuationCheck($reg: String!) {
    valuation(reg: $reg)
  }
`;