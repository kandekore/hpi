// backend/src/schema.js
import { gql } from 'apollo-server-express';


const typeDefs = gql`
  scalar JSON

  type User {
    id: ID!
    email: String!
    username: String
    phone: String
    userIntention: String
    isVerified: Boolean
    termsAccepted: Boolean
    motCredits: Int
    valuationCredits: Int
    hpiCredits: Int
    freeMotChecksUsed: Int
    searchHistory: [SearchRecord]
    timestamp: String!
  }
  type SearchRecord {
    id: ID!
    vehicleReg: String!
    searchType: String!
    timestamp: String!
    responseData: JSON
  }

  type Transaction {
    id: ID!
    userId: ID!
    transactionId: String
    creditsPurchased: Int
    creditType: String
    amountPaid: Float
    timestamp: String
  }
    type TicketMessage {
  sender: String!
  text: String!
  postedAt: String!
}

type SupportTicket {
  id: ID!
  userId: ID!
  email: String!
  name: String!
  department: String!
  subject: String!
  status: String!
  priority: String!
  assignedAgent: String!
  ticketRef: String!
  messages: [TicketMessage!]!
  createdAt: String!
  lastUpdated: String!
}
 type AdminCustomer {
  id: ID!
  email: String
  username: String
  createdAt: String
  totalSpent: Float
  phone: String
  userIntention: String
  isVerified: Boolean
  termsAccepted: Boolean
  motCredits: Int
  valuationCredits: Int
  hpiCredits: Int
  freeMotChecksUsed: Int
  searchHistory: [SearchRecord]
  timestamp: String!
}

type AdminGrantCreditsResponse {
  success: Boolean!
  message: String
}

type AdminSearchRecord {
  id: ID!
  userId: ID!
  userEmail: String
  vehicleReg: String
  searchType: String
  timestamp: String
 responseData: JSON
}

type AdminTransaction {
  id: ID!
  userId: ID!
  userEmail: String
  transactionId: String
  creditsPurchased: Int
  creditType: String
  amountPaid: Int
  timestamp: String
}

type AdminSupportTicket {
  id: ID!
  userId: ID!
  email: String!
  name: String!
  subject: String!
  status: String!
  department: String!
  priority: String!
  assignedAgent: String!
  ticketRef: String!
  messages: [TicketMessage!]!
  createdAt: String!
  lastUpdated: String!
}
input CreateTicketInput {
  name: String!
  email: String!
  department: String
  subject: String!
  priority: String
  message: String!
}

input ReplyTicketInput {
  ticketId: ID!
  message: String!
}

type VehiclePreviewResponse {
  found: Boolean!
  make: String
  colour: String
  year: Int
  imageUrl: String
  message: String
}

extend type Query {
  publicVehiclePreview(reg: String!, captchaToken: String!): VehiclePreviewResponse!
}

  type Query {
  adminGetAllCustomers(email: String, username: String): [AdminCustomer!]!
  adminGetCustomerDetails(userId: ID!): User

  adminGetAllSearches(email: String, searchType: String): [AdminSearchRecord!]!
  adminGetAllTransactions(email: String, creditType: String): [AdminTransaction!]!
  adminGetAllTickets(status: String, email: String): [AdminSupportTicket!]!

 
getTicketById(ticketId: ID!): SupportTicket
  grantFreeCredits(userId: ID!, quantity: Int!, creditType: String!): Transaction
    getMyTickets: [SupportTicket!]!
adminGetTicketById(id: ID!): SupportTicket
    getSearchById(id: ID!): SearchRecord
    getSampleSearchById(id: ID!): SearchRecord
    motCheck(reg: String!): JSON
    getTransactions: [Transaction]
    getUserProfile: User
    getSearchHistory: [SearchRecord]
    vdiCheck(reg: String!): JSON
    valuation(reg: String!): JSON
    motCheckPaid(reg: String!): JSON
    hpiCheck(reg: String!): JSON
  }

type Mutation {
  payMOTCredit: User

  register(
    email: String!
    password: String!
    username: String
    phone: String
    userIntention: String
    termsAccepted: Boolean!
    captchaToken: String
  ): String

  login(
    email: String!
    password: String!
    captchaToken: String!
  ): String

  adminLogin(email: String!, password: String!): String
  adminGrantFreeCredits(userId: ID!, creditType: String!, quantity: Int!): AdminGrantCreditsResponse
  adminReplyToTicket(ticketId: ID!, message: String!): AdminSupportTicket
  adminCloseTicket(ticketId: ID!): AdminSupportTicket

   createSupportTicket(input: CreateTicketInput!): SupportTicket
  replyToSupportTicket(input: ReplyTicketInput!): SupportTicket
  closeSupportTicket(ticketId: ID!): SupportTicket
requestPasswordReset(email: String!): Boolean
  resetPassword(token: String!, newPassword: String!): Boolean

  verifyEmail(token: String!): String
  resendVerificationEmail(email: String!): Boolean
  changePassword(currentPassword: String!, newPassword: String!): Boolean

  createCreditPurchaseSession(creditType: String!, quantity: Int!): String
  finalizeCreditPurchase(creditType: String!, quantity: Int!): User
}
`;

export default typeDefs;
