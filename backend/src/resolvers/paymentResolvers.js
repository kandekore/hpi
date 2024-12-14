const User = require('../models/User');
const Transaction = require('../models/Transaction');
const stripeService = require('../services/stripeService');

module.exports = {
    Mutation: {
      async createCreditPurchaseSession(_, { creditType, quantity }, { user }) {
        if (!user) throw new Error('Not authenticated');
        const currentUser = await User.findById(user.userId);
        if (!currentUser) throw new Error('User not found');
  
        const successUrl = 'http://localhost:3000/credits?status=success';
        const cancelUrl = 'http://localhost:3000/credits?status=cancel';
  
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
    }
  };

// module.exports = {
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
