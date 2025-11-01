/**
 * User Service
 * Handles user-related business logic (subscriptions, profile)
 */

import User from '../schemas/user.schema.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
import { isValidObjectId } from '../../../utils/db.js';

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(userId) {
  if (!isValidObjectId(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

/**
 * Subscribe to a channel
 * @param {string} subscriberId - User ID of subscriber
 * @param {string} channelId - Channel ID to subscribe to
 * @returns {Promise<void>}
 */
async function subscribeToChannel(subscriberId, channelId) {
  if (!isValidObjectId(subscriberId) || !isValidObjectId(channelId)) {
    throw new ValidationError('Invalid user or channel ID');
  }

  if (subscriberId === channelId) {
    throw new ValidationError('Cannot subscribe to your own channel');
  }

  // Get both users
  const subscriber = await User.findById(subscriberId);
  const channel = await User.findById(channelId);

  if (!subscriber) {
    throw new NotFoundError('Subscriber');
  }

  if (!channel) {
    throw new NotFoundError('Channel');
  }

  // Check if already subscribed
  if (subscriber.subscribedChannels.includes(channelId)) {
    throw new ValidationError('Already subscribed to this channel');
  }

  // Add channel to subscriber's list
  subscriber.subscribedChannels.push(channelId);
  await subscriber.save();

  // Increment channel's subscriber count
  channel.subscribers++;
  await channel.save();
}

/**
 * Unsubscribe from a channel
 * @param {string} subscriberId - User ID of subscriber
 * @param {string} channelId - Channel ID to unsubscribe from
 * @returns {Promise<void>}
 */
async function unsubscribeFromChannel(subscriberId, channelId) {
  if (!isValidObjectId(subscriberId) || !isValidObjectId(channelId)) {
    throw new ValidationError('Invalid user or channel ID');
  }

  // Get both users
  const subscriber = await User.findById(subscriberId);
  const channel = await User.findById(channelId);

  if (!subscriber) {
    throw new NotFoundError('Subscriber');
  }

  if (!channel) {
    throw new NotFoundError('Channel');
  }

  // Check if subscribed
  if (!subscriber.subscribedChannels.includes(channelId)) {
    throw new ValidationError('Not subscribed to this channel');
  }

  // Remove channel from subscriber's list
  subscriber.subscribedChannels.pull(channelId);
  await subscriber.save();

  // Decrement channel's subscriber count
  if (channel.subscribers > 0) {
    channel.subscribers--;
    await channel.save();
  }
}

export {
  getUserById,
  subscribeToChannel,
  unsubscribeFromChannel,
};

export default {
  getUserById,
  subscribeToChannel,
  unsubscribeFromChannel,
};

