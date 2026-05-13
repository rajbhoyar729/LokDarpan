import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Video from '../schemas/video.schema.js';
import { AWS_CONFIG } from '../../../config/aws.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../../utils/errors.js';
import { isValidObjectId, createObjectId } from '../../../utils/db.js';
import storageService from '../../../services/storage.service.js';
import { validateVideoFile, validateImageFile, getFileExtension } from '../../../utils/upload.js';
import { buildTranscodeRequestedPayload } from '../../../shared/contracts/transcoding.messages.js';
import {
  enqueueTranscodeEncodeJob,
  getEncodeQueue,
} from '../../../shared/messaging/transcodeQueues.js';

const presignS3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials:
    AWS_CONFIG.accessKeyId && AWS_CONFIG.secretAccessKey
      ? {
          accessKeyId: AWS_CONFIG.accessKeyId,
          secretAccessKey: AWS_CONFIG.secretAccessKey,
        }
      : undefined,
});

/**
 * Create a new video (multipart): raw to S3 + thumbnail, enqueue multi-bitrate transcode
 */
async function createVideo(videoData, videoFile, thumbnailFile) {
  const { title, description, user_id, category, tags } = videoData;

  validateVideoFile(videoFile);
  validateImageFile(thumbnailFile);

  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  const videoId = createObjectId();
  const ext = getFileExtension(videoFile.filename) || 'mp4';
  const rawKey = `raw-uploads/${user_id}/${videoId.toString()}/source.${ext}`;

  const thumbnailUploadPromise = storageService.uploadThumbnail(thumbnailFile);

  await storageService.uploadStreamToKey(
    rawKey,
    createReadStream(videoFile.filepath),
    videoFile.mimetype || 'video/mp4'
  );
  try {
    await unlink(videoFile.filepath);
  } catch (e) {
    console.warn('Temp video cleanup:', e.message);
  }

  const thumbnailUpload = await thumbnailUploadPromise;
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  const payload = buildTranscodeRequestedPayload({
    videoId: videoId.toString(),
    rawS3Key: rawKey,
    bucket: AWS_CONFIG.bucketName,
    region: AWS_CONFIG.region,
  });

  const job = await enqueueTranscodeEncodeJob(payload);

  const newVideo = new Video({
    _id: videoId,
    title,
    description,
    user_id,
    category,
    tags: tagsArray,
    status: 'PROCESSING',
    rawS3Key: rawKey,
    transcodeJobId: String(job.id),
    thumbnailUrl: thumbnailUpload.url,
    thumbnailId: thumbnailUpload.key,
    videoUrl: null,
    videoId: null,
    hlsMasterUrl: null,
    hlsMasterKey: null,
    renditions: [],
  });

  return newVideo.save();
}

/**
 * Initiate presigned upload
 */
async function initiateVideoUpload(metadata, userId) {
  const { title, description, category, tags } = metadata;

  if (!title || !description) {
    throw new ValidationError('Title and description are required');
  }

  if (!AWS_CONFIG.bucketName) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  const tagsArray =
    typeof tags === 'string' && tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : Array.isArray(tags)
        ? tags
        : [];

  const videoId = createObjectId();
  const fileKey = `raw-uploads/${userId}/${videoId.toString()}.mp4`;

  const newVideo = new Video({
    _id: videoId,
    title,
    description,
    user_id: userId,
    status: 'PENDING',
    rawS3Key: fileKey,
    videoUrl: null,
    videoId: null,
    thumbnailUrl: null,
    thumbnailId: null,
    category: category || null,
    tags: tagsArray,
  });

  const savedVideo = await newVideo.save();

  const putObjectCommand = new PutObjectCommand({
    Bucket: AWS_CONFIG.bucketName,
    Key: fileKey,
    ContentType: 'video/mp4',
  });

  const uploadUrl = await getSignedUrl(presignS3Client, putObjectCommand, {
    expiresIn: 15 * 60,
  });

  return {
    videoId: savedVideo._id.toString(),
    preSignedUrl: uploadUrl,
  };
}

/**
 * After client PUT to S3, verify object and enqueue transcode
 */
async function completeVideoUpload(videoId, userId) {
  const video = await getVideoById(videoId);

  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to complete this upload');
  }

  if (!['PENDING', 'UPLOADING'].includes(video.status)) {
    throw new ValidationError('Video is not waiting for upload completion');
  }

  if (!video.rawS3Key) {
    throw new ValidationError('Missing raw upload key');
  }

  await storageService.headObject(video.rawS3Key);

  const payload = buildTranscodeRequestedPayload({
    videoId: video._id.toString(),
    rawS3Key: video.rawS3Key,
    bucket: AWS_CONFIG.bucketName,
    region: AWS_CONFIG.region,
  });

  const job = await enqueueTranscodeEncodeJob(payload);

  await Video.findByIdAndUpdate(videoId, {
    $set: {
      status: 'PROCESSING',
      transcodeJobId: String(job.id),
    },
  });

  return {
    message: 'Transcoding started',
    status: 'PROCESSING',
    transcodeJobId: String(job.id),
    videoId: video._id.toString(),
  };
}

/**
 * Owner: Bull job + DB status for upload/transcode progress
 */
async function getTranscodeStatus(videoId, userId) {
  const video = await getVideoById(videoId);

  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to view this status');
  }

  let jobState = null;
  let jobProgress = null;
  if (video.transcodeJobId) {
    try {
      const q = getEncodeQueue();
      const j = await q.getJob(video.transcodeJobId);
      if (j) {
        jobState = await j.getState();
        jobProgress = j.progress;
      }
    } catch (e) {
      console.warn('getTranscodeStatus job lookup:', e.message);
    }
  }

  return {
    videoStatus: video.status,
    hlsMasterUrl: video.hlsMasterUrl,
    videoUrl: video.videoUrl,
    transcodeJobId: video.transcodeJobId,
    jobState,
    jobProgress,
    processingError: video.processingError,
    renditions: video.renditions,
  };
}

async function getVideoById(videoId) {
  if (!isValidObjectId(videoId)) {
    throw new ValidationError('Invalid video ID');
  }

  const video = await Video.findById(videoId).populate('user_id');

  if (!video) {
    throw new NotFoundError('Video');
  }

  return video;
}

async function getAllVideos(query = {}) {
  const { category, search } = query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  filter.status = 'COMPLETED';

  return Video.find(filter)
    .sort({ createdAt: -1 })
    .populate('user_id');
}

async function updateVideo(videoId, userId, updateData, thumbnailFile = null) {
  const video = await getVideoById(videoId);

  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to update this video');
  }

  if (thumbnailFile) {
    validateImageFile(thumbnailFile);

    await storageService.deleteFile(video.thumbnailId);

    const thumbnailUpload = await storageService.uploadThumbnail(thumbnailFile);
    updateData.thumbnailUrl = thumbnailUpload.url;
    updateData.thumbnailId = thumbnailUpload.key;
  }

  if (updateData.tags) {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedVideo;
}

async function deleteVideo(videoId, userId) {
  const video = await getVideoById(videoId);

  if (video.user_id.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have permission to delete this video');
  }

  await storageService.deletePrefix(`videos/${videoId}/hls/`);

  if (video.rawS3Key) {
    await storageService.deleteFile(video.rawS3Key);
  }
  if (video.thumbnailId) {
    await storageService.deleteFile(video.thumbnailId);
  }
  if (video.hlsMasterKey) {
    await storageService.deleteFile(video.hlsMasterKey);
  }
  if (video.videoId && video.videoId !== video.hlsMasterKey) {
    await storageService.deleteFile(video.videoId);
  }

  await Video.findByIdAndDelete(videoId);
}

async function toggleLike(videoId, userId) {
  const video = await getVideoById(videoId);

  const userIdStr = userId.toString();
  const isLiked = video.likedBy.some(id => id.toString() === userIdStr);
  const isDisliked = video.dislikedBy.some(id => id.toString() === userIdStr);

  if (isLiked) {
    video.likedBy.pull(userId);
    video.likes--;
    await video.save();
    return { action: 'unliked', likes: video.likes };
  } else {
    if (isDisliked) {
      video.dislikedBy.pull(userId);
      video.dislikes--;
    }

    video.likedBy.push(userId);
    video.likes++;
    await video.save();
    return { action: 'liked', likes: video.likes };
  }
}

async function toggleDislike(videoId, userId) {
  const video = await getVideoById(videoId);

  const userIdStr = userId.toString();
  const isDisliked = video.dislikedBy.some(id => id.toString() === userIdStr);
  const isLiked = video.likedBy.some(id => id.toString() === userIdStr);

  if (isDisliked) {
    video.dislikedBy.pull(userId);
    video.dislikes--;
    await video.save();
    return { action: 'undisliked', dislikes: video.dislikes };
  } else {
    if (isLiked) {
      video.likedBy.pull(userId);
      video.likes--;
    }

    video.dislikedBy.push(userId);
    video.dislikes++;
    await video.save();
    return { action: 'disliked', dislikes: video.dislikes };
  }
}

export {
  createVideo,
  initiateVideoUpload,
  completeVideoUpload,
  getTranscodeStatus,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
};

export default {
  createVideo,
  initiateVideoUpload,
  completeVideoUpload,
  getTranscodeStatus,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
};
