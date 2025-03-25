import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SearchRecord from '../models/SearchRecord.js';
import SupportTicket from '../models/SupportTicket.js';
import { sendMail } from '../services/mailer.js';

import { comparePasswords, createToken } from '../services/auth.js';

// Helper function if you want a one-liner check
function isAdminOrThrow(user) {
  if (!user || user.role !== 'admin') {
    throw new Error('Not authorized. Admin only.');
  }
}

// -------------- Queries --------------

/** 1) List all customers with optional filters (email, username) */
async function adminGetAllCustomers(_, { email, username }, { user }) {
  // isAdminOrThrow(user); // Commented out until you’re ready to enforce admin

  const query = {};
  if (email) {
    query.email = { $regex: email, $options: 'i' };
  }
  if (username) {
    query.username = { $regex: username, $options: 'i' };
  }

  const users = await User.find(query).sort({ createdAt: -1 });

  const results = [];
  for (const u of users) {
    // Sum all transactions where amountPaid > 0
    const totalSpentCents = await Transaction.aggregate([
      { $match: { userId: u._id, amountPaid: { $gt: 0 } } },
      { $group: { _id: null, sum: { $sum: '$amountPaid' } } }
    ]);
    const sum = totalSpentCents.length ? totalSpentCents[0].sum : 0;

    results.push({
      // If your schema requires `id`, convert `_id` to string:
      id: u._id.toString(),
      email: u.email,
      username: u.username,
      createdAt: u.createdAt,
      totalSpent: (sum / 100).toFixed(2),
      timestamp: u.timestamp
    });
  }

  return results;
}

/** 2) Get a single customer’s details */
async function adminGetCustomerDetails(_, { userId }, { user }) {
  // isAdminOrThrow(user);

  const found = await User.findById(userId);
  if (!found) {
    throw new Error('No user found with that ID');
  }

  // Return as-is or reshape if you want `id` as a string, etc.
  // Return the mongoose doc directly if your schema is flexible
  // or do something like:
  // return { ...found.toObject(), id: found._id.toString() };
  return found;
}

/** 3) List all searches with optional email, searchType filters */
async function adminGetAllSearches(_, { email, searchType }, { user }) {
  // isAdminOrThrow(user);

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

  return results.map((r) => ({
    id: r._id.toString(),
    userId: r.userId,
    userEmail: r.user.email,
    vehicleReg: r.vehicleReg,
    searchType: r.searchType,
    timestamp: r.timestamp,             // <-- add comma here
    responseData: r.responseData,
    makeModel: r.responseData?.DataItems?.VehicleDetails
      ? r.responseData.DataItems.VehicleDetails.Make + ' ' + 
        r.responseData.DataItems.VehicleDetails.Model
      : ''
  }));
  
}

/** 4) List transactions with optional email, creditType filters */
async function adminGetAllTransactions(_, { email, creditType }, { user }) {
  // isAdminOrThrow(user);

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

  return results.map((r) => ({
    id: r._id.toString(),
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
  // isAdminOrThrow(user);

  const query = {};
  if (status) query.status = status;
  if (email) query.email = { $regex: email, $options: 'i' };

  return await SupportTicket.find(query).sort({ lastUpdated: -1 });
}

// -------------- Mutations --------------

/** A separate "adminLogin" if you want to keep it distinct from normal "login" */
async function adminLogin(_, { email, password }) {
  const adminUser = await User.findOne({ email });
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('Not an admin or invalid credentials');
  }

  const valid = await comparePasswords(password, adminUser.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  return createToken(adminUser);
}

/** Grant free credits to a user (admin only) */
async function adminGrantFreeCredits(_, { userId, creditType, quantity }, { user }) {
  // isAdminOrThrow(user);

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new Error('User not found');
  }

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
  // isAdminOrThrow(user); // re-enable if you want to ensure user.role === 'admin'

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // add new message from 'Support'
  ticket.messages.push({
    sender: 'Support',
    text: message
  });

  ticket.status = 'Answered';
  await ticket.save();

  // Send email to the ticket owner notifying of new staff reply
  await sendMail({
    to: ticket.email,
    subject: `New Reply on Ticket #${ticket.ticketRef} - ${ticket.subject}`,
    html: `
      <p>Hi ${ticket.name},</p>
      <p>You have a new reply from our Support team on Ticket #${ticket.ticketRef}.</p>
      <p><strong>Message:</strong><br/>${message}</p>
      <hr/>
      <p>Please log in to your dashboard to view or respond further.</p>
    `
  });

  return ticket;
}

/** Admin closes a ticket */
async function adminCloseTicket(_, { ticketId }, { user }) {
  // isAdminOrThrow(user);

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  ticket.status = 'Closed';
  await ticket.save();

  return ticket;
}

// -------------- Additional Queries --------------

// Return a single SearchRecord by _id
async function getSearchById(_, { id }, { user }) {
  // isAdminOrThrow(user); // re-enable if you want only admins to see it

  // 1) find the record
  const found = await SearchRecord.findById(id);
  if (!found) {
    throw new Error('No search record found with that ID');
  }

  // 2) Return it
  // If your GraphQL type is "SearchRecord { id, vehicleReg, ... }"
  // and you have "id: ID!", Mongoose typically has `_id`.
  // Usually you can just return `found` because the schema can map `_id` -> `id`.
  // If you prefer explicit, do:
  return {
    ...found.toObject(),
    id: found._id.toString(),
  };
}

// Return a single SupportTicket by _id
async function adminGetTicketById(_, { id }, { user }) {
  // isAdminOrThrow(user);

  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    throw new Error('No ticket found with that ID');
  }

  // The 'messages' array has postedAt, etc. 
  // Just return it; Mongoose object is fine for your schema shape.
  return {
    ...ticket.toObject(),
    id: ticket._id.toString(),
  };
}


// Export in a single object
export default {
  Query: {
    adminGetAllCustomers,
    adminGetCustomerDetails,
    adminGetAllSearches,
    adminGetAllTransactions,
    adminGetAllTickets,
    adminGetTicketById,
    getSearchById,
  },
  Mutation: {
    adminLogin,
    adminGrantFreeCredits,
    adminReplyToTicket,
    adminCloseTicket,
  },
};
