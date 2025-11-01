/**
 * Application Configuration
 */

export const APP_CONFIG = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  host: process.env.HOST || '0.0.0.0',
};

export default APP_CONFIG;

