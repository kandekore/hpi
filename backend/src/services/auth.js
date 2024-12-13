const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

module.exports = {
  createToken(user) {
    return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  },
  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  }
};
