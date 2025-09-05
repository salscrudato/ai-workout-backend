import { onRequest } from 'firebase-functions/v2/https';
import { createExpressApp } from './app';
import pino from 'pino';

// Initialize logger
const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { singleLine: true }
    }
  })
});

// Firebase Functions entry point
export const api = onRequest({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10,
  minInstances: 1, // Keep at least 1 instance warm
  concurrency: 80,
  cors: true
}, async (req, res) => {
  try {
    const app = await createExpressApp();

    // Add performance monitoring
    const startTime = Date.now();

    // Handle the request
    app(req, res);

    // Log performance metrics
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }, 'Request completed');
    });

  } catch (error) {
    logger.error({ error }, 'Firebase Function error');
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// For local development
if (process.env.NODE_ENV === 'development') {
  import('./config/env.js').then(({ env }) => {
    async function startLocalServer() {
      try {
        const app = await createExpressApp();
        const port = env.PORT || 3000;

        app.listen(port, () => {
          logger.info(`🚀 Local development server running on port ${port}`);
          logger.info(`📊 Performance monitoring enabled`);
          logger.info(`🔧 Enhanced AI prompting active`);
          logger.info(`📱 Mobile-optimized endpoints ready`);
        });
      } catch (error) {
        logger.error({ error }, 'Failed to start local server');
        process.exit(1);
      }
    }

    startLocalServer();
  });
}