import pino from 'pino';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

const logger = pino({
  name: 'input-validation',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Security threat levels
 */
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Security violation types
 */
export enum ViolationType {
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION = 'SQL_INJECTION',
  COMMAND_INJECTION = 'COMMAND_INJECTION',
  PATH_TRAVERSAL = 'PATH_TRAVERSAL',
  SCRIPT_INJECTION = 'SCRIPT_INJECTION',
  HTML_INJECTION = 'HTML_INJECTION',
  MALICIOUS_PAYLOAD = 'MALICIOUS_PAYLOAD',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN'
}

/**
 * Security violation details
 */
export interface SecurityViolation {
  type: ViolationType;
  threatLevel: ThreatLevel;
  field: string;
  originalValue: string;
  sanitizedValue: string;
  pattern: string;
  description: string;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedData: any;
  violations: SecurityViolation[];
  riskScore: number;
}

/**
 * Lightweight input validation and sanitization service
 * Optimized for performance - only handles critical security threats
 * Zod validation in controllers handles data structure validation
 */
export class InputValidationService {
  // Reduced to only critical security patterns to minimize performance impact
  private static readonly CRITICAL_PATTERNS = [
    // XSS patterns - only the most dangerous
    {
      pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      type: ViolationType.XSS_ATTEMPT,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'Script tag detected'
    },
    {
      pattern: /javascript:/gi,
      type: ViolationType.XSS_ATTEMPT,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'JavaScript protocol detected'
    },

    // SQL Injection patterns - only critical commands
    {
      pattern: /(\b(DROP|DELETE|TRUNCATE|ALTER|EXEC)\b)/gi,
      type: ViolationType.SQL_INJECTION,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'Dangerous SQL command detected'
    },

    // Command injection patterns - only critical
    {
      pattern: /(\||&|;|`|\$\()/g,
      type: ViolationType.COMMAND_INJECTION,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'Command injection attempt detected'
    }
  ];

  /**
   * Lightweight validation for critical security threats only
   * Controllers handle comprehensive validation with Zod schemas
   */
  static validateCriticalSecurity(
    data: any,
    context?: { userAgent?: string; ipAddress?: string }
  ): ValidationResult {
    const violations: SecurityViolation[] = [];

    // Only check for critical security patterns - no deep cloning for performance
    this.scanForCriticalThreats(data, '', violations, context);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(violations);

    // Only block if critical violations found
    const isValid = violations.filter(v => v.threatLevel === ThreatLevel.CRITICAL).length === 0;

    // Log only critical violations to reduce noise
    if (violations.length > 0) {
      logger.warn({
        violationCount: violations.length,
        riskScore,
        violations: violations.map(v => ({
          type: v.type,
          threatLevel: v.threatLevel,
          field: v.field,
          description: v.description
        }))
      }, 'Critical security violations detected');
    }

    return {
      isValid,
      sanitizedData: data, // Return original data - sanitization handled by Zod transforms
      violations,
      riskScore
    };
  }

  /**
   * Check string for critical security threats only
   */
  static checkCriticalThreats(value: string, field: string = 'unknown'): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Only check for critical patterns to minimize performance impact
    for (const patternInfo of this.CRITICAL_PATTERNS) {
      if (patternInfo.pattern.test(value)) {
        violations.push({
          type: patternInfo.type,
          threatLevel: patternInfo.threatLevel,
          field,
          originalValue: value,
          sanitizedValue: value, // No sanitization here - handled by Zod transforms
          pattern: patternInfo.pattern.toString(),
          description: patternInfo.description,
          timestamp: Date.now()
        });
      }
    }

    return violations;
  }

  /**
   * Validate email with basic security checks
   */
  static validateEmail(email: string): {
    isValid: boolean;
    sanitized: string;
    violations: SecurityViolation[];
  } {
    const violations: SecurityViolation[] = [];
    let sanitized = email.trim().toLowerCase();

    // Basic email validation
    const isValid = validator.isEmail(sanitized);

    // Check for critical patterns only
    violations.push(...this.checkCriticalThreats(sanitized, 'email'));

    // Basic email normalization
    sanitized = validator.normalizeEmail(sanitized) || sanitized;

    return { isValid, sanitized, violations };
  }

  private static scanForCriticalThreats(
    obj: any,
    path: string,
    violations: SecurityViolation[],
    context?: { userAgent?: string; ipAddress?: string }
  ): void {
    if (typeof obj === 'string') {
      const threatViolations = this.checkCriticalThreats(obj, path);
      violations.push(...threatViolations.map(v => ({
        ...v,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress
      })));
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.scanForCriticalThreats(item, `${path}[${index}]`, violations, context);
      });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        this.scanForCriticalThreats(obj[key], newPath, violations, context);
      });
    }
  }

  private static calculateRiskScore(violations: SecurityViolation[]): number {
    let score = 0;
    
    for (const violation of violations) {
      switch (violation.threatLevel) {
        case ThreatLevel.CRITICAL:
          score += 100;
          break;
        case ThreatLevel.HIGH:
          score += 50;
          break;
        case ThreatLevel.MEDIUM:
          score += 25;
          break;
        case ThreatLevel.LOW:
          score += 10;
          break;
      }
    }

    return Math.min(score, 1000); // Cap at 1000
  }
}

/**
 * Lightweight Express middleware for critical security validation only
 * Controllers handle comprehensive validation with Zod schemas
 * Use this only for high-risk endpoints or when Zod validation is not sufficient
 */
export function criticalSecurityMiddleware() {
  return (req: any, res: any, next: any) => {
    const context = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Only check for critical security threats in request body
    if (req.body && Object.keys(req.body).length > 0) {
      const result = InputValidationService.validateCriticalSecurity(req.body, context);

      // Block only critical violations
      if (result.violations.some(v => v.threatLevel === ThreatLevel.CRITICAL)) {
        logger.error({
          violations: result.violations,
          riskScore: result.riskScore,
          userAgent: context.userAgent,
          ipAddress: context.ipAddress
        }, 'Request blocked due to critical security violations');

        return res.status(400).json({
          error: 'Request blocked due to security violations',
          code: 'SECURITY_VIOLATION'
        });
      }

      // Attach security info for monitoring (optional)
      req.securityViolations = result.violations;
      req.riskScore = result.riskScore;
    }

    next();
  };
}

// Legacy middleware for backward compatibility - DEPRECATED
// Use criticalSecurityMiddleware instead for better performance
export const inputValidationMiddleware = criticalSecurityMiddleware;
