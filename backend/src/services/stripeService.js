const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_CONFIG = {
  MOT: { 10: 150, 20: 200, 50: 400, 100: 750 },
  VDI: { 1: 699, 10: 6000, 20: 10000, 50: 20000, 100: 35000 }
};

module.exports = {
  async createCheckoutSession(creditType, quantity, successUrl, cancelUrl, metadata) {
    const priceInCents = PRICE_CONFIG[creditType][quantity];
    if (!priceInCents) throw new Error('Invalid credit package selected.');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${creditType} Credits - ${quantity}`
          },
          unit_amount: priceInCents
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
