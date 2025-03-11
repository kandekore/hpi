// backend/src/resolvers/userResolvers.js
const User = require('../models/User');
const { hashPassword, comparePasswords, createToken } = require('../services/auth');

module.exports = {
  Query: {
    async getUserProfile(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      return User.findById(user.userId);
    }
  },

  Mutation: {
    // EXTENDED REGISTER
    async register(
      _,
      {
        email,
        password,
        username,
        phone,
        userIntention,
        termsAccepted,
      }
    ) {
      // 1) Check if user exists
      const existing = await User.findOne({ email });
      if (existing) throw new Error('User already exists');

      // 2) Basic validation
      if (!termsAccepted) {
        throw new Error('You must accept the terms and conditions');
      }

      // 3) Hash password
      const passwordHash = await hashPassword(password);

      // 4) If username not provided, fallback to email
      const finalUsername = username && username.trim().length
        ? username.trim()
        : email;

      // 5) Create the user
      const user = await User.create({
        email,
        username: finalUsername,
        phone: phone?.trim() || '',
        userIntention,
        termsAccepted,
        isVerified: true, // For now, we mark them verified by default
        passwordHash,
      });

      // 6) Return a JWT token (or you can skip if you want email verification)
      return createToken(user);
    },

    // LOGIN
    async login(_, { email, password }) {
      // 1) Find user
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      // 2) Check password
      const valid = await comparePasswords(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      // OPTIONAL: check if user.isVerified
      // if (!user.isVerified) {
      //   throw new Error('Please verify your email before logging in');
      // }

      // 3) Return a JWT token
      return createToken(user);
    }
  }
};
