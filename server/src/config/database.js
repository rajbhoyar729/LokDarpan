/**
 * Database Configuration and Connection
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

if (!DB_NAME) {
  throw new Error('DB_NAME environment variable is not defined');
}

// Construct full connection URI with database name
// MONGO_URI should be like: mongodb://localhost:27017 or mongodb://user:pass@host:port
// DB_NAME will be appended to create: mongodb://localhost:27017/DB_NAME
const getConnectionUri = () => {
  // Remove trailing slash if present
  const baseUri = MONGO_URI.endsWith('/') ? MONGO_URI.slice(0, -1) : MONGO_URI;
  
  // Check if URI already contains a database name (has 4+ slashes after protocol)
  const uriParts = baseUri.split('/');
  if (uriParts.length > 3 && uriParts[3]) {
    // Already has database name, use as-is
    return baseUri;
  }
  
  // Append database name
  return `${baseUri}/${DB_NAME}`;
};

const CONNECTION_URI = getConnectionUri();

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  try {
    const conn = await mongoose.connect(CONNECTION_URI);
    console.log(`✅ Database connected: ${conn.connection.host}`);
    console.log(`📊 Database name: ${DB_NAME}`);
    
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

