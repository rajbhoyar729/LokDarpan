/**
 * Server Entry Point
 * Initializes database connection and starts the Fastify server
 */
import buildApp from './src/app.js';
import connectDatabase, { disconnectDatabase } from './src/config/database.js';
import { APP_CONFIG } from './src/config/app.js';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Start the server
 */
async function start() {
  try {
    // Connect to database
    await connectDatabase();

    // Build Fastify app
    const app = await buildApp();

    // Start server
    const address = await app.listen({
      port: APP_CONFIG.port,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server is running on ${address}`);
    console.log(`📝 API prefix: ${APP_CONFIG.apiPrefix}`);
    console.log(`🌍 Environment: ${APP_CONFIG.env}`);

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      try {
        await app.close();
        await disconnectDatabase();
        console.log('✅ Server closed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
start();
