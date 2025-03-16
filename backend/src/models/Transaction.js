import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: String,
  creditsPurchased: Number,
  creditType: { type: String, enum: ['MOT', 'FULL_HISTORY', 'VALUATION'] },
  amountPaid: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
