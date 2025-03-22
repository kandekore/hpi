// resolvers/SupportResolvers.js

import SupportTicket from '../models/SupportTicket.js';
import { sendMail } from '../services/mailer.js';
import crypto from 'crypto';

export default {
  Query: {
    async getMyTickets(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      // Return tickets for this user only
      return SupportTicket.find({ userId: user.userId }).sort({ lastUpdated: -1 });
    },

    async getTicketById(_, { ticketId }, { user }) {
      if (!user) throw new Error('Not authenticated');
      // Ensure user owns it
      const ticket = await SupportTicket.findById(ticketId);
      if (!ticket) throw new Error('Ticket not found.');
      if (ticket.userId.toString() !== user.userId) {
        throw new Error('Not authorized to view this ticket.');
      }
      return ticket;
    }
  },

  Mutation: {
    async createSupportTicket(_, { input }, { user }) {
      if (!user) throw new Error('Not authenticated');

      // Generate a unique reference
      const randomNum = Math.floor(Math.random() * 1000000);
      const ticketRef = `TCK-${randomNum}`;

      const ticket = await SupportTicket.create({
        userId: user.userId,
        email: input.email,
        name: input.name,
        department: input.department || 'Support',
        subject: input.subject,
        priority: input.priority || 'Low',
        ticketRef,
        messages: [
          {
            sender: 'User',
            text: input.message,
          },
        ]
      });

      // Email staff
      await sendMail({
        to: 'support@vehicledatainformation.co.uk',
        subject: `New Ticket #${ticketRef} - ${input.subject}`,
        html: `
          <h1>New Ticket Created</h1>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Department:</strong> ${ticket.department}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Message:</strong> ${input.message}</p>
        `
      });

      // Email the user
      await sendMail({
        to: input.email,
        subject: `We received your ticket #${ticketRef}`,
        html: `
          <p>Hello ${input.name},</p>
          <p>We've received your ticket (#${ticketRef}). Our team will get back to you as soon as possible.</p>
          <p>You can view or update your ticket by logging into your dashboard.</p>
        `
      });

      return ticket;
    },

    async replyToSupportTicket(_, { input }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const { ticketId, message } = input;

      const ticket = await SupportTicket.findById(ticketId);
      if (!ticket) throw new Error('Ticket not found.');
      if (ticket.userId.toString() !== user.userId) {
        throw new Error('Not authorized to update this ticket.');
      }

      // Add a new message from the user
      ticket.messages.push({
        sender: 'User',
        text: message
      });

      // Possibly update status => “Customer-Reply,” etc
      ticket.status = 'Customer-Reply';
      await ticket.save();

      // Email staff about the update
      await sendMail({
        to: 'support@vehicledatainformation.co.uk',
        subject: `Ticket #${ticket.ticketRef} updated by user`,
        html: `
          <p>User posted a new reply on Ticket #${ticket.ticketRef}:</p>
          <p>${message}</p>
        `
      });

      return ticket;
    },

    async closeSupportTicket(_, { ticketId }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const ticket = await SupportTicket.findById(ticketId);
      if (!ticket) throw new Error('Ticket not found.');
      if (ticket.userId.toString() !== user.userId) {
        throw new Error('Not authorized to close this ticket.');
      }

      ticket.status = 'Closed';
      await ticket.save();

      // Possibly email staff or user that it's closed
      await sendMail({
        to: ticket.email,
        subject: `Ticket #${ticket.ticketRef} has been closed`,
        html: `
          <p>Hello ${ticket.name},</p>
          <p>Your ticket #${ticket.ticketRef} has been marked as Closed. 
          If you need further assistance, feel free to open a new ticket or respond.</p>
        `
      });

      return ticket;
    }
  }
};
