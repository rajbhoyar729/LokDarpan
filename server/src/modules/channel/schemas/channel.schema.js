
/**
 * Channel Schema
 */

import mongoose from 'mongoose';
import { COLLECTIONS } from '../../../config/collections.js';

const channelSchema = new mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true, unique: true },
        description: { type: String },
        logoUrl: { type: String, required: true },
        logoId: { type: String, required: true }, // S3/Storage ID
        owner: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER, required: true, unique: true },
        subscribers: { type: Number, default: 0 },
        subscribersList: [{ type: mongoose.Schema.Types.ObjectId, ref: COLLECTIONS.USER }],
    },
    { timestamps: true }
);

// Prevent re-compiling model if it already exists
const Channel = mongoose.models[COLLECTIONS.CHANNEL] || mongoose.model(COLLECTIONS.CHANNEL, channelSchema);

export default Channel;
