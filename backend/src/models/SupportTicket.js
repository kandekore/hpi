// models/SupportTicket.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, 
    enum: ['User', 'Support', 'System'],
    default: 'User'
  },
  text: { type: String, required: true },
  postedAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },       // user’s email
  name: { type: String, required: true },        // user’s name
  department: { 
    type: String, 
    enum: ['Support', 'Billing', 'Complaint', 'Feedback'],
    default: 'Support'
  },
  subject: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Open', 'Answered', 'Customer-Reply', 'On Hold', 'In Progress', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low'
  },
  assignedAgent: { type: String, default: 'Unassigned' },
  ticketRef: { type: String, unique: true },
  messages: [messageSchema],

  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Whenever a ticket is saved, update lastUpdated:
supportTicketSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);
