import userResolvers from './userResolvers.js';
import searchResolvers from './searchResolvers.js';
import paymentResolvers from './paymentResolvers.js';

export default {
  Query: {
    ...userResolvers.Query,
    ...searchResolvers.Query,
    ...paymentResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...searchResolvers.Mutation,
    
  },
};
