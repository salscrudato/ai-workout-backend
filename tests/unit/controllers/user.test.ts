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

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: undefined,
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

      mockUserModel.create.mockResolvedValue(mockUser as any)
      mockProfileModel.create.mockResolvedValue(mockProfile as any)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          experience: 'beginner',
          goals: ['weight_loss'],
          equipmentAvailable: ['bodyweight'],
          health_ack: true,
          data_consent: true,
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      await createUser(req, res, next)

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(mockProfileModel.create).toHaveBeenCalledWith({
        userId: 'user-123',
        experience: 'beginner',
        goals: ['weight_loss'],
        equipmentAvailable: ['bodyweight'],
        sex: 'prefer_not_to_say',
        constraints: [],
        health_ack: true,
        data_consent: true,
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: mockProfile,
      })
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
      })
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
      })
      const res = createMockResponse()
      const next = createMockNext()

      await authenticateUser(req, res, next)

      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-firebase-token')
      expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user-123' })
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        profile: mockProfile,
        token: 'valid-firebase-token',
        isNewUser: false,
      })
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
      })
    })

    it('should handle invalid token', async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'))
      ;(admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      })

      const req = createMockRequest({
        body: {
          idToken: 'invalid-token',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      await authenticateUser(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token',
      })
    })
  })
})
