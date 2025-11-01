/**
 * Database Utilities
 */

import { COLLECTIONS } from '../config/collections.js';
import mongoose from 'mongoose';

/**
 * Get collection name from config
 * @param {string} collectionKey - Key from COLLECTIONS config
 * @returns {string} Collection name
 */
export function getCollectionName(collectionKey) {
  return COLLECTIONS[collectionKey] || collectionKey;
}

/**
 * Get model by collection name
 * @param {string} collectionName - Name of the collection
 * @returns {mongoose.Model}
 */
export function getModel(collectionName) {
  return mongoose.model(collectionName);
}

/**
 * Check if ObjectId is valid
 * @param {string} id - ObjectId string
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Create new ObjectId
 * @returns {mongoose.Types.ObjectId}
 */
export function createObjectId() {
  return new mongoose.Types.ObjectId();
}

export default {
  getCollectionName,
  getModel,
  isValidObjectId,
  createObjectId,
};

