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
    async register(_, { email, password }) {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('User already exists');
      const passwordHash = await hashPassword(password);
      const user = await User.create({ email, passwordHash });
      return createToken(user);
    },
    async login(_, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const valid = await comparePasswords(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');
      return createToken(user);
    }
  }
};
