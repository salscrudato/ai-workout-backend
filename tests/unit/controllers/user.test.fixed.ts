import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { createUser, authenticateUser } from '../../../src/controllers/user'
import { UserModel } from '../../../src/models/User'
import { ProfileModel } from '../../../src/models/Profile'
import { createMockRequest, createMockResponse, createMockNext } from '../../setup'
import admin from 'firebase-admin'

// Mock the models
jest.mock('../../../src/models/User')
jest.mock('../../../src/models/Profile')

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>
const mockProfileModel = ProfileModel as jest.Mocked<typeof ProfileModel>

// Mock Firebase Admin Auth
const mockVerifyIdToken = jest.fn()
const mockAuth = jest.fn(() => ({
  verifyIdToken: mockVerifyIdToken,
}))

jest.mock('firebase-admin', () => ({
  auth: mockAuth,
  apps: [],
}))

// Mock the logger utility
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }
}))

// Mock error classification
jest.mock('../../../src/utils/errorClassification', () => ({
  ErrorClassifier: {
    classify: jest.fn(() => ({
      category: 'VALIDATION',
      severity: 'LOW',
      isRetryable: false,
      isUserError: true,
      requiresAlert: false,
      userMessage: 'Validation error',
      technicalMessage: 'Test error',
      errorCode: 'VALIDATION_ERROR'
    }))
  },
  ErrorMetrics: {
    record: jest.fn()
  }
}))

describe('User Controller - Fixed Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Properly mock the model methods
    mockUserModel.create = jest.fn()
    mockUserModel.findByEmail = jest.fn()
    mockUserModel.findOne = jest.fn()
    mockProfileModel.findOne = jest.fn()
    mockProfileModel.findOneAndUpdate = jest.fn()
    mockVerifyIdToken.mockReset()
  })

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock the model methods
      mockUserModel.findByEmail.mockResolvedValue(null) // User doesn't exist
      mockUserModel.create.mockResolvedValue(mockUser as any)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
        },
        headers: {
          'x-request-id': 'test-request-123'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: undefined,
        message: 'User created successfully'
      })
    })

    it('should create user with profile data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockProfile = {
        userId: 'user-123',
        experience: 'beginner',
        goals: ['weight_loss'],
        equipmentAvailable: ['bodyweight'],
        constraints: [],
        sex: 'prefer_not_to_say',
        data_consent: true,
        health_ack: true,
      }

      mockUserModel.findByEmail.mockResolvedValue(null)
      mockUserModel.create.mockResolvedValue(mockUser as any)
      mockProfileModel.findOneAndUpdate.mockResolvedValue(mockProfile as any)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          profile: {
            experience: 'beginner',
            goals: ['weight_loss'],
            equipmentAvailable: ['bodyweight'],
            constraints: [],
            sex: 'prefer_not_to_say',
            data_consent: true,
            health_ack: true,
          }
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(mockProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-123' },
        {
          userId: 'user-123',
          experience: 'beginner',
          goals: ['weight_loss'],
          equipmentAvailable: ['bodyweight'],
          constraints: [],
          sex: 'prefer_not_to_say',
          data_consent: true,
          health_ack: true,
          age: undefined,
          height_ft: undefined,
          height_in: undefined,
          weight_lb: undefined,
          injury_notes: undefined,
        },
        { upsert: true }
      )
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should handle existing user', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserModel.findByEmail.mockResolvedValue(existingUser as any)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockUserModel.create).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        user: existingUser,
        profile: undefined,
        message: 'User already exists'
      })
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firebaseUid: 'firebase-uid',
      }

      const mockProfile = {
        userId: 'user-123',
        experience: 'beginner',
      }

      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
      }

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken)
      mockUserModel.findByEmail.mockResolvedValue(mockUser as any)
      mockProfileModel.findOne.mockResolvedValue(mockProfile as any)

      const req = createMockRequest({
        headers: {
          authorization: 'Bearer valid-firebase-token'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await authenticateUser(req, res, next)

      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-firebase-token', true)
      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user-123' })
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: mockProfile,
        message: 'Authentication successful'
      })
    })

    it('should create new user if not exists', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
      }

      const mockNewUser = {
        id: 'user-123',
        email: 'test@example.com',
        firebaseUid: 'firebase-uid',
      }

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken)
      mockUserModel.findByEmail.mockResolvedValue(null) // User doesn't exist
      mockUserModel.create.mockResolvedValue(mockNewUser as any)
      mockProfileModel.findOne.mockResolvedValue(null)

      const req = createMockRequest({
        headers: {
          authorization: 'Bearer valid-firebase-token'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await authenticateUser(req, res, next)

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        firebaseUid: 'firebase-uid',
      })
      expect(res.json).toHaveBeenCalledWith({
        user: mockNewUser,
        profile: null,
        message: 'User created and authenticated'
      })
    })

    it('should handle invalid token', async () => {
      const mockError = new Error('Invalid token')
      mockVerifyIdToken.mockRejectedValue(mockError)

      const req = createMockRequest({
        headers: {
          authorization: 'Bearer invalid-token'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await authenticateUser(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or expired token',
        statusCode: 401,
        code: 'INVALID_TOKEN'
      }))
    })
  })
})
