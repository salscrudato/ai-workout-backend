import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { ErrorClassifier, ErrorMetrics, ErrorSeverity, ErrorCategory } from '../../../src/utils/errorClassification'

// Mock pino logger
jest.mock('pino', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}))

describe('ErrorClassifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('classify', () => {
    it('should classify validation errors correctly', () => {
      const error = new Error('Validation failed: required field missing')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.VALIDATION)
      expect(classification.severity).toBe(ErrorSeverity.LOW)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(true)
      expect(classification.requiresAlert).toBe(false)
      expect(classification.errorCode).toBe('VALIDATION_ERROR')
    })

    it('should classify authentication errors correctly', () => {
      const error = new Error('Unauthorized access - invalid token')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(true)
      expect(classification.requiresAlert).toBe(false)
      expect(classification.errorCode).toBe('AUTH_ERROR')
    })

    it('should classify rate limit errors correctly', () => {
      const error = new Error('Rate limit exceeded - too many requests')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.RATE_LIMIT)
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
      expect(classification.isRetryable).toBe(true)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('RATE_LIMIT_ERROR')
    })

    it('should classify network errors correctly', () => {
      const error = new Error('Network connection timeout')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.NETWORK)
      expect(classification.severity).toBe(ErrorSeverity.HIGH)
      expect(classification.isRetryable).toBe(true)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('NETWORK_ERROR')
    })

    it('should classify database errors correctly', () => {
      const error = new Error('Database connection failed - firestore unavailable')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.DATABASE)
      expect(classification.severity).toBe(ErrorSeverity.HIGH)
      expect(classification.isRetryable).toBe(true)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('DATABASE_ERROR')
    })

    it('should classify external service errors correctly', () => {
      const error = new Error('OpenAI API error - service unavailable')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(classification.severity).toBe(ErrorSeverity.HIGH)
      expect(classification.isRetryable).toBe(true)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('EXTERNAL_SERVICE_ERROR')
    })

    it('should classify security errors correctly', () => {
      const error = new Error('Security violation detected - potential injection attack')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.SECURITY)
      expect(classification.severity).toBe(ErrorSeverity.CRITICAL)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('SECURITY_ERROR')
    })

    it('should classify system errors correctly', () => {
      const error = new Error('System resource exhausted - out of memory')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.SYSTEM)
      expect(classification.severity).toBe(ErrorSeverity.CRITICAL)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('SYSTEM_ERROR')
    })

    it('should handle HTTP status codes correctly', () => {
      const error = Object.assign(new Error('Bad Request'), { status: 400 })
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.VALIDATION)
      expect(classification.severity).toBe(ErrorSeverity.LOW)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(true)
      expect(classification.errorCode).toBe('HTTP_400')
    })

    it('should handle server error status codes correctly', () => {
      const error = Object.assign(new Error('Internal Server Error'), { status: 500 })
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(classification.severity).toBe(ErrorSeverity.HIGH)
      expect(classification.isRetryable).toBe(true)
      expect(classification.isUserError).toBe(false)
      expect(classification.errorCode).toBe('HTTP_500')
    })

    it('should classify unknown errors with default values', () => {
      const error = new Error('Some unknown error occurred')
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.UNKNOWN)
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(false)
      expect(classification.requiresAlert).toBe(true)
      expect(classification.errorCode).toBe('UNKNOWN_ERROR')
    })

    it('should handle ZodError correctly', () => {
      const error = new Error('Invalid input')
      error.name = 'ZodError'
      const classification = ErrorClassifier.classify(error)

      expect(classification.category).toBe(ErrorCategory.VALIDATION)
      expect(classification.severity).toBe(ErrorSeverity.LOW)
      expect(classification.isRetryable).toBe(false)
      expect(classification.isUserError).toBe(true)
      expect(classification.errorCode).toBe('VALIDATION_ERROR')
    })
  })

  describe('shouldAlert', () => {
    it('should return true for high severity errors', () => {
      const classification = {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: false,
        userMessage: 'Network error',
        technicalMessage: 'Connection failed',
        errorCode: 'NETWORK_ERROR'
      }

      expect(ErrorClassifier.shouldAlert(classification)).toBe(true)
    })

    it('should return true for critical severity errors', () => {
      const classification = {
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.CRITICAL,
        isRetryable: false,
        isUserError: false,
        requiresAlert: false,
        userMessage: 'Security error',
        technicalMessage: 'Security violation',
        errorCode: 'SECURITY_ERROR'
      }

      expect(ErrorClassifier.shouldAlert(classification)).toBe(true)
    })

    it('should return true when requiresAlert is true', () => {
      const classification = {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        isRetryable: false,
        isUserError: true,
        requiresAlert: true,
        userMessage: 'Validation error',
        technicalMessage: 'Invalid input',
        errorCode: 'VALIDATION_ERROR'
      }

      expect(ErrorClassifier.shouldAlert(classification)).toBe(true)
    })

    it('should return false for low severity errors without alert requirement', () => {
      const classification = {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        isRetryable: false,
        isUserError: true,
        requiresAlert: false,
        userMessage: 'Validation error',
        technicalMessage: 'Invalid input',
        errorCode: 'VALIDATION_ERROR'
      }

      expect(ErrorClassifier.shouldAlert(classification)).toBe(false)
    })
  })

  describe('getUserMessage', () => {
    it('should return user-friendly message', () => {
      const classification = {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Network error occurred. Please try again.',
        technicalMessage: 'Connection timeout',
        errorCode: 'NETWORK_ERROR'
      }

      expect(ErrorClassifier.getUserMessage(classification)).toBe('Network error occurred. Please try again.')
    })
  })

  describe('getTechnicalDetails', () => {
    it('should return technical error details', () => {
      const error = new Error('Test error')
      error.stack = 'Error stack trace'
      
      const classification = {
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        isRetryable: false,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'An error occurred',
        technicalMessage: 'Test error',
        errorCode: 'UNKNOWN_ERROR'
      }

      const details = ErrorClassifier.getTechnicalDetails(error, classification)

      expect(details).toEqual({
        message: 'Test error',
        name: 'Error',
        stack: 'Error stack trace',
        classification: {
          category: ErrorCategory.UNKNOWN,
          severity: ErrorSeverity.MEDIUM,
          errorCode: 'UNKNOWN_ERROR',
          isRetryable: false,
          requiresAlert: true
        }
      })
    })
  })
})

describe('ErrorMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ErrorMetrics.reset()
  })

  describe('record', () => {
    it('should record error occurrences', () => {
      const classification = {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        isRetryable: false,
        isUserError: true,
        requiresAlert: false,
        userMessage: 'Validation error',
        technicalMessage: 'Invalid input',
        errorCode: 'VALIDATION_ERROR'
      }

      ErrorMetrics.record(classification, { userId: 'user-123', operation: 'test' })

      const metrics = ErrorMetrics.getMetrics()
      expect(metrics.errorCounts['VALIDATION:VALIDATION_ERROR']).toBe(1)
    })

    it('should increment count for repeated errors', () => {
      const classification = {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Network error',
        technicalMessage: 'Connection failed',
        errorCode: 'NETWORK_ERROR'
      }

      ErrorMetrics.record(classification)
      ErrorMetrics.record(classification)
      ErrorMetrics.record(classification)

      const metrics = ErrorMetrics.getMetrics()
      expect(metrics.errorCounts['NETWORK:NETWORK_ERROR']).toBe(3)
    })
  })

  describe('getMetrics', () => {
    it('should return current metrics', () => {
      const classification = {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Database error',
        technicalMessage: 'Connection failed',
        errorCode: 'DATABASE_ERROR'
      }

      ErrorMetrics.record(classification)
      const metrics = ErrorMetrics.getMetrics()

      expect(metrics.errorCounts).toEqual({
        'DATABASE:DATABASE_ERROR': 1
      })
      expect(metrics.lastReset).toBeInstanceOf(Date)
    })
  })

  describe('reset', () => {
    it('should reset error counters', () => {
      const classification = {
        category: ErrorCategory.EXTERNAL_SERVICE,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Service error',
        technicalMessage: 'API failed',
        errorCode: 'SERVICE_ERROR'
      }

      ErrorMetrics.record(classification)
      expect(ErrorMetrics.getMetrics().errorCounts['EXTERNAL_SERVICE:SERVICE_ERROR']).toBe(1)

      ErrorMetrics.reset()
      expect(ErrorMetrics.getMetrics().errorCounts).toEqual({})
    })
  })
})
