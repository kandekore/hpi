// backend/src/services/stripeService.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_CONFIG = {
  MOT: { 
    10: 150, 
    20: 200, 
    50: 400, 
    100: 750 
  },
  VDI: { 
    1: 699,    // => £6.99
    10: 6000,  // => £60.00
    20: 10000, // => £100.00
    50: 20000, // => £200.00
    100: 35000 // => £350.00
  },
  // NEW: HPI ~30% higher than VDI
  HPI: { 
    1: 909,     // => £9.09
    10: 7800,   // => £78.00
    20: 13000,  // => £130.00
    50: 26000,  // => £260.00
    100: 45500  // => £455.00
  }
};

module.exports = {
  async createCheckoutSession(creditType, quantity, successUrl, cancelUrl, metadata) {
    // 1) Look up the price in cents for the given creditType & quantity
    const priceInCents = PRICE_CONFIG[creditType]?.[quantity];
    if (!priceInCents) {
      throw new Error('Invalid credit package selected.');
    }

    // 2) Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${creditType} Credits - ${quantity}`
          },
          unit_amount: priceInCents // e.g., 909 => £9.09
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });

    return session;
  }
};
