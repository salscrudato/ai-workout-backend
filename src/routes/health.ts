import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { getFirestore } from '../config/db';
import { openai } from '../libs/openai';
import { circuitBreakerRegistry } from '../utils/circuitBreaker';
import { measureExecutionTime } from '../utils/logger';
import pino from 'pino';

// Create logger wrapper that accepts any parameters
const baseLogger = pino({
  name: 'health-routes',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

const router = Router();

interface DependencyStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

interface HealthCheckResult {
  ok: boolean;
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  dependencies: Record<string, DependencyStatus>;
  circuitBreakers?: Record<string, any>;
  memory?: NodeJS.MemoryUsage;
}

/**
 * Check Firestore database connectivity
 */
async function checkFirestore(): Promise<DependencyStatus> {
  try {
    const startTime = Date.now();
    const db = getFirestore();

    // Simple connectivity test
    await db.collection('health-check').limit(1).get();

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check OpenAI API connectivity
 */
async function checkOpenAI(): Promise<DependencyStatus> {
  try {
    const startTime = Date.now();

    // Simple API test - list models
    await openai.models.list();

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      responseTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check system resources
 */
function checkSystemResources(): DependencyStatus {
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  if (memoryUsagePercent > 90) {
    status = 'unhealthy';
  } else if (memoryUsagePercent > 75) {
    status = 'degraded';
  }

  return {
    status,
    responseTime: 0,
    lastChecked: new Date().toISOString()
  };
}

// Basic health check
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development'
  });
}));

// Detailed health check with dependency monitoring
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const correlationId = req.correlationId || 'health-check';

  logger.info('Detailed health check requested', { correlationId });

  try {
    // Check all dependencies in parallel
    const [firestoreStatus, openaiStatus] = await Promise.allSettled([
      measureExecutionTime('health_check_firestore', checkFirestore),
      measureExecutionTime('health_check_openai', checkOpenAI)
    ]);

    const systemStatus = checkSystemResources();

    const dependencies: Record<string, DependencyStatus> = {
      firestore: firestoreStatus.status === 'fulfilled'
        ? firestoreStatus.value
        : { status: 'unhealthy', error: 'Health check failed', lastChecked: new Date().toISOString() },

      openai: openaiStatus.status === 'fulfilled'
        ? openaiStatus.value
        : { status: 'unhealthy', error: 'Health check failed', lastChecked: new Date().toISOString() },

      system: systemStatus
    };

    // Determine overall health
    const allHealthy = Object.values(dependencies).every(dep => dep.status === 'healthy');
    const anyUnhealthy = Object.values(dependencies).some(dep => dep.status === 'unhealthy');

    const result: HealthCheckResult = {
      ok: !anyUnhealthy,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      uptime: process.uptime(),
      dependencies,
      circuitBreakers: circuitBreakerRegistry.getAllStats(),
      memory: process.memoryUsage()
    };

    const responseTime = Date.now() - startTime;

    logger.info('Health check completed', {
      correlationId,
      responseTime,
      overallHealth: result.ok ? 'healthy' : 'unhealthy',
      dependencyCount: Object.keys(dependencies).length
    });

    // Set appropriate HTTP status
    const statusCode = anyUnhealthy ? 503 : (allHealthy ? 200 : 207);
    res.status(statusCode).json(result);

  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error('Health check failed', {
      correlationId,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(503).json({
      ok: false,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      error: 'Health check failed',
      uptime: process.uptime()
    });
  }
}));

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (_req: Request, res: Response) => {
  try {
    // Quick check of critical dependencies
    const db = getFirestore();
    await db.collection('health-check').limit(1).get();

    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', asyncHandler(async (_req: Request, res: Response) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
}));

export default router;
