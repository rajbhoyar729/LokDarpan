/**
 * Video Schema
 */

import mongoose from 'mongoose';
import { COLLECTIONS } from '../../../config/collections.js';

const videoSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    description: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER, required: true },
    status: {
      type: String,
      enum: ['PENDING_METADATA', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING_METADATA',
    },
    videoUrl: { type: String, required: false },
    videoId: { type: String, required: false },
    thumbnailUrl: { type: String, required: false },
    thumbnailId: { type: String, required: false },
    category: { type: String, required: false },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.COMMENT }],
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER }],
  },
  { timestamps: true }
);

// Prevent re-compiling model if it already exists
const Video = mongoose.models[COLLECTIONS.VIDEO] || mongoose.model(COLLECTIONS.VIDEO, videoSchema);

export default Video;

