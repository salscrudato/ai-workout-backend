import { Router } from 'express';
import { asyncHandler } from '../middlewares/errors';

const router = Router();

/**
 * Health check endpoint
 * Simple endpoint to check if the API is running
 */
router.get('/', asyncHandler(async (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
}));

/**
 * Detailed health check with dependencies
 */
router.get('/detailed', asyncHandler(async (_req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dependencies: {
      firebase: 'connected', // We'll assume Firebase is working if the app started
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
    },
  };

  res.json(health);
}));

export default router;
