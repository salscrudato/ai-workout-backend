import pino from 'pino';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { z } from 'zod';

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
 * Advanced input validation and sanitization service
 */
export class InputValidationService {
  private static readonly MALICIOUS_PATTERNS = [
    // XSS patterns
    {
      pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      type: ViolationType.XSS_ATTEMPT,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'Script tag detected'
    },
    {
      pattern: /javascript:/gi,
      type: ViolationType.XSS_ATTEMPT,
      threatLevel: ThreatLevel.HIGH,
      description: 'JavaScript protocol detected'
    },
    {
      pattern: /on\w+\s*=/gi,
      type: ViolationType.XSS_ATTEMPT,
      threatLevel: ThreatLevel.HIGH,
      description: 'Event handler attribute detected'
    },
    
    // SQL Injection patterns
    {
      pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      type: ViolationType.SQL_INJECTION,
      threatLevel: ThreatLevel.CRITICAL,
      description: 'SQL command detected'
    },
    {
      pattern: /('|(\\')|(;)|(--)|(\|)|(\*)|(%)|(\+))/g,
      type: ViolationType.SQL_INJECTION,
      threatLevel: ThreatLevel.MEDIUM,
      description: 'SQL injection characters detected'
    },
    
    // Command injection patterns
    {
      pattern: /(\||&|;|`|\$\(|\${)/g,
      type: ViolationType.COMMAND_INJECTION,
      threatLevel: ThreatLevel.HIGH,
      description: 'Command injection characters detected'
    },
    
    // Path traversal patterns
    {
      pattern: /(\.\.\/|\.\.\\)/g,
      type: ViolationType.PATH_TRAVERSAL,
      threatLevel: ThreatLevel.HIGH,
      description: 'Path traversal attempt detected'
    },
    
    // HTML injection patterns
    {
      pattern: /<[^>]*>/g,
      type: ViolationType.HTML_INJECTION,
      threatLevel: ThreatLevel.MEDIUM,
      description: 'HTML tags detected'
    }
  ];

  private static readonly SUSPICIOUS_PATTERNS = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /location\./gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi
  ];

  /**
   * Validate and sanitize input data
   */
  static validateAndSanitize(
    data: any,
    schema?: z.ZodSchema,
    context?: { userAgent?: string; ipAddress?: string }
  ): ValidationResult {
    const violations: SecurityViolation[] = [];
    let riskScore = 0;

    // Deep clone to avoid mutating original data
    const sanitizedData = JSON.parse(JSON.stringify(data));

    // Recursively validate and sanitize
    this.processObject(sanitizedData, '', violations, context);

    // Calculate risk score
    riskScore = this.calculateRiskScore(violations);

    // Schema validation if provided
    let isValid = violations.filter(v => v.threatLevel === ThreatLevel.CRITICAL).length === 0;
    
    if (schema && isValid) {
      try {
        schema.parse(sanitizedData);
      } catch (error) {
        isValid = false;
        logger.warn({
          error: error instanceof Error ? error.message : 'Unknown error',
          data: sanitizedData
        }, 'Schema validation failed');
      }
    }

    // Log security violations
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
      }, 'Security violations detected');
    }

    return {
      isValid,
      sanitizedData,
      violations,
      riskScore
    };
  }

  /**
   * Sanitize a single string value
   */
  static sanitizeString(value: string, field: string = 'unknown'): {
    sanitized: string;
    violations: SecurityViolation[];
  } {
    const violations: SecurityViolation[] = [];
    let sanitized = value;

    // Check for malicious patterns
    for (const patternInfo of this.MALICIOUS_PATTERNS) {
      if (patternInfo.pattern.test(value)) {
        violations.push({
          type: patternInfo.type,
          threatLevel: patternInfo.threatLevel,
          field,
          originalValue: value,
          sanitizedValue: sanitized,
          pattern: patternInfo.pattern.toString(),
          description: patternInfo.description,
          timestamp: Date.now()
        });
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        violations.push({
          type: ViolationType.SUSPICIOUS_PATTERN,
          threatLevel: ThreatLevel.MEDIUM,
          field,
          originalValue: value,
          sanitizedValue: sanitized,
          pattern: pattern.toString(),
          description: 'Suspicious JavaScript pattern detected',
          timestamp: Date.now()
        });
      }
    }

    // Apply DOMPurify sanitization
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Additional sanitization
    sanitized = validator.escape(sanitized); // Escape HTML entities
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters

    return { sanitized, violations };
  }

  /**
   * Validate email with enhanced security checks
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

    // Check for suspicious patterns in email
    const suspiciousEmailPatterns = [
      /[<>]/g, // Angle brackets
      /javascript:/gi, // JavaScript protocol
      /data:/gi, // Data protocol
      /vbscript:/gi // VBScript protocol
    ];

    for (const pattern of suspiciousEmailPatterns) {
      if (pattern.test(sanitized)) {
        violations.push({
          type: ViolationType.SUSPICIOUS_PATTERN,
          threatLevel: ThreatLevel.HIGH,
          field: 'email',
          originalValue: email,
          sanitizedValue: sanitized,
          pattern: pattern.toString(),
          description: 'Suspicious pattern in email address',
          timestamp: Date.now()
        });
      }
    }

    // Sanitize email
    sanitized = validator.normalizeEmail(sanitized) || sanitized;

    return { isValid, sanitized, violations };
  }

  /**
   * Validate and sanitize workout data specifically
   */
  static validateWorkoutData(data: any): ValidationResult {
    const workoutSchema = z.object({
      workoutType: z.enum(['strength', 'cardio', 'flexibility', 'conditioning']),
      experience: z.enum(['beginner', 'intermediate', 'advanced']),
      duration: z.number().min(5).max(180),
      goals: z.array(z.string()).max(5),
      equipmentAvailable: z.array(z.string()).max(20),
      constraints: z.array(z.string()).max(10),
      preferences: z.object({
        intensity: z.enum(['low', 'moderate', 'high']).optional(),
        focusAreas: z.array(z.string()).max(5).optional()
      }).optional()
    });

    return this.validateAndSanitize(data, workoutSchema);
  }

  private static processObject(
    obj: any,
    path: string,
    violations: SecurityViolation[],
    context?: { userAgent?: string; ipAddress?: string }
  ): void {
    if (typeof obj === 'string') {
      const result = this.sanitizeString(obj, path);
      violations.push(...result.violations.map(v => ({
        ...v,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress
      })));
      
      // Update the object with sanitized value
      const pathParts = path.split('.');
      let current = obj;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      if (pathParts.length > 0) {
        // This is a simplified approach - in practice you'd need more sophisticated path handling
        obj = result.sanitized;
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.processObject(item, `${path}[${index}]`, violations, context);
      });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        this.processObject(obj[key], newPath, violations, context);
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
 * Express middleware for input validation and sanitization
 */
export function inputValidationMiddleware(schema?: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const context = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Validate and sanitize request body
    if (req.body && Object.keys(req.body).length > 0) {
      const result = InputValidationService.validateAndSanitize(req.body, schema, context);
      
      // Block requests with critical violations
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

      // Replace request body with sanitized data
      req.body = result.sanitizedData;
      req.securityViolations = result.violations;
      req.riskScore = result.riskScore;
    }

    // Validate and sanitize query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      const result = InputValidationService.validateAndSanitize(req.query, undefined, context);
      req.query = result.sanitizedData;
    }

    next();
  };
}
