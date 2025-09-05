import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { initializeFirebase } from './config/db';
import { maybeApiKey } from './middlewares/auth';
import { errorHandler } from './middlewares/errors';
import v1 from './routes/v1';
import healthRoutes from './routes/health';
import analyticsRoutes from './routes/analytics';
import { performanceOptimizer } from './services/performanceOptimizer';

let appInstance: express.Application | null = null;

export async function createExpressApp(): Promise<express.Application> {
  if (appInstance) {
    return appInstance;
  }

  await initializeFirebase();

  const app = express();
  const loggerOptions: any = { level: 'info' };
  if (process.env.NODE_ENV === 'development') {
    loggerOptions.transport = { target: 'pino-pretty', options: { singleLine: true } };
  }
  const logger = pino(loggerOptions);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // For Firebase Functions, allow all origins (Firebase handles security)
      if (process.env.GCLOUD_PROJECT) {
        return callback(null, true);
      }

      // In development, allow localhost
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }

      // Allow Firebase hosting domains
      const allowedOrigins = [
        'https://ai-workout-backend-2024.web.app',
        'https://ai-workout-backend-2024.firebaseapp.com'
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: false, // Set to false for better CORS compatibility
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // For legacy browser support
  }));
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Allow OAuth popups
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:", "http://localhost:*"], // Allow localhost connections
        frameSrc: ["'self'", "https:"], // Allow frames for OAuth
      },
    },
  }));
  app.use(compression());
  app.use(pinoHttp({ logger }));
  app.use(maybeApiKey);

  // Performance monitoring middleware
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      performanceOptimizer.recordRequest(responseTime, isError);
    });

    next();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV || 'production'
  }));

  // Enhanced rate limiting configuration

  // General API rate limiting
  app.use('/v1', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  }));

  // Stricter rate limiting for AI generation endpoint
  app.use('/v1/workouts/generate', rateLimit({
    windowMs: 60_000, // 1 minute
    max: 6, // 6 requests per minute per IP
    message: {
      error: 'Too many workout generation requests, please try again later',
      code: 'WORKOUT_GENERATION_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if available, otherwise fall back to IP
      return req.user?.uid || req.ip || 'unknown';
    }
  }));

  // Rate limiting for authentication endpoints
  app.use('/v1/auth', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts per 15 minutes
    message: {
      error: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
  }));

  // Health check routes (no rate limiting)
  app.use('/health', healthRoutes);

  // Analytics routes (internal use)
  app.use('/analytics', analyticsRoutes);

  // API routes
  app.use('/v1', v1);

  // 404 handler for unmatched routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  appInstance = app;
  return app;
}
