import { Request } from 'express';
import pino from 'pino';

// Security monitoring logger
const securityLogger = pino({
  name: 'security-monitor',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});

/**
 * Security monitoring and threat detection utilities
 */

// Rate limiting tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const suspiciousIPs = new Set<string>();

// Security thresholds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;
const SUSPICIOUS_REQUEST_THRESHOLD = 200;
// const BLOCKED_IP_TTL = 15 * 60 * 1000; // 15 minutes - Available for future use

/**
 * Check if an IP address is rate limited
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  record.count++;

  // Check if exceeded rate limit
  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    // Mark as suspicious if significantly over limit
    if (record.count > SUSPICIOUS_REQUEST_THRESHOLD) {
      suspiciousIPs.add(ip);
      securityLogger.warn('Suspicious activity detected', {
        ip,
        requestCount: record.count,
        timeWindow: RATE_LIMIT_WINDOW,
      } as any);
    }
    return true;
  }

  return false;
}

/**
 * Check if an IP is marked as suspicious
 */
export function isSuspiciousIP(ip: string): boolean {
  return suspiciousIPs.has(ip);
}

/**
 * Analyze request for security threats
 */
export function analyzeRequest(req: Request): SecurityAnalysis {
  const analysis: SecurityAnalysis = {
    threatLevel: 'low',
    threats: [],
    recommendations: [],
  };

  const ip = req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || '';
  const {path} = req;
  const {method} = req;

  // Check for suspicious patterns in URL
  if (containsSuspiciousPatterns(path)) {
    analysis.threatLevel = 'high';
    analysis.threats.push('Suspicious URL patterns detected');
    analysis.recommendations.push('Block request and monitor IP');
  }

  // Check for malicious user agents
  if (isMaliciousUserAgent(userAgent)) {
    analysis.threatLevel = 'medium';
    analysis.threats.push('Potentially malicious user agent');
    analysis.recommendations.push('Monitor requests from this user agent');
  }

  // Check for SQL injection attempts in query parameters
  const queryString = req.url?.split('?')[1] || '';
  if (containsSQLInjection(queryString)) {
    analysis.threatLevel = 'high';
    analysis.threats.push('SQL injection attempt detected');
    analysis.recommendations.push('Block request immediately');
  }

  // Check for XSS attempts in headers
  const referer = req.get('Referer') || '';
  if (containsXSS(referer)) {
    analysis.threatLevel = 'high';
    analysis.threats.push('XSS attempt in referer header');
    analysis.recommendations.push('Block request and sanitize headers');
  }

  // Log high-threat requests
  if (analysis.threatLevel === 'high') {
    securityLogger.error('High-threat request detected', {
      ip,
      userAgent,
      path,
      method,
      threats: analysis.threats,
      timestamp: new Date().toISOString(),
    } as any);
  }

  return analysis;
}

/**
 * Security analysis result interface
 */
export interface SecurityAnalysis {
  threatLevel: 'low' | 'medium' | 'high';
  threats: string[];
  recommendations: string[];
}

/**
 * Check for suspicious URL patterns
 */
function containsSuspiciousPatterns(path: string): boolean {
  const suspiciousPatterns = [
    /\.\./,                    // Directory traversal
    /\/etc\/passwd/,           // System file access
    /\/proc\//,                // Process information
    /\/admin/i,                // Admin panel access
    /\/wp-admin/i,             // WordPress admin
    /\/phpmyadmin/i,           // Database admin
    /\/config\./,              // Config file access
    /\/\.env/,                 // Environment file access
    /\/backup/i,               // Backup file access
    /\/dump/i,                 // Database dump access
  ];

  return suspiciousPatterns.some(pattern => pattern.test(path));
}

/**
 * Check for malicious user agents
 */
function isMaliciousUserAgent(userAgent: string): boolean {
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /crawler/i,
    /bot/i,
    /spider/i,
    /scraper/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Check for SQL injection patterns
 */
function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /('|(\\x27)|(\\x2D\\x2D))/,
    /(\b(OR|AND)\b.*=.*)/i,
    /(UNION.*SELECT)/i,
    /(EXEC.*xp_)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Clean up expired entries periodically
 */
export function cleanupSecurityData(): void {
  const now = Date.now();

  // Clean up rate limit records
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }

  // Clean up suspicious IPs (they get a longer timeout)
  // In a real implementation, you might want to persist this data
  if (requestCounts.size === 0) {
    suspiciousIPs.clear();
  }
}

// Set up periodic cleanup
setInterval(cleanupSecurityData, 5 * 60 * 1000); // Every 5 minutes

/**
 * Get security statistics
 */
export function getSecurityStats(): SecurityStats {
  return {
    activeRateLimits: requestCounts.size,
    suspiciousIPs: suspiciousIPs.size,
    timestamp: new Date().toISOString(),
  };
}

export interface SecurityStats {
  activeRateLimits: number;
  suspiciousIPs: number;
  timestamp: string;
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware() {
  return (req: Request, res: any, next: any) => {
    const ip = req.ip || 'unknown';

    // Check rate limiting
    if (isRateLimited(ip)) {
      securityLogger.warn('Rate limit exceeded', { ip, path: req.path } as any);
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
      });
    }

    // Check if IP is suspicious
    if (isSuspiciousIP(ip)) {
      securityLogger.warn('Request from suspicious IP', { ip, path: req.path } as any);
      return res.status(403).json({
        error: 'Access denied',
        code: 'SUSPICIOUS_ACTIVITY',
      });
    }

    // Analyze request for threats
    const analysis = analyzeRequest(req);
    if (analysis.threatLevel === 'high') {
      return res.status(403).json({
        error: 'Request blocked due to security concerns',
        code: 'SECURITY_THREAT_DETECTED',
      });
    }

    next();
  };
}
