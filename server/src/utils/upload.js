/**
 * File Upload Utilities
 * Handles file validation, type checking, and size limits
 */

// Allowed MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// File size limits (in bytes)
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate video file
 * @param {Object} file - File object from Fastify multipart
 * @throws {Error} If file is invalid
 */
export function validateVideoFile(file) {
  if (!file) {
    throw new Error('Video file is required');
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
  }

  if (file.fileSize > MAX_VIDEO_SIZE) {
    throw new Error(`Video file size exceeds maximum allowed size of ${MAX_VIDEO_SIZE / (1024 * 1024)} MB`);
  }
}

/**
 * Validate image file (thumbnail or logo)
 * @param {Object} file - File object from Fastify multipart
 * @throws {Error} If file is invalid
 */
export function validateImageFile(file) {
  if (!file) {
    throw new Error('Image file is required');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  if (file.fileSize > MAX_IMAGE_SIZE) {
    throw new Error(`Image file size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)} MB`);
  }
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file is a video
 * @param {Object} file - File object
 * @returns {boolean}
 */
export function isVideoFile(file) {
  return file && ALLOWED_VIDEO_TYPES.includes(file.mimetype);
}

/**
 * Check if file is an image
 * @param {Object} file - File object
 * @returns {boolean}
 */
export function isImageFile(file) {
  return file && ALLOWED_IMAGE_TYPES.includes(file.mimetype);
}

export {
  ALLOWED_VIDEO_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_VIDEO_SIZE,
  MAX_IMAGE_SIZE,
};

