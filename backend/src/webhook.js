const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
      if (creditType === 'MOT') {
        user.motCredits += parseInt(quantity, 10);
      } else if (creditType === 'VDI') {
        user.vdiCredits += parseInt(quantity, 10);
      }

      // Create a transaction record
      await Transaction.create({
        userId: user._id,
        transactionId: session.payment_intent,
        creditsPurchased: parseInt(quantity, 10),
        creditType: creditType,
        amountPaid: session.amount_total // in cents
      });

      await user.save();
      console.log(`User ${userId} credited with ${quantity} ${creditType} credits.`);
    } else {
      console.error(`User ${userId} not found, unable to allocate credits.`);
    }
  }

  res.json({ received: true });
});

module.exports = router;
