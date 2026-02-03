/**
 * Authentication Controller
 * Handles HTTP request/response for authentication endpoints
 */

import authService from '../services/auth.service.js';

/**
 * Handle user signup
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function signup(request, reply) {
  const { name, email, phone, password } = request.body;

  // Create user
  const user = await authService.createUser({
    name,
    email,
    phone,
    password,
  });

  return reply.status(201).send({
    message: 'User created successfully',
    user,
  });
}

/**
 * Handle user login
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function login(request, reply) {
  const { email, password } = request.body;

  const { user, token } = await authService.login(email, password);

  return reply.status(200).send({
    message: 'Login successful',
    user,
    token,
  });
}

export {
  signup,
  login,
};

export default {
  signup,
  login,
};

