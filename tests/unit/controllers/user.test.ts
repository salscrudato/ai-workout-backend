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

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserModel.create.mockResolvedValue(mockUser as any)
      mockUserModel.findByEmail.mockResolvedValue(null) // User doesn't exist

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

      // Debug: Check if function is being called
      console.log('About to call createUser')

      try {
        await createUser(req, res, next)
        console.log('createUser completed successfully')
      } catch (error) {
        console.log('createUser threw error:', error)
        throw error
      }

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: undefined,
        timestamp: expect.any(String)
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should create user with profile data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        experience: 'beginner',
        goals: ['weight_loss'],
        equipmentAvailable: ['bodyweight'],
        sex: 'prefer_not_to_say',
        constraints: [],
        health_ack: true,
        data_consent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserModel.findByEmail.mockResolvedValue(null) // User doesn't exist
      mockUserModel.create.mockResolvedValue(mockUser as any)
      mockProfileModel.findOneAndUpdate.mockResolvedValue(mockProfile as any)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          experience: 'beginner',
          goals: ['weight_loss'],
          equipmentAvailable: ['bodyweight'],
          health_ack: true,
          data_consent: true,
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
      expect(mockProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-123' },
        {
          userId: 'user-123',
          experience: 'beginner',
          goals: ['weight_loss'],
          equipmentAvailable: ['bodyweight'],
          sex: 'prefer_not_to_say',
          constraints: [],
          health_ack: true,
          data_consent: true,
          age: undefined,
          height_ft: undefined,
          height_in: undefined,
          weight_lb: undefined,
          injury_notes: undefined,
        },
        { upsert: true }
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: mockProfile,
        timestamp: expect.any(String)
      })
      expect(next).not.toHaveBeenCalled()
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
        },
        headers: {
          'x-request-id': 'test-request-123'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockUserModel.create).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: existingUser,
        profile: undefined,
        timestamp: expect.any(String)
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        email_verified: true,
      }

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firebaseUid: 'firebase-uid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        experience: 'beginner',
        goals: ['weight_loss'],
        equipmentAvailable: ['bodyweight'],
        sex: 'prefer_not_to_say',
        constraints: [],
        health_ack: true,
        data_consent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock Firebase Admin SDK
      const mockVerifyIdToken = jest.fn().mockResolvedValue(mockDecodedToken)
      ;(admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      })

      mockUserModel.findByEmail.mockResolvedValue(mockUser as any)
      mockProfileModel.findOne.mockResolvedValue(mockProfile as any)

      const req = createMockRequest({
        body: {
          idToken: 'valid-firebase-token',
        },
        headers: {
          'x-request-id': 'test-request-123'
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
        token: 'valid-firebase-token',
        isNewUser: false,
        timestamp: expect.any(String)
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should create new user if not exists', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        email_verified: true,
      }

      const mockNewUser = {
        id: 'user-123',
        email: 'test@example.com',
        firebaseUid: 'firebase-uid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockVerifyIdToken = jest.fn().mockResolvedValue(mockDecodedToken)
      ;(admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      })

      mockUserModel.findByEmail.mockResolvedValue(null)
      mockUserModel.create.mockResolvedValue(mockNewUser as any)
      mockProfileModel.findOne.mockResolvedValue(null)

      const req = createMockRequest({
        body: {
          idToken: 'valid-firebase-token',
        },
        headers: {
          'x-request-id': 'test-request-123'
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
        token: 'valid-firebase-token',
        isNewUser: true,
        timestamp: expect.any(String)
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle invalid token', async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Firebase ID token has expired'))
      ;(admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      })

      const req = createMockRequest({
        body: {
          idToken: 'invalid-token',
        },
        headers: {
          'x-request-id': 'test-request-123'
        }
      })
      const res = createMockResponse()
      const next = createMockNext()

      // The controller should call next with an AppError due to asyncHandler
      await authenticateUser(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid or expired token',
        statusCode: 401,
        code: 'INVALID_TOKEN'
      }))
      expect(res.json).not.toHaveBeenCalled()
    })
  })
})
