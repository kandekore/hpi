const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: String,
  creditsPurchased: Number,
  creditType: { type: String, enum: ['MOT', 'VDI'] },
  amountPaid: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
