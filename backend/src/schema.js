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

  type Query {
    getMyTickets: [SupportTicket!]!
getTicketById(ticketId: ID!): SupportTicket
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

   createSupportTicket(input: CreateTicketInput!): SupportTicket
  replyToSupportTicket(input: ReplyTicketInput!): SupportTicket
  closeSupportTicket(ticketId: ID!): SupportTicket
requestPasswordReset(email: String!): Boolean
  resetPassword(token: String!, newPassword: String!): Boolean

  verifyEmail(token: String!): Boolean
  resendVerificationEmail(email: String!): Boolean
  changePassword(currentPassword: String!, newPassword: String!): Boolean

  createCreditPurchaseSession(creditType: String!, quantity: Int!): String
  finalizeCreditPurchase(creditType: String!, quantity: Int!): User
}
`;

export default typeDefs;
