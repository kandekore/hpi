// backend/src/schema.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    motCredits: Int
    vdiCredits: Int
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

  scalar JSON

  type Query {
    getSearchById(id: ID!): SearchRecord
    motCheck(reg: String!): JSON
    getTransactions: [Transaction]
    getUserProfile: User
    getSearchHistory: [SearchRecord]
    vdiCheck(reg: String!): JSON
    valuation(reg: String!): JSON
    motCheckPaid(reg: String!): JSON
  }

type Mutation {
      
  payMOTCredit: User     

  register(email: String!, password: String!): String
  login(email: String!, password: String!): String
  createCreditPurchaseSession(creditType: String!, quantity: Int!): String
  finalizeCreditPurchase(creditType: String!, quantity: Int!): User
}

  
`;



module.exports = typeDefs;
