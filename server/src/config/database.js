/**
 * Database Configuration and Connection
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ Database connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
    throw error;
  }
}

export { connectDatabase, disconnectDatabase };
export default connectDatabase;

