/**
 * Authentication Middleware for Fastify
 * Verifies JWT tokens and injects user into request
 */

import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
import { AuthenticationError } from '../utils/errors.js';

/**
 * Fastify preHandler hook for authentication
 * Verifies JWT token from Authorization header
 * 
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
export async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Token not provided');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    // Attach user to request object
    request.user = decoded;
    request.userId = decoded._id || decoded.id;

  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Invalid or expired token');
    }

    throw new AuthenticationError('Authentication failed');
  }
}

/**
 * Optional authentication - doesn't throw if no token
 * @param {FastifyRequest} request - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
export async function optionalAuthenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        request.user = decoded;
        request.userId = decoded._id || decoded.id;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    request.user = null;
    request.userId = null;
  }
}

export default authenticate;

