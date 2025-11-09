/**
 * Fastify Application Factory
 * Creates and configures Fastify instance with all plugins and routes
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';
import { APP_CONFIG } from './config/app.js';
import { JWT_CONFIG } from './config/jwt.js';
import { formatErrorResponse, handleValidationError } from './utils/errors.js';
import authController from './modules/auth/controllers/auth.controller.js';
import userController from './modules/user/controllers/user.controller.js';
import videoController from './modules/video/controllers/video.controller.js';
import commentController from './modules/comments/controllers/comment.controller.js';
import authenticate from './middleware/auth.middleware.js';
import authRoutes from './modules/auth/routes/auth.routes.js';
import userRoutes from './modules/user/routes/user.routes.js';
import videoRoutes from './modules/video/routes/video.routes.js';
import commentRoutes from './modules/comments/routes/comment.routes.js';

// Load environment variables
config();

/**
 * Build and configure Fastify application
 * @returns {Promise<FastifyInstance>}
 */
async function buildApp() {
  const app = Fastify({
    logger: APP_CONFIG.env === 'development',
  });

  // Register plugins
  await app.register(cors, {
    origin: true, // Allow all origins (configure as needed for production)
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // Adjust for production
  });

  await app.register(multipart, {
    limits: {
      fileSize: 500 * 1024 * 1024, // 500 MB max file size
    },
  });

  await app.register(jwt, {
    secret: JWT_CONFIG.secret,
  });

  // Register Swagger for API documentation
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'LokDarpan API',
        description: 'LokDarpan is a MERN stack-based video hosting and streaming platform API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${APP_CONFIG.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'user', description: 'User management endpoints' },
        { name: 'video', description: 'Video management endpoints' },
        { name: 'comments', description: 'Comment management endpoints' },
        { name: 'system', description: 'System endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Bearer token authentication. Format: Bearer <token>',
          },
        },
      },
    },
  });

  // Register Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    // Handle validation errors
    if (error.validation) {
      const errorResponse = handleValidationError(error);
      return reply.status(errorResponse.statusCode).send(errorResponse.error);
    }

    // Handle custom application errors
    if (error.statusCode) {
      const errorResponse = formatErrorResponse(error);
      return reply.status(errorResponse.statusCode).send(errorResponse.error);
    }

    // Handle unexpected errors
    console.error('Unhandled error:', error);
    const errorResponse = formatErrorResponse(error);
    return reply.status(errorResponse.statusCode).send(errorResponse.error);
  });

  // Global hooks for request logging (development)
  if (APP_CONFIG.env === 'development') {
    app.addHook('onRequest', async (request) => {
      console.log(`${request.method} ${request.url}`);
    });

    app.addHook('onResponse', async (request, reply) => {
      console.log(`${request.method} ${request.url} - ${reply.statusCode}`);
    });
  }

  // Health check route
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['system'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register module routes with options
  await app.register(authRoutes, {
    prefix: `${APP_CONFIG.apiPrefix}/auth`,
    authController,
  });

  await app.register(userRoutes, {
    prefix: `${APP_CONFIG.apiPrefix}/user`,
    userController,
    authenticate,
  });

  await app.register(videoRoutes, {
    prefix: `${APP_CONFIG.apiPrefix}/video`,
    videoController,
    authenticate,
  });

  await app.register(commentRoutes, {
    prefix: `${APP_CONFIG.apiPrefix}/comment`,
    commentController,
    authenticate,
  });

  return app;
}

export default buildApp;

