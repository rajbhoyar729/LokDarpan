/**
 * Video Service
 * Handles video-related business logic
 */

import Video from '../schemas/video.schema.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../../utils/errors.js';
import { isValidObjectId, createObjectId } from '../../../utils/db.js';
import storageService from '../../../services/storage.service.js';
import { validateVideoFile, validateImageFile } from '../../../utils/upload.js';

/**
 * Create a new video
 * @param {Object} videoData - Video data
 * @param {string} videoData.title - Video title
 * @param {string} videoData.description - Video description
 * @param {string} videoData.user_id - User ID (owner)
 * @param {string} videoData.category - Video category
 * @param {string} videoData.tags - Comma-separated tags
 * @param {Object} videoFile - Video file from multipart
 * @param {Object} thumbnailFile - Thumbnail file from multipart
 * @returns {Promise<Object>} Created video
 */
async function createVideo(videoData, videoFile, thumbnailFile) {
  const { title, description, user_id, category, tags } = videoData;

  // Validate files
  validateVideoFile(videoFile);
  validateImageFile(thumbnailFile);

  // Upload files to S3
  const [videoUpload, thumbnailUpload] = await Promise.all([
    storageService.uploadVideo(videoFile),
    storageService.uploadThumbnail(thumbnailFile),
  ]);

  // Parse tags
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  // Create video
  const newVideo = new Video({
    _id: createObjectId(),
    title,
    description,
    user_id,
    category,
    tags: tagsArray,
    videoUrl: videoUpload.url,
    videoId: videoUpload.key,
    thumbnailUrl: thumbnailUpload.url,
    thumbnailId: thumbnailUpload.key,
  });

  const savedVideo = await newVideo.save();
  return savedVideo;
}

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} Video object
 */
async function getVideoById(videoId) {
  if (!isValidObjectId(videoId)) {
    throw new ValidationError('Invalid video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new NotFoundError('Video');
  }

  return video;
}

/**
 * Update video
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID (must be owner)
 * @param {Object} updateData - Update data
 * @param {Object} thumbnailFile - Optional new thumbnail file
 * @returns {Promise<Object>} Updated video
 */
async function updateVideo(videoId, userId, updateData, thumbnailFile = null) {
  const video = await getVideoById(videoId);

  // Check ownership
  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to update this video');
  }

  // Handle thumbnail update if provided
  if (thumbnailFile) {
    validateImageFile(thumbnailFile);
    
    // Delete old thumbnail
    await storageService.deleteFile(video.thumbnailId);
    
    // Upload new thumbnail
    const thumbnailUpload = await storageService.uploadThumbnail(thumbnailFile);
    updateData.thumbnailUrl = thumbnailUpload.url;
    updateData.thumbnailId = thumbnailUpload.key;
  }

  // Parse tags if provided
  if (updateData.tags) {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  // Update video
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedVideo;
}

/**
 * Delete video
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID (must be owner)
 * @returns {Promise<void>}
 */
async function deleteVideo(videoId, userId) {
  const video = await getVideoById(videoId);

  // Check ownership
  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to delete this video');
  }

  // Delete files from S3
  await Promise.all([
    storageService.deleteFile(video.videoId),
    storageService.deleteFile(video.thumbnailId),
  ]);

  // Delete video from database
  await Video.findByIdAndDelete(videoId);
}

/**
 * Toggle like on video
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID
 * @returns {Promise<{action: string, likes: number}>}
 */
async function toggleLike(videoId, userId) {
  const video = await getVideoById(videoId);

  const userIdStr = userId.toString();
  const isLiked = video.likedBy.some(id => id.toString() === userIdStr);
  const isDisliked = video.dislikedBy.some(id => id.toString() === userIdStr);

  if (isLiked) {
    // Unlike
    video.likedBy.pull(userId);
    video.likes--;
    await video.save();
    return { action: 'unliked', likes: video.likes };
  } else {
    // Remove dislike if exists
    if (isDisliked) {
      video.dislikedBy.pull(userId);
      video.dislikes--;
    }

    // Add like
    video.likedBy.push(userId);
    video.likes++;
    await video.save();
    return { action: 'liked', likes: video.likes };
  }
}

/**
 * Toggle dislike on video
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID
 * @returns {Promise<{action: string, dislikes: number}>}
 */
async function toggleDislike(videoId, userId) {
  const video = await getVideoById(videoId);

  const userIdStr = userId.toString();
  const isDisliked = video.dislikedBy.some(id => id.toString() === userIdStr);
  const isLiked = video.likedBy.some(id => id.toString() === userIdStr);

  if (isDisliked) {
    // Undislike
    video.dislikedBy.pull(userId);
    video.dislikes--;
    await video.save();
    return { action: 'undisliked', dislikes: video.dislikes };
  } else {
    // Remove like if exists
    if (isLiked) {
      video.likedBy.pull(userId);
      video.likes--;
    }

    // Add dislike
    video.dislikedBy.push(userId);
    video.dislikes++;
    await video.save();
    return { action: 'disliked', dislikes: video.dislikes };
  }
}

export {
  createVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
};

export default {
  createVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
};

