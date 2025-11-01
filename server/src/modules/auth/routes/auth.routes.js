/**
 * Authentication Routes
 * Fastify routes with inline JSON Schema validation
 */

async function authRoutes(fastify, options) {
  const { authController } = options;

  // Signup route
  fastify.post('/signup', {
    schema: {
      description: 'Create a new user account',
      tags: ['auth'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['channelName', 'email', 'phone', 'password'],
        properties: {
          channelName: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            description: 'Unique channel name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          phone: {
            type: 'string',
            minLength: 10,
            maxLength: 15,
            description: 'User phone number',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password (minimum 6 characters)',
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                channelName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                logoUrl: { type: 'string' },
                logoId: { type: 'string' },
                subscribers: { type: 'number' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, authController.signup);

  // Login route
  fastify.post('/login', {
    schema: {
      description: 'Authenticate user and get JWT token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                channelName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                logoId: { type: 'string' },
                logoUrl: { type: 'string' },
                subscribers: { type: 'number' },
              },
            },
            token: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, authController.login);
}

export default authRoutes;

