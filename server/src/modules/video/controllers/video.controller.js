/**
 * Video Controller
 * Handles HTTP request/response for video endpoints
 */

import videoService from '../services/video.service.js';

/**
 * Handle video upload initiation
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function initiateUpload(request, reply) {
  const userId = request.userId;
  const metadata = request.body;

  const video = await videoService.initiateVideoUpload(metadata, userId);

  return reply.status(201).send(video);
}

/**
 * Handle video upload
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function uploadVideo(request, reply) {
  const userId = request.userId;

  // Parse multipart form data
  const parts = request.parts();
  const data = {};
  let videoFile = null;
  let thumbnailFile = null;

  for await (const part of parts) {
    if (part.file) {
      // It's a file
      if (part.fieldname === 'video') {
        videoFile = part;
      } else if (part.fieldname === 'thumbnail') {
        thumbnailFile = part;
      }
    } else {
      // It's a field
      data[part.fieldname] = part.value;
    }
  }

  const { title, description, category, tags } = data;

  if (!videoFile) {
    return reply.status(400).send({
      error: {
        message: 'Video file is required',
      },
    });
  }

  if (!thumbnailFile) {
    return reply.status(400).send({
      error: {
        message: 'Thumbnail file is required',
      },
    });
  }

  const video = await videoService.createVideo(
    { title, description, user_id: userId, category, tags },
    videoFile,
    thumbnailFile
  );

  return reply.status(201).send({
    message: 'Video uploaded successfully',
    videoId: video._id,
    video,
  });
}

/**
 * Handle video update
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function updateVideo(request, reply) {
  const { videoId } = request.params;
  const userId = request.userId;

  // Parse multipart form data
  const parts = request.parts();
  const data = {};
  let thumbnailFile = null;

  for await (const part of parts) {
    if (part.file) {
      // It's a file
      if (part.fieldname === 'thumbnail') {
        thumbnailFile = part;
      }
    } else {
      // It's a field
      data[part.fieldname] = part.value;
    }
  }

  const { title, description, category, tags } = data;

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (category) updateData.category = category;
  if (tags) updateData.tags = tags;

  const updatedVideo = await videoService.updateVideo(videoId, userId, updateData, thumbnailFile);

  return reply.status(200).send({
    message: 'Video updated successfully',
    video: updatedVideo,
  });
}

/**
 * Handle video deletion
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function deleteVideo(request, reply) {
  const { videoId } = request.params;
  const userId = request.userId;

  await videoService.deleteVideo(videoId, userId);

  return reply.status(200).send({
    message: 'Video deleted successfully',
  });
}

/**
 * Handle video like
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function likeVideo(request, reply) {
  const { videoId } = request.params;
  const userId = request.userId;

  const result = await videoService.toggleLike(videoId, userId);

  return reply.status(200).send({
    message: `Video ${result.action} successfully`,
    likes: result.likes,
  });
}

/**
 * Handle video dislike
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function dislikeVideo(request, reply) {
  const { videoId } = request.params;
  const userId = request.userId;

  const result = await videoService.toggleDislike(videoId, userId);

  return reply.status(200).send({
    message: `Video ${result.action} successfully`,
    dislikes: result.dislikes,
  });
}

export {
  initiateUpload,
  uploadVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
};

export default {
  initiateUpload,
  uploadVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
};

