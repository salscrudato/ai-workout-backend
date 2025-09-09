"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const tslib_1 = require("tslib");
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
const pino_1 = tslib_1.__importDefault(require("pino"));
const logger = (0, pino_1.default)({
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
    ...(process.env['NODE_ENV'] === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: { singleLine: true }
        }
    })
});
exports.api = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
    minInstances: 1,
    concurrency: 32,
    cors: true
}, async (req, res) => {
    try {
        const app = await (0, app_1.createExpressApp)();
        const startTime = Date.now();
        app(req, res);
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
if (process.env['NODE_ENV'] === 'development') {
    Promise.resolve().then(() => tslib_1.__importStar(require('./config/env.js'))).then(({ env }) => {
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