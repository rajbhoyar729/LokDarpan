/**
 * Comment Controller
 * Handles HTTP request/response for comment endpoints
 */

import commentService from '../services/comment.service.js';

/**
 * Handle comment creation
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function createComment(request, reply) {
  const { videoId } = request.params;
  const { comment_text } = request.body;
  const userId = request.userId;

  const comment = await commentService.createComment(videoId, userId, comment_text);

  return reply.status(201).send({
    message: 'Comment added successfully',
    comment,
  });
}

/**
 * Handle comment update
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function updateComment(request, reply) {
  const { commentId } = request.params;
  const { comment_text } = request.body;
  const userId = request.userId;

  const updatedComment = await commentService.updateComment(commentId, userId, comment_text);

  return reply.status(200).send({
    message: 'Comment updated successfully',
    comment: updatedComment,
  });
}

/**
 * Handle comment deletion
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function deleteComment(request, reply) {
  const { commentId } = request.params;
  const userId = request.userId;

  await commentService.deleteComment(commentId, userId);

  return reply.status(200).send({
    message: 'Comment deleted successfully',
  });
}

export {
  createComment,
  updateComment,
  deleteComment,
};

export default {
  createComment,
  updateComment,
  deleteComment,
};

