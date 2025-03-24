// src/resolvers/index.js

import userResolvers from './userResolvers.js';
import searchResolvers from './searchResolvers.js';
import paymentResolvers from './paymentResolvers.js';
import supportResolvers from './supportResolvers.js';
import adminResolvers from './adminResolvers.js';

export default {
  Query: {
    ...userResolvers.Query,
    ...searchResolvers.Query,
    ...paymentResolvers.Query,
    ...supportResolvers.Query,
    ...adminResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...searchResolvers.Mutation,
    ...supportResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
};
