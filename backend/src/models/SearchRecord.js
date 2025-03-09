// backend/src/models/SearchRecord.js
const mongoose = require('mongoose');

const searchRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleReg: { type: String, required: true },
  searchType: { 
    type: String, 
    enum: ['MOT', 'Valuation', 'HPI'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  responseData: { type: mongoose.Schema.Types.Mixed }
});

// Export the Mongoose model, not just the schema
module.exports = mongoose.model('SearchRecord', searchRecordSchema);
