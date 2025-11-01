/**
 * User Schema
 */

import mongoose from 'mongoose';
import { COLLECTIONS } from '../../../config/collections.js';

const userSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    channelName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    logoUrl: { type: String, required: true },
    logoId: { type: String, required: true },
    subscribers: { type: Number, default: 0 },
    subscribedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER }],
  },
  { timestamps: true }
);

// Prevent re-compiling model if it already exists
const User = mongoose.models[COLLECTIONS.USER] || mongoose.model(COLLECTIONS.USER, userSchema);

export default User;

