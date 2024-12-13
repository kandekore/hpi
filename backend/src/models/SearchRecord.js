const mongoose = require('mongoose');

const searchRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleReg: { type: String, required: true },
  searchType: { type: String, enum: ['MOT', 'VDI'], required: true },
  timestamp: { type: Date, default: Date.now },
  responseData: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('SearchRecord', searchRecordSchema);
