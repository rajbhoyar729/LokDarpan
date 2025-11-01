/**
 * Comment Schema
 */

import mongoose from 'mongoose';
import { COLLECTIONS } from '../../../config/collections.js';

const commentSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER, required: true },
    video_id: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.VIDEO, required: true },
    comment_text: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent re-compiling model if it already exists
const Comment = mongoose.models[COLLECTIONS.COMMENT] || mongoose.model(COLLECTIONS.COMMENT, commentSchema);

export default Comment;

