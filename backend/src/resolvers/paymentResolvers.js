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

// export default {
//   Mutation: {
//     async createCreditPurchaseSession(_, { creditType, quantity }, { user }) {
//       if (!user) throw new Error('Not authenticated');

//       // In a real scenario, these URLs would be your frontend routes
//       const successUrl = 'http://localhost:3000/credits?status=success';
//       const cancelUrl = 'http://localhost:3000/credits?status=cancel';
//       const session = await stripeService.createCheckoutSession(creditType, quantity, successUrl, cancelUrl);
//       return session.url; // Return the URL to redirect the user to Stripe Checkout
//     },
//     // You would implement a webhook handler to verify payment and then:
//     async finalizeCreditPurchase(_, { creditType, quantity }, { user }) {
//       if (!user) throw new Error('Not authenticated');
//       const currentUser = await User.findById(user.userId);

//       if (creditType === 'MOT') {
//         currentUser.motCredits += quantity;
//       } else if (creditType === 'VDI') {
//         currentUser.vdiCredits += quantity;
//       }

//       const transaction = await Transaction.create({
//         userId: currentUser._id,
//         creditsPurchased: quantity,
//         creditType: creditType,
//         amountPaid: 0, // Set after real payment verification
//       });

//       await currentUser.save();
//       return currentUser;
//     }
//   }
// };
