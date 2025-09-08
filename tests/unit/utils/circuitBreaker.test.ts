import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerError,
  RetryManager,
  RetryExhaustedError,
  circuitBreakerRegistry
} from '../../../src/utils/circuitBreaker'

// Mock setTimeout for testing delays
jest.useFakeTimers()

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

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    jest.clearAllMocks()
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      recoveryTimeout: 1000,
      monitoringPeriod: 5000
    })
  })

  describe('execute', () => {
    it('should execute function successfully when circuit is closed', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await circuitBreaker.execute(mockFn)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe(CircuitState.CLOSED)
      expect(stats.successCount).toBe(1)
      expect(stats.failureCount).toBe(0)
    })

    it('should track failures and open circuit when threshold is reached', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'))
      
      // Execute function multiple times to trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe(CircuitState.OPEN)
      expect(stats.failureCount).toBe(3)
    })

    it('should reject requests immediately when circuit is open', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'))
      
      // Trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      // Now circuit should be open and reject immediately
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(CircuitBreakerError)
      
      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe(CircuitState.OPEN)
    })

    it('should transition to half-open after recovery timeout', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockResolvedValueOnce('success')
      
      // Trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      expect(circuitBreaker.getStats().state).toBe(CircuitState.OPEN)
      
      // Wait for recovery timeout (mocked)
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // Next call should transition to half-open and succeed
      const result = await circuitBreaker.execute(mockFn)
      expect(result).toBe('success')
      expect(circuitBreaker.getStats().state).toBe(CircuitState.CLOSED)
    })

    it('should not trigger circuit breaker for expected errors', async () => {
      const circuitBreakerWithFilter = new CircuitBreaker('test-service', {
        failureThreshold: 3,
        recoveryTimeout: 1000,
        expectedErrors: (error: Error) => !error.message.includes('400')
      })
      
      const mockFn = jest.fn().mockRejectedValue(new Error('400 Bad Request'))
      
      // Execute multiple times with client error
      for (let i = 0; i < 5; i++) {
        try {
          await circuitBreakerWithFilter.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      const stats = circuitBreakerWithFilter.getStats()
      expect(stats.state).toBe(CircuitState.CLOSED) // Should remain closed
      expect(stats.failureCount).toBe(0) // Should not count client errors
    })
  })

  describe('reset', () => {
    it('should reset circuit breaker to closed state', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'))
      
      // Trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      expect(circuitBreaker.getStats().state).toBe(CircuitState.OPEN)
      
      circuitBreaker.reset()
      
      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe(CircuitState.CLOSED)
      expect(stats.failureCount).toBe(0)
    })
  })
})

describe('RetryManager', () => {
  let retryManager: RetryManager

  beforeEach(() => {
    jest.clearAllMocks()
    retryManager = new RetryManager({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      jitter: false // Disable jitter for predictable tests
    })
  })

  describe('execute', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await retryManager.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValueOnce('success')
      
      const result = await retryManager.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should not retry on non-retryable errors', async () => {
      const retryManagerWithCustomCondition = new RetryManager({
        maxAttempts: 3,
        baseDelay: 100,
        retryCondition: (error: Error) => error.message.includes('retryable')
      })
      
      const mockFn = jest.fn().mockRejectedValue(new Error('Non-retryable error'))
      
      await expect(retryManagerWithCustomCondition.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })).rejects.toThrow('Non-retryable error')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should throw RetryExhaustedError after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('ECONNRESET'))
      
      await expect(retryManager.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })).rejects.toThrow(RetryExhaustedError)
      
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should apply exponential backoff delays', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce('success')
      
      const startTime = Date.now()
      
      const result = await retryManager.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      // Should have waited at least 100ms + 200ms = 300ms for delays
      expect(totalTime).toBeGreaterThan(300)
    })

    it('should handle HTTP status codes correctly', async () => {
      const retryManagerWithStatusCodes = new RetryManager({
        maxAttempts: 3,
        baseDelay: 10,
        retryCondition: (error: Error) => {
          if ('status' in error) {
            const status = (error as any).status
            return status >= 500 || status === 429
          }
          return false
        }
      })
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(Object.assign(new Error('Server Error'), { status: 500 }))
        .mockRejectedValueOnce(Object.assign(new Error('Rate Limited'), { status: 429 }))
        .mockResolvedValueOnce('success')
      
      const result = await retryManagerWithStatusCodes.execute(mockFn, {
        serviceName: 'test-service',
        operation: 'test-operation'
      })
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })
})

describe('CircuitBreakerRegistry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getBreaker', () => {
    it('should create and return circuit breaker for service', () => {
      const breaker = circuitBreakerRegistry.getBreaker('test-service')
      
      expect(breaker).toBeInstanceOf(CircuitBreaker)
      expect(breaker.getStats().state).toBe(CircuitState.CLOSED)
    })

    it('should return same instance for same service name', () => {
      const breaker1 = circuitBreakerRegistry.getBreaker('test-service')
      const breaker2 = circuitBreakerRegistry.getBreaker('test-service')
      
      expect(breaker1).toBe(breaker2)
    })

    it('should create different instances for different service names', () => {
      const breaker1 = circuitBreakerRegistry.getBreaker('service-1')
      const breaker2 = circuitBreakerRegistry.getBreaker('service-2')
      
      expect(breaker1).not.toBe(breaker2)
    })
  })

  describe('getAllStats', () => {
    it('should return stats for all circuit breakers', () => {
      const breaker1 = circuitBreakerRegistry.getBreaker('service-1')
      const breaker2 = circuitBreakerRegistry.getBreaker('service-2')
      
      const allStats = circuitBreakerRegistry.getAllStats()
      
      expect(allStats).toHaveProperty('service-1')
      expect(allStats).toHaveProperty('service-2')
      expect(allStats['service-1'].state).toBe(CircuitState.CLOSED)
      expect(allStats['service-2'].state).toBe(CircuitState.CLOSED)
    })
  })

  describe('resetAll', () => {
    it('should reset all circuit breakers', async () => {
      const breaker = circuitBreakerRegistry.getBreaker('test-service')
      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'))
      
      // Trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(mockFn)
        } catch (error) {
          // Expected to fail
        }
      }
      
      expect(breaker.getStats().state).toBe(CircuitState.OPEN)
      
      circuitBreakerRegistry.resetAll()
      
      expect(breaker.getStats().state).toBe(CircuitState.CLOSED)
      expect(breaker.getStats().failureCount).toBe(0)
    })
  })
})
