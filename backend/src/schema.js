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

  type Query {
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
  ): String

    login(email: String!, password: String!): String
  verifyEmail(token: String!): Boolean
  resendVerificationEmail(email: String!): Boolean
  changePassword(currentPassword: String!, newPassword: String!): Boolean

    createCreditPurchaseSession(creditType: String!, quantity: Int!): String
    finalizeCreditPurchase(creditType: String!, quantity: Int!): User
  }
`;

export default typeDefs;
