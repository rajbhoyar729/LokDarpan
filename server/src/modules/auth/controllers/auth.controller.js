/**
 * Authentication Controller
 * Handles HTTP request/response for authentication endpoints
 */

import authService from '../services/auth.service.js';
import storageService from '../../../services/storage.service.js';
import { validateImageFile } from '../../../utils/upload.js';

/**
 * Handle user signup
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function signup(request, reply) {
  // Parse multipart form data
  const parts = request.parts();
  const data = {};
  let logoFile = null;

  for await (const part of parts) {
    if (part.file) {
      // It's a file
      if (part.fieldname === 'logo') {
        logoFile = part;
      }
    } else {
      // It's a field
      data[part.fieldname] = part.value;
    }
  }

  const { channelName, email, phone, password } = data;

  if (!logoFile) {
    return reply.status(400).send({
      error: {
        message: 'Logo file is required',
      },
    });
  }

  // Validate logo file
  validateImageFile(logoFile);

  // Upload logo to S3
  const logoUpload = await storageService.uploadLogo(logoFile);

  // Create user
  const user = await authService.createUser({
    channelName,
    email,
    phone,
    password,
    logoUrl: logoUpload.url,
    logoId: logoUpload.key,
  });

  return reply.status(201).send({
    message: 'User created successfully',
    user,
  });
}

/**
 * Handle user login
 * @param {FastifyRequest} request - Fastify request
 * @param {FastifyReply} reply - Fastify reply
 */
async function login(request, reply) {
  const { email, password } = request.body;

  const { user, token } = await authService.login(email, password);

  return reply.status(200).send({
    message: 'Login successful',
    user,
    token,
  });
}

export {
  signup,
  login,
};

export default {
  signup,
  login,
};

