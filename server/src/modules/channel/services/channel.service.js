
/**
 * Channel Service
 * Handles channel business logic
 */

import Channel from '../schemas/channel.schema.js';
import User from '../../auth/schemas/user.schema.js';
import { createObjectId } from '../../../utils/db.js';
import { ValidationError, NotFoundError } from '../../../utils/errors.js';

/**
 * Check if channel name exists
 * @param {string} name - Channel name
 * @returns {Promise<boolean>}
 */
async function channelNameExists(name) {
    const channel = await Channel.findOne({ name });
    return !!channel;
}

/**
 * Get channel by owner ID
 * @param {string} ownerId - User ID
 * @returns {Promise<Object>} Channel object
 */
async function getChannelByOwner(ownerId) {
    return Channel.findOne({ owner: ownerId });
}

/**
 * Create a new channel
 * @param {Object} channelData - Channel data
 * @param {string} channelData.name - Channel name
 * @param {string} channelData.description - Channel description
 * @param {string} channelData.logoUrl - Logo URL
 * @param {string} channelData.logoId - Logo S3 key
 * @param {string} channelData.owner - Owner User ID
 * @returns {Promise<Object>} Created channel
 */
async function createChannel(channelData) {
    const { name, description, logoUrl, logoId, owner } = channelData;

    // Check if user already has a channel
    const existingChannel = await getChannelByOwner(owner);
    if (existingChannel) {
        throw new ValidationError('User already has a channel');
    }

    // Check if channel name already exists
    if (await channelNameExists(name)) {
        throw new ValidationError('Channel name already exists');
    }

    // Create channel
    const newChannel = new Channel({
        _id: createObjectId(),
        name,
        description,
        logoUrl,
        logoId,
        owner,
    });

    const savedChannel = await newChannel.save();

    // Update user with channel reference
    await User.findByIdAndUpdate(owner, { channel: savedChannel._id });

    return savedChannel.toObject();
}


export default {
    createChannel,
    getChannelByOwner,
    channelNameExists
};
