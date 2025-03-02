const userResolvers = require('./userResolvers');
const searchResolvers = require('./searchResolvers');
const paymentResolvers = require('./paymentResolvers');

module.exports = {
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
