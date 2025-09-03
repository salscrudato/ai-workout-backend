"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const auth_1 = require("./middlewares/auth");
const errors_1 = require("./middlewares/errors");
const v1_1 = __importDefault(require("./routes/v1"));
async function main() {
    await (0, db_1.initializeFirebase)();
    const app = (0, express_1.default)();
    const logger = (0, pino_1.default)({ transport: { target: 'pino-pretty', options: { singleLine: true } } });
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, pino_http_1.default)({ logger }));
    app.use(auth_1.maybeApiKey);
    // Health check endpoint
    app.get('/health', (_req, res) => res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env_1.env.NODE_ENV
    }));
    // Rate limiting for AI generation endpoint
    app.use('/v1/workouts/generate', (0, express_rate_limit_1.default)({
        windowMs: 60_000, // 1 minute
        max: 6, // 6 requests per minute
        message: { error: 'Too many workout generation requests, please try again later' },
        standardHeaders: true,
        legacyHeaders: false
    }));
    // API routes
    app.use('/v1', v1_1.default);
    // 404 handler for unmatched routes
    app.use((_req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    // Global error handler (must be last)
    app.use(errors_1.errorHandler);
    app.listen(env_1.env.PORT, () => logger.info(`API listening on :${env_1.env.PORT}`));
}
main().catch(err => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map