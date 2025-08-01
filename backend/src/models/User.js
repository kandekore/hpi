// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String },           // optional
  passwordHash: { type: String, required: true },
  phone: { type: String },             // optional
  userIntention: { type: String },     // 'buying' | 'selling' | 'nosey' or similar
  termsAccepted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, required: false },
  passwordResetToken: String,
  passwordResetExpires: Date,   
  freeMotChecksUsed: { type: Number, default: 0 },
  motCredits: { type: Number, default: 0 },
  valuationCredits: { type: Number, default: 0 },
  hpiCredits: { type: Number, default: 0 },
  searchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SearchRecord' }],
  timestamp: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
