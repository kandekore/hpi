// backend/src/services/stripeService.js
import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: '2024-06-20'});
// console.log('STRIPE_API_KEY:', process.env.STRIPE_SECRET_KEY);


const PRICE_CONFIG = {
  MOT: {
    10: 150, // => £1.50
    50: 400, // => £4.00
  },
  FULL_HISTORY: {
    1: 749,   // => £9.99
    3: 2249,  // => £22.49
    10: 5999, // => £59.99
  },
  VALUATION: {
    1: 499,   // => £4.99
    3: 1249,  // => £12.49
    10: 2999, // => £29.99
  },
  // etc
};


export default {
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
