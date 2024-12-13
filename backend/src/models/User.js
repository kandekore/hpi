const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  freeMotChecksUsed: { type: Number, default: 0 },
  motCredits: { type: Number, default: 0 },
  vdiCredits: { type: Number, default: 0 },
  searchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SearchRecord' }]
});

module.exports = mongoose.model('User', userSchema);
