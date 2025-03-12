// backend/src/resolvers/userResolvers.js
const User = require('../models/User');
const { hashPassword, comparePasswords, createToken } = require('../services/auth');
const { sendMail } = require('../services/mailer'); // hypothetical mailer service
const crypto = require('crypto');

module.exports = {
  Query: {
    async getUserProfile(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      return User.findById(user.userId);
    }
  },

  Mutation: {
    // EXTENDED REGISTER WITH VERIFICATION
    async register(
      _,
      { email, password, username, phone, userIntention, termsAccepted }
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

      // 4) Fallback username => email if not provided
      const finalUsername = username && username.trim().length
        ? username.trim()
        : email;

      // 5) Generate a random verification token
      const verificationToken = crypto.randomBytes(24).toString('hex');

      // 6) Create user with isVerified=false
      const user = await User.create({
        email,
        username: finalUsername,
        phone: phone?.trim() || '',
        userIntention,
        termsAccepted,
        isVerified: false,
        verificationToken,
        passwordHash,
      });

      // 7) Build verification link (your front-end or server route)
      // Example: http://localhost:3000/verify-email?token=XYZ
      const verifyUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}`;

      // 8) Send verification email
      await sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <h1>Welcome to Our App</h1>
          <p>Click the link below to verify your account:</p>
          <a href="${verifyUrl}">Verify Email</a>
        `,
      });

      // 9) Optionally return a message instead of a token.
      // If you don't want them to log in until verified, you can just say:
      return 'Registration successful! Please check your email to verify your account.';
    },
    async changePassword(_, { currentPassword, newPassword }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
  
      const valid = await comparePasswords(currentPassword, currentUser.passwordHash);
      if (!valid) throw new Error('Current password is incorrect');
  
      // hash new password, save, return true
      currentUser.passwordHash = await hashPassword(newPassword);
      await currentUser.save();
      return true;
    },
    // LOGIN
    async login(_, { email, password }) {
      // 1) Find user
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      // 2) Check password
      const valid = await comparePasswords(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      // 3) If not verified, block login
      if (!user.isVerified) {
        throw new Error('Please verify your email before logging in.');
      }

      // 4) Return JWT token
      return createToken(user);
    },

    // VERIFY EMAIL
    async verifyEmail(_, { token }) {
      // 1) Lookup user by verificationToken
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        throw new Error('Invalid or expired verification token.');
      }

      // 2) Mark as verified, clear token
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      return true; // or return a string message if you prefer
    },
    async resendVerificationEmail(_, { email }) {
      // 1) Find the user
      const user = await User.findOne({ email });
      if (!user) throw new Error('No user found with that email');

      // 2) If already verified, no need to resend
      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      // 3) Generate a new token
      const verificationToken = crypto.randomBytes(24).toString('hex');
      user.verificationToken = verificationToken;
      await user.save();

      // 4) Send an email with the new token
      const verifyUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}`;
      await sendMail({
        to: user.email,
        subject: 'Resend Verification - Please Verify Your Email',
        html: `
          <p>Click to verify your account: 
            <a href="${verifyUrl}">Verify</a>
          </p>
        `,
      });

      return true; // or return a string if you prefer
    }
  }
};
