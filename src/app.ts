import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { initializeFirebase } from './config/db';
import { maybeApiKey } from './middlewares/auth';
import { errorHandler, errorLoggingMiddleware } from './middlewares/errors';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware,
  logger,
} from './utils/logger';
import { createSecurityMiddleware } from './utils/security';
import v1 from './routes/v1';
import healthRoutes from './routes/health';
import analyticsRoutes from './routes/analytics';

let appInstance: express.Application | null = null;

/**
 * Creates and configures the Express application instance
 * Implements singleton pattern for performance optimization
 *
 * @returns Configured Express application
 */
export async function createExpressApp(): Promise<express.Application> {
  // Return cached instance for performance
  if (appInstance) {
    return appInstance;
  }

  // Initialize Firebase connection
  await initializeFirebase();

  const app = express();

  // Performance optimizations
  app.set('trust proxy', 1); // Trust first proxy for accurate client IPs
  app.set('x-powered-by', false); // Remove X-Powered-By header

  // Core middleware stack (order matters for performance)
  app.use(correlationIdMiddleware);
  app.use(requestLoggingMiddleware);

  // Body parsing with optimized limits
  app.use(express.json({
    limit: '1mb',
    strict: true,
    type: 'application/json'
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 100
  }));
  // CORS configuration - optimized for performance
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // For Firebase Functions, allow all origins (Firebase handles security)
      if (process.env['GCLOUD_PROJECT']) {
        return callback(null, true);
      }

      // In development, allow localhost
      if (process.env['NODE_ENV'] === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }

      // Allowed origins - cached for performance
      const allowedOrigins = [
        'https://ai-workout-backend-2024.web.app',
        'https://ai-workout-backend-2024.firebaseapp.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000',
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'Cache-Control'],
    optionsSuccessStatus: 200,
    maxAge: 86400, // Cache preflight for 24 hours
  };

  app.use(cors(corsOptions));
  // Security headers - optimized configuration
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'data:'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'", 'https:', 'http://localhost:*'],
        frameSrc: ["'self'", 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Compression middleware - optimized for API responses
  app.use(compression({
    level: 6, // Balance between compression ratio and CPU usage
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression filter
      return compression.filter(req, res);
    },
  }));

  // Security middleware - enhanced threat detection
  app.use(createSecurityMiddleware());

  // API key middleware
  app.use(maybeApiKey);

  // Optimized health check endpoint
  app.get('/health', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: env.NODE_ENV || 'production',
      uptime: process.uptime(),
    });
  });

  // Rate limiting configuration - optimized for performance
  const createRateLimit = (windowMs: number, max: number, message: string, code: string) =>
    rateLimit({
      windowMs,
      max,
      message: { error: message, code },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    });

  // General API rate limiting
  app.use('/v1', createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP, please try again later',
    'RATE_LIMIT_EXCEEDED'
  ));

  // Stricter rate limiting for AI generation endpoint
  app.use('/v1/workouts/generate', rateLimit({
    windowMs: 60_000, // 1 minute
    max: 6, // 6 requests per minute per IP
    message: {
      error: 'Too many workout generation requests, please try again later',
      code: 'WORKOUT_GENERATION_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if available for better rate limiting
      return req.user?.uid || req.ip || 'unknown';
    },
  }));

  // Authentication rate limiting
  app.use('/v1/auth', createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 auth attempts per window
    'Too many authentication attempts, please try again later',
    'AUTH_RATE_LIMIT'
  ));

  // Route registration - order matters for performance
  app.use('/health', healthRoutes);

  // Conditional analytics routes (internal use only)
  if (env.INTERNAL_API_KEY) {
    app.use('/analytics', analyticsRoutes);
  }

  // Main API routes
  app.use('/v1', v1);

  // 404 handler for unmatched routes - optimized response
  app.use((_req, res) => {
    res.status(404).json({
      error: 'Route not found',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling middleware stack (order is critical)
  app.use(errorLoggingMiddleware);
  app.use(errorHandler);

  // Cache the app instance for performance
  appInstance = app;

  logger.info({
    environment: env.NODE_ENV,
    analyticsEnabled: Boolean(env.INTERNAL_API_KEY),
  }, 'Express application configured successfully');

  return app;
}
