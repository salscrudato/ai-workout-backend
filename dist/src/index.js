"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
const pino_1 = __importDefault(require("pino"));
// Initialize logger
const logger = (0, pino_1.default)({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    ...(process.env.NODE_ENV === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: { singleLine: true }
        }
    })
});
// Resource values tuned for mobile-first latency and cost control.
// Firebase Functions entry point - Fixed CORS and dependency issues
exports.api = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
    minInstances: 1, // Keep at least 1 instance warm
    concurrency: 32,
    cors: true
}, async (req, res) => {
    try {
        const app = await (0, app_1.createExpressApp)();
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
    }
    catch (error) {
        logger.error({ error }, 'Firebase Function error');
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});
// For local development
if (process.env.NODE_ENV === 'development') {
    Promise.resolve().then(() => __importStar(require('./config/env.js'))).then(({ env }) => {
        async function startLocalServer() {
            try {
                const app = await (0, app_1.createExpressApp)();
                const port = env.PORT || 3000;
                app.listen(port, () => {
                    logger.info(`🚀 Local development server running on port ${port}`);
                    logger.info(`📊 Performance monitoring enabled`);
                    logger.info(`🔧 Enhanced AI prompting active`);
                    logger.info(`📱 Mobile-optimized endpoints ready`);
                });
            }
            catch (error) {
                logger.error({ error }, 'Failed to start local server');
                process.exit(1);
            }
        }
        startLocalServer();
    });
}
//# sourceMappingURL=index.js.map