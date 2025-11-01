/**
 * AWS S3 Storage Service
 * Handles file uploads, deletions, and management for videos, thumbnails, and user logos
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AWS_CONFIG } from '../config/aws.js';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.accessKeyId && AWS_CONFIG.secretAccessKey
    ? {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      }
    : undefined,
});

/**
 * Upload a file to S3
 * @param {Object} file - File object from Fastify multipart
 * @param {string} folder - Folder path in S3 bucket (e.g., 'videos', 'thumbnails', 'logos')
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadFile(file, folder = 'uploads', contentType = null) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  try {
    // Generate unique filename
    const fileExtension = file.filename.split('.').pop();
    const uniqueFileName = `${folder}/${randomUUID()}.${fileExtension}`;

    // Read file stream
    const fileStream = createReadStream(file.filepath);

    // Upload to S3
    const uploadParams = {
      Bucket: AWS_CONFIG.bucketName,
      Key: uniqueFileName,
      Body: fileStream,
      ContentType: contentType || file.mimetype || 'application/octet-stream',
      ACL: 'public-read', // Make files publicly accessible
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct public URL
    const fileUrl = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${uniqueFileName}`;

    // Clean up temporary file
    try {
      await unlink(file.filepath);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete temporary file:', cleanupError);
    }

    return {
      url: fileUrl,
      key: uniqueFileName,
    };
  } catch (error) {
    // Clean up temporary file on error
    try {
      await unlink(file.filepath);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete temporary file:', cleanupError);
    }
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Upload a video file to S3
 * @param {Object} file - Video file from Fastify multipart
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadVideo(file) {
  return uploadFile(file, 'videos', 'video/mp4');
}

/**
 * Upload a thumbnail image to S3
 * @param {Object} file - Thumbnail file from Fastify multipart
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadThumbnail(file) {
  return uploadFile(file, 'thumbnails', 'image/jpeg');
}

/**
 * Upload a user logo to S3
 * @param {Object} file - Logo file from Fastify multipart
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadLogo(file) {
  return uploadFile(file, 'logos', 'image/png');
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key (path)
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  if (!key) {
    console.warn('Warning: Attempted to delete file with empty key');
    return;
  }

  try {
    // Extract key from URL if full URL is provided
    const s3Key = key.includes('amazonaws.com/') 
      ? key.split('.amazonaws.com/')[1] 
      : key;

    const deleteParams = {
      Bucket: AWS_CONFIG.bucketName,
      Key: s3Key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error(`Error deleting file from S3 (key: ${key}):`, error.message);
    // Don't throw error on delete failure to prevent cascading errors
  }
}

/**
 * Delete multiple files from S3
 * @param {string[]} keys - Array of S3 object keys
 * @returns {Promise<void>}
 */
async function deleteFiles(keys) {
  await Promise.all(keys.map(key => deleteFile(key)));
}

export {
  uploadFile,
  uploadVideo,
  uploadThumbnail,
  uploadLogo,
  deleteFile,
  deleteFiles,
};

export default {
  uploadVideo,
  uploadThumbnail,
  uploadLogo,
  deleteFile,
  deleteFiles,
};

