// backend/src/webhook.js

import express from 'express';
import Stripe from 'stripe';
import User from './models/User.js';        // Adjust path if needed
import Transaction from './models/Transaction.js'; // Adjust path if needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, creditType, quantity } = session.metadata;

    // Update the user’s credits in the database
    const user = await User.findById(userId);
    if (user) {
      // For example, if creditType is 'MOT', 'VDI', 'HPI', etc.
      if (creditType === 'MOT') {
        user.motCredits += parseInt(quantity, 10);
      } else if (creditType === 'VALUATION') {
        user.valuationCredits += parseInt(quantity, 10);
      } else if (creditType === 'FULL_HISTORY') {
        user.hpiCredits += parseInt(quantity, 10);
      }

      // Create a transaction record
      await Transaction.create({
        userId: user._id,
        transactionId: session.payment_intent,
        creditsPurchased: parseInt(quantity, 10),
        creditType,
        amountPaid: session.amount_total, // in cents
      });

      await user.save();
      console.log(`User ${userId} credited with ${quantity} ${creditType} credits.`);
    } else {
      console.error(`User ${userId} not found, unable to allocate credits.`);
    }
  }

  res.json({ received: true });
});

export default router;
