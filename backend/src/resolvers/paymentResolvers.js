import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import stripeService from '../services/stripeService.js';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default {
    Mutation: {
      async createCreditPurchaseSession(_, { creditType, quantity }, { user }) {
        if (!user) throw new Error('Not authenticated');
        const currentUser = await User.findById(user.userId);
        if (!currentUser) throw new Error('User not found');
  
        const successUrl = `${FRONTEND_URL}/credits?status=success`;
        const cancelUrl = `${FRONTEND_URL}/credits?status=cancel`;
  
        const session = await stripeService.createCheckoutSession(
          creditType,
          quantity,
          successUrl,
          cancelUrl,
          {
            userId: currentUser._id.toString(),
            creditType,
            quantity: quantity.toString()
          }
        );
  
        return session.url;
      }
    },
    Query: {
    async getTransactions(_, __, { user }) {
      // Ensure the user is logged in
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');

      // Fetch all transactions belonging to this user
      const transactions = await Transaction.find({ userId: currentUser._id }).sort({ timestamp: -1 });
      return transactions;
    },
  }
  };
