import { gql } from '@apollo/client';

export const MOT_CHECK = gql`
  query motCheck($reg: String!) {
    motCheck(reg: $reg)
  }
`;

export const VDI_CHECK = gql`
  query vdiCheck($reg: String!) {
    vdiCheck(reg: $reg)
  }
`;

// ... Other queries and mutations
