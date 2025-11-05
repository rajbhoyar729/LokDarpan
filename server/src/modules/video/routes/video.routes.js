/**
 * Video Routes
 * Fastify routes with inline JSON Schema validation
 */

async function videoRoutes(fastify, options) {
  const { videoController, authenticate } = options;

  // Initiate upload route
  fastify.post('/initiate-upload', {
    preHandler: [authenticate],
    schema: {
      description: 'Initiate video upload by creating a video document with metadata only',
      tags: ['video'],
      body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Video title',
          },
          description: {
            type: 'string',
            maxLength: 5000,
            description: 'Video description',
          },
        },
      },
      response: {
        201: {
          type: 'object',
          description: 'Created video object',
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
  }, videoController.initiateUpload);

  // Upload video route
  fastify.post('/upload', {
    preHandler: [authenticate],
    schema: {
      description: 'Upload a new video',
      tags: ['video'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['title', 'description', 'category'],
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Video title',
          },
          description: {
            type: 'string',
            maxLength: 5000,
            description: 'Video description',
          },
          category: {
            type: 'string',
            description: 'Video category',
          },
          tags: {
            type: 'string',
            description: 'Comma-separated tags',
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            videoId: { type: 'string' },
            video: { type: 'object' },
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
  }, videoController.uploadVideo);

  // Update video route
  fastify.put('/:videoId', {
    preHandler: [authenticate],
    schema: {
      description: 'Update video details',
      tags: ['video'],
      consumes: ['multipart/form-data'],
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
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
          },
          description: {
            type: 'string',
            maxLength: 5000,
          },
          category: {
            type: 'string',
          },
          tags: {
            type: 'string',
            description: 'Comma-separated tags',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            video: { type: 'object' },
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
  }, videoController.updateVideo);

  // Delete video route
  fastify.delete('/:videoId', {
    preHandler: [authenticate],
    schema: {
      description: 'Delete a video',
      tags: ['video'],
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
  }, videoController.deleteVideo);

  // Like video route
  fastify.put('/:videoId/like', {
    preHandler: [authenticate],
    schema: {
      description: 'Like or unlike a video',
      tags: ['video'],
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
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            likes: { type: 'number' },
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
  }, videoController.likeVideo);

  // Dislike video route
  fastify.put('/:videoId/dislike', {
    preHandler: [authenticate],
    schema: {
      description: 'Dislike or undislike a video',
      tags: ['video'],
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
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            dislikes: { type: 'number' },
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
  }, videoController.dislikeVideo);
}

export default videoRoutes;

