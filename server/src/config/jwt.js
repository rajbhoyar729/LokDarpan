/**
 * JWT Configuration
 */

import { config } from 'dotenv';

config();

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'this is a secret key$$$??//876777',
  expiresIn: process.env.JWT_EXPIRES_IN || '365d',
};

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment. Using default (not recommended for production)');
}

export default JWT_CONFIG;

