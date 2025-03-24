import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SearchRecord from '../models/SearchRecord.js';
import SupportTicket from '../models/SupportTicket.js';

import { comparePasswords, createToken } from '../services/auth.js';
// If you have a specific "hashPassword" etc. you can import that too if needed
// import { hashPassword } from '../services/auth.js';

// Helper function if you want a one-liner check
function isAdminOrThrow(user) {
  if (!user || user.role !== 'admin') {
    throw new Error('Not authorized. Admin only.');
  }
}

// -------------- Queries --------------
/** 1) List all customers with optional filters (email, username) */
async function adminGetAllCustomers(_, { email, username }, { user }) {
  isAdminOrThrow(user);

  const query = {};
  if (email) {
    query.email = { $regex: email, $options: 'i' };
  }
  if (username) {
    query.username = { $regex: username, $options: 'i' };
  }

  // Example: if your User model has { timestamps: true }, then createdAt is set
  // We'll sort by createdAt descending
  const users = await User.find(query).sort({ createdAt: -1 });

  // Summation of totalSpent
  const results = [];
  for (const u of users) {
    const totalSpentCents = await Transaction.aggregate([
      { $match: { userId: u._id, amountPaid: { $gt: 0 } } },
      { $group: { _id: null, sum: { $sum: '$amountPaid' } } }
    ]);
    const sum = totalSpentCents.length ? totalSpentCents[0].sum : 0;
    results.push({
      ...u.toObject(),
      totalSpent: (sum / 100).toFixed(2) // optional float
    });
  }

  return results;
}

/** 2) Get a single customer's details (plus we can fetch searches, transactions, etc. if wanted) */
async function adminGetCustomerDetails(_, { userId }, { user }) {
  isAdminOrThrow(user);

  const found = await User.findById(userId);
  if (!found) throw new Error('No user found with that ID');
  // Return the user doc (front-end can do separate calls for the user's
  // transactions or searches, or you can embed them here.)
  return found;
}

/** 3) List all searches with optional email, searchType filters */
async function adminGetAllSearches(_, { email, searchType }, { user }) {
  isAdminOrThrow(user);

  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ];

  if (email) {
    pipeline.push({
      $match: {
        'user.email': { $regex: email, $options: 'i' }
      }
    });
  }
  if (searchType) {
    pipeline.push({
      $match: { searchType }
    });
  }

  pipeline.push({ $sort: { timestamp: -1 } });

  const results = await SearchRecord.aggregate(pipeline);

  return results.map(r => ({
    id: r._id,
    userId: r.userId,
    userEmail: r.user.email,
    vehicleReg: r.vehicleReg,
    searchType: r.searchType,
    timestamp: r.timestamp
    // ... add more fields if desired
  }));
}

/** 4) List transactions with optional email, creditType filters */
async function adminGetAllTransactions(_, { email, creditType }, { user }) {
  isAdminOrThrow(user);

  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ];

  if (email) {
    pipeline.push({
      $match: {
        'user.email': { $regex: email, $options: 'i' }
      }
    });
  }
  if (creditType) {
    pipeline.push({
      $match: { creditType }
    });
  }

  pipeline.push({ $sort: { timestamp: -1 } });

  const results = await Transaction.aggregate(pipeline);

  return results.map(r => ({
    id: r._id,
    userId: r.userId,
    userEmail: r.user.email,
    creditsPurchased: r.creditsPurchased,
    creditType: r.creditType,
    amountPaid: r.amountPaid,
    transactionId: r.transactionId,
    timestamp: r.timestamp
  }));
}

/** 5) List tickets with optional status/email filters */
async function adminGetAllTickets(_, { status, email }, { user }) {
  isAdminOrThrow(user);

  const query = {};
  if (status) query.status = status;
  if (email) query.email = { $regex: email, $options: 'i' };

  return SupportTicket.find(query).sort({ lastUpdated: -1 });
}

// -------------- Mutations --------------

/** A separate "adminLogin" if you want to keep it distinct from normal "login" */
async function adminLogin(_, { email, password }) {
  // find user
  const adminUser = await User.findOne({ email });
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('Not an admin or invalid credentials');
  }

  const valid = await comparePasswords(password, adminUser.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  // return JWT token
  return createToken(adminUser);
}

/** Grant free credits to a user (admin only) */
async function adminGrantFreeCredits(_, { userId, creditType, quantity }, { user }) {
  isAdminOrThrow(user);

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new Error('User not found');

  if (creditType === 'MOT') {
    targetUser.motCredits += quantity;
  } else if (creditType === 'VALUATION') {
    targetUser.valuationCredits += quantity;
  } else if (creditType === 'HPI') {
    targetUser.hpiCredits += quantity;
  } else {
    throw new Error(`Unknown creditType: ${creditType}`);
  }

  await targetUser.save();

  // create a transaction record with 0 cost
  await Transaction.create({
    userId: targetUser._id,
    transactionId: 'FREE_CREDITS',
    creditsPurchased: quantity,
    creditType,
    amountPaid: 0
  });

  return {
    success: true,
    message: `Allocated ${quantity} ${creditType} credits to ${targetUser.email}`
  };
}

/** Admin replies to an existing ticket */
async function adminReplyToTicket(_, { ticketId, message }, { user }) {
  isAdminOrThrow(user);

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  // add new message
  ticket.messages.push({
    sender: 'Support',
    text: message
    // postedAt is set automatically if your messageSchema has default: Date.now
  });

  // maybe set status:
  ticket.status = 'Answered';
  await ticket.save();

  // Optionally email user
  return ticket;
}

/** Admin closes a ticket */
async function adminCloseTicket(_, { ticketId }, { user }) {
  isAdminOrThrow(user);

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = 'Closed';
  await ticket.save();

  // Optionally email user
  return ticket;
}

// Export them in a single object for your index
export default {
  Query: {
    adminGetAllCustomers,
    adminGetCustomerDetails,
    adminGetAllSearches,
    adminGetAllTransactions,
    adminGetAllTickets
  },
  Mutation: {
    adminLogin,
    adminGrantFreeCredits,
    adminReplyToTicket,
    adminCloseTicket
  }
};
