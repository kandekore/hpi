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

  scalar JSON

  type Query {
    getUserProfile: User
    motCheck(reg: String!): JSON
    vdiCheck(reg: String!): JSON
    getSearchHistory: [SearchRecord]
  }

  type Mutation {
    register(email: String!, password: String!): String
    login(email: String!, password: String!): String

    createCreditPurchaseSession(creditType: String!, quantity: Int!): String
    finalizeCreditPurchase(creditType: String!, quantity: Int!): User
  }
`;

module.exports = typeDefs;
