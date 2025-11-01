/**
 * User Controller
 * Handles HTTP request/response for user endpoints
 */

import userService from '../services/user.service.js';

/**
 * Handle subscribe to channel
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function subscribe(request, reply) {
  const { channelId } = request.params;
  const userId = request.userId;

  await userService.subscribeToChannel(userId, channelId);

  return reply.status(200).send({
    message: 'Subscribed to channel successfully',
  });
}

/**
 * Handle unsubscribe from channel
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function unsubscribe(request, reply) {
  const { channelId } = request.params;
  const userId = request.userId;

  await userService.unsubscribeFromChannel(userId, channelId);

  return reply.status(200).send({
    message: 'Unsubscribed from channel successfully',
  });
}

export {
  subscribe,
  unsubscribe,
};

export default {
  subscribe,
  unsubscribe,
};

