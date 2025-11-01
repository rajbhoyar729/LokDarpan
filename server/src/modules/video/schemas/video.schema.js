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
    videoUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    thumbnailId: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String, required: true }],
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

