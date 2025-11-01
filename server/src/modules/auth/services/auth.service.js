/**
 * Authentication Service
 * Handles user authentication business logic
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../schemas/user.schema.js';
import { JWT_CONFIG } from '../../../config/jwt.js';
import { createObjectId } from '../../../utils/db.js';
import { ValidationError, AuthenticationError } from '../../../utils/errors.js';

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  const payload = {
    _id: user._id,
    channelName: user.channelName,
    email: user.email,
    phone: user.phone,
    logoId: user.logoId,
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
}

/**
 * Check if email exists
 * @param {string} email - Email address
 * @returns {Promise<boolean>}
 */
async function emailExists(email) {
  const user = await User.findOne({ email });
  return !!user;
}

/**
 * Check if channel name exists
 * @param {string} channelName - Channel name
 * @returns {Promise<boolean>}
 */
async function channelNameExists(channelName) {
  const user = await User.findOne({ channelName });
  return !!user;
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.channelName - Channel name
 * @param {string} userData.email - Email address
 * @param {string} userData.phone - Phone number
 * @param {string} userData.password - Plain text password
 * @param {string} userData.logoUrl - Logo URL
 * @param {string} userData.logoId - Logo S3 key
 * @returns {Promise<Object>} Created user
 */
async function createUser(userData) {
  const { channelName, email, phone, password, logoUrl, logoId } = userData;

  // Check if email already exists
  if (await emailExists(email)) {
    throw new ValidationError('Email already exists');
  }

  // Check if channel name already exists
  if (await channelNameExists(channelName)) {
    throw new ValidationError('Channel name already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = new User({
    _id: createObjectId(),
    channelName,
    email,
    phone,
    password: hashedPassword,
    logoUrl,
    logoId,
  });

  const savedUser = await newUser.save();
  
  // Remove password from response
  const userObj = savedUser.toObject();
  delete userObj.password;

  return userObj;
}

/**
 * Authenticate user and generate token
 * @param {string} email - Email address
 * @param {string} password - Plain text password
 * @returns {Promise<{user: Object, token: string}>}
 */
async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new AuthenticationError('Invalid password');
  }

  // Generate token
  const token = generateToken(user);

  // Remove password from user object
  const userObj = user.toObject();
  delete userObj.password;

  return {
    user: userObj,
    token,
  };
}

export {
  hashPassword,
  comparePassword,
  generateToken,
  createUser,
  login,
  emailExists,
  channelNameExists,
};

export default {
  createUser,
  login,
};

