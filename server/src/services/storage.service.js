/**
 * AWS S3 Storage Service
 * Handles file uploads, deletions, and management for videos, thumbnails, and user logos
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { AWS_CONFIG } from '../config/aws.js';
import { createReadStream, createWriteStream } from 'fs';
import { unlink, stat } from 'fs/promises';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';

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

function buildPublicUrl(key) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }
  const k = key.includes('amazonaws.com/') ? key.split('.amazonaws.com/')[1] : key;
  return `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${k}`;
}

function normalizeKey(key) {
  if (!key) return '';
  return key.includes('amazonaws.com/') ? key.split('.amazonaws.com/')[1] : key;
}

async function headObject(key) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }
  const k = normalizeKey(key);
  return s3Client.send(
    new HeadObjectCommand({
      Bucket: AWS_CONFIG.bucketName,
      Key: k,
    })
  );
}

async function getObjectToFile(key, destPath) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }
  const k = normalizeKey(key);
  const out = await s3Client.send(
    new GetObjectCommand({
      Bucket: AWS_CONFIG.bucketName,
      Key: k,
    })
  );
  await pipeline(out.Body, createWriteStream(destPath));
}

async function uploadStreamToKey(key, bodyStream, contentType) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }
  const k = normalizeKey(key);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_CONFIG.bucketName,
      Key: k,
      Body: bodyStream,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read',
    })
  );
  return { key: k, url: buildPublicUrl(k) };
}

async function uploadLocalFile(key, filePath, contentType) {
  const st = await stat(filePath);
  if (!st.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }
  const stream = createReadStream(filePath);
  return uploadStreamToKey(key, stream, contentType);
}

async function listObjectKeysUnderPrefix(prefix) {
  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }
  const keys = [];
  let token;
  do {
    const res = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: AWS_CONFIG.bucketName,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );
    for (const o of res.Contents || []) {
      if (o.Key) keys.push(o.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function deleteObjectsByKeys(keys) {
  if (!keys.length || !AWS_CONFIG.bucketName) return;
  const chunkSize = 1000;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: AWS_CONFIG.bucketName,
        Delete: {
          Objects: chunk.map(Key => ({ Key })),
          Quiet: true,
        },
      })
    );
  }
}

async function deletePrefix(prefix) {
  const keys = await listObjectKeysUnderPrefix(prefix);
  await deleteObjectsByKeys(keys);
}

export {
  uploadFile,
  uploadVideo,
  uploadThumbnail,
  uploadLogo,
  deleteFile,
  deleteFiles,
  buildPublicUrl,
  headObject,
  getObjectToFile,
  uploadStreamToKey,
  uploadLocalFile,
  listObjectKeysUnderPrefix,
  deleteObjectsByKeys,
  deletePrefix,
  normalizeKey,
};

export default {
  uploadVideo,
  uploadThumbnail,
  uploadLogo,
  deleteFile,
  deleteFiles,
  buildPublicUrl,
  headObject,
  getObjectToFile,
  uploadStreamToKey,
  uploadLocalFile,
  listObjectKeysUnderPrefix,
  deleteObjectsByKeys,
  deletePrefix,
  normalizeKey,
};

