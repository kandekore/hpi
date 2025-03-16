// backend/src/models/SearchRecord.js
import mongoose from 'mongoose';


const searchRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleReg: { type: String, required: true },
  searchType: { 
    type: String, 
    enum: ['MOT', 'FULL_HISTORY', 'Valuation', 'HPI'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  responseData: { type: mongoose.Schema.Types.Mixed }
});

// Export the Mongoose model, not just the schema
export default mongoose.model('SearchRecord', searchRecordSchema);
