
/**
 * Channel Routes
 * Fastify routes with inline JSON Schema validation
 */

async function channelRoutes(fastify, options) {
    const { channelController, authenticate } = options;

    // Create channel route
    fastify.post('/', {
        preValidation: [authenticate],
        schema: {
            description: 'Create a new channel',
            tags: ['channel'],
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 50,
                        description: 'Unique channel name',
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        description: 'Channel description',
                    },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        channel: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                logoUrl: { type: 'string' },
                                subscribers: { type: 'number' },
                            }
                        }
                    }
                }
            }
        },
    }, channelController.createChannel);

    // Get my channel route
    fastify.get('/me', {
        preValidation: [authenticate],
        schema: {
            description: 'Get current user channel',
            tags: ['channel'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        channel: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                logoUrl: { type: 'string' },
                                subscribers: { type: 'number' },
                            }
                        }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, channelController.getMyChannel);

}

export default channelRoutes;
