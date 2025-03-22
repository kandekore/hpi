// backend/src/resolvers/userResolvers.js
import User from '../models/User.js';
import { hashPassword, comparePasswords, createToken } from '../services/auth.js';
import { sendMail }  from '../services/mailer.js'; // hypothetical mailer service
import crypto from 'crypto';
import fetch from 'node-fetch'; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default {
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
      { email, password, username, phone, userIntention, termsAccepted, captchaToken }
    ) {

      const secretKey = process.env.RECAPTCHA_SECRET_KEY; // set in your .env
  if (!captchaToken) {
    throw new Error('Missing CAPTCHA token');
  }

  const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
  const captchaResp = await fetch(recaptchaUrl, { method: 'POST' });
  const captchaData = await captchaResp.json();
  if (!captchaData.success) {
    throw new Error('Invalid CAPTCHA. Please try again.');
  }
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
    async login(_, { email, password, captchaToken }) {
      if (!captchaToken) {
        throw new Error('Please solve the CAPTCHA first.');
      }
       // 1) reCAPTCHA check
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!captchaToken) {
    throw new Error('Missing CAPTCHA token');
  }
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
  const resp = await fetch(verifyUrl, { method: 'POST' });
  const captchaData = await resp.json();
  if (!captchaData.success) {
    throw new Error('Invalid CAPTCHA. Please try again.');
  }
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
      const emailVerifyUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}`;
await sendMail({
  to: user.email,
  subject: 'Verify Your Email',
  html: `
    <h1>Welcome to Our App</h1>
    <p>Click the link below to verify your account:</p>
    <a href="${emailVerifyUrl}">Verify Email</a>
  `,
});

      return true; // or return a string if you prefer
    },
    async requestPasswordReset(_, { email }) {
      // 1) Find user
      const user = await User.findOne({ email });
      if (!user) {
        // for security, you might pretend success anyway
        return true;
      }
    
      // 2) Generate a reset token (like in email verification)
      const resetToken = crypto.randomBytes(24).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // e.g. 15 minutes
      await user.save();
    
      // 3) Email the link
      const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendMail({
        to: user.email,
        subject: 'Reset your password',
        html: `Click to reset: <a href="${resetUrl}">${resetUrl}</a>`
      });
    
      return true;
    }, async resetPassword(_, { token, newPassword }) {
      // 1) Find user by passwordResetToken
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() } // not expired
      });
      if (!user) {
        throw new Error('Reset token is invalid or expired.');
      }
    
      // 2) Update password
      user.passwordHash = await hashPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    
      return true;
    }
    
    
  }
};
