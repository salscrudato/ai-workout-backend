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
async function main() {
    await initializeFirebase();
    const app = express();
    const logger = pino({ transport: { target: 'pino-pretty', options: { singleLine: true } } });
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors());
    app.use(helmet());
    app.use(compression());
    app.use(pinoHttp({ logger }));
    app.use(maybeApiKey);
    // Health check endpoint
    app.get('/health', (_req, res) => res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.NODE_ENV
    }));
    // Rate limiting for AI generation endpoint
    app.use('/v1/workouts/generate', rateLimit({
        windowMs: 60_000, // 1 minute
        max: 6, // 6 requests per minute
        message: { error: 'Too many workout generation requests, please try again later' },
        standardHeaders: true,
        legacyHeaders: false
    }));
    // API routes
    app.use('/v1', v1);
    // 404 handler for unmatched routes
    app.use((_req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    // Global error handler (must be last)
    app.use(errorHandler);
    app.listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));
}
main().catch(err => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map