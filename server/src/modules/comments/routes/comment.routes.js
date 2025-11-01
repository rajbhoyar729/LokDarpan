/**
 * Comment Routes
 * Fastify routes with inline JSON Schema validation
 */

async function commentRoutes(fastify, options) {
  const { commentController, authenticate } = options;

  // Create comment route
  fastify.post('/:videoId/comments', {
    preHandler: [authenticate],
    schema: {
      description: 'Add a comment to a video',
      tags: ['comments'],
      params: {
        type: 'object',
        required: ['videoId'],
        properties: {
          videoId: {
            type: 'string',
            description: 'Video ID',
          },
        },
      },
      body: {
        type: 'object',
        required: ['comment_text'],
        properties: {
          comment_text: {
            type: 'string',
            minLength: 1,
            maxLength: 1000,
            description: 'Comment text',
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            comment: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                user_id: { type: 'string' },
                video_id: { type: 'string' },
                comment_text: { type: 'string' },
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
        404: {
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
  }, commentController.createComment);

  // Update comment route
  fastify.put('/:commentId', {
    preHandler: [authenticate],
    schema: {
      description: 'Update a comment',
      tags: ['comments'],
      params: {
        type: 'object',
        required: ['commentId'],
        properties: {
          commentId: {
            type: 'string',
            description: 'Comment ID',
          },
        },
      },
      body: {
        type: 'object',
        required: ['comment_text'],
        properties: {
          comment_text: {
            type: 'string',
            minLength: 1,
            maxLength: 1000,
            description: 'Updated comment text',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            comment: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                user_id: { type: 'string' },
                video_id: { type: 'string' },
                comment_text: { type: 'string' },
              },
            },
          },
        },
        403: {
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
        404: {
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
  }, commentController.updateComment);

  // Delete comment route
  fastify.delete('/:commentId', {
    preHandler: [authenticate],
    schema: {
      description: 'Delete a comment',
      tags: ['comments'],
      params: {
        type: 'object',
        required: ['commentId'],
        properties: {
          commentId: {
            type: 'string',
            description: 'Comment ID',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        403: {
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
        404: {
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
  }, commentController.deleteComment);
}

export default commentRoutes;

