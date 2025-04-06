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
      userIntention
      termsAccepted
      isVerified
      username
      phone
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

export const GET_MY_TICKETS = gql`
  query GetMyTickets {
    getMyTickets {
      id
      ticketRef
      subject
      status
      department
      lastUpdated
      createdAt
    }
  }
`;
export const GET_TICKET_BY_ID = gql`
  query GetTicketById($ticketId: ID!) {
  getTicketById(ticketId: $ticketId) {
    id
    ticketRef
    subject
    status
    department
    priority
    assignedAgent
    name
    email
    createdAt
    messages {
      sender
      text
      postedAt
    }
  }
}
`;
export const PUBLIC_VEHICLE_PREVIEW = gql`
  query PublicVehiclePreview($reg: String!, $captchaToken: String!) {
    publicVehiclePreview(reg: $reg, captchaToken: $captchaToken) {
      found
      make
      colour
      year
      imageUrl
      message
    }
  }
`;