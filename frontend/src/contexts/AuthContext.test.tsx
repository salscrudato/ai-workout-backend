import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { apiClient } from '../services/api'

// Mock Firebase auth
const mockFirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
}

const mockAuthResponse = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firebaseUid: 'test-uid',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  profile: {
    id: 'profile-123',
    userId: 'user-123',
    experience: 'beginner' as const,
    goals: ['weight_loss'],
    equipmentAvailable: ['bodyweight'],
    sex: 'prefer_not_to_say' as const,
    constraints: [],
    health_ack: true,
    data_consent: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  isNewUser: false,
}

// Test component to access auth context
function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{auth.user?.email || 'no-email'}</div>
      <div data-testid="new-user">{auth.isNewUser ? 'new-user' : 'existing-user'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-email')
  })

  it('handles successful authentication', async () => {
    // Mock successful API response
    vi.mocked(apiClient.authenticateWithGoogle).mockResolvedValue(mockAuthResponse)

    // Mock Firebase auth state change
    const { onAuthStateChanged } = await import('../config/firebase')
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      // Simulate auth state change with user
      setTimeout(() => callback(mockFirebaseUser as any), 0)
      return vi.fn() // unsubscribe function
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('new-user')).toHaveTextContent('existing-user')
  })

  it('handles authentication failure', async () => {
    // Mock API failure
    vi.mocked(apiClient.authenticateWithGoogle).mockRejectedValue(new Error('Auth failed'))

    // Mock Firebase auth state change
    const { onAuthStateChanged, signOut } = await import('../config/firebase')
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockFirebaseUser as any), 0)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-email')
    expect(vi.mocked(signOut)).toHaveBeenCalled()
  })

  it('handles sign out', async () => {
    const { onAuthStateChanged } = await import('../config/firebase')
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      // First call with user, then without
      setTimeout(() => callback(mockFirebaseUser as any), 0)
      setTimeout(() => callback(null), 100)
      return vi.fn()
    })

    vi.mocked(apiClient.authenticateWithGoogle).mockResolvedValue(mockAuthResponse)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial auth
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })

    // Wait for sign out
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    }, { timeout: 200 })

    expect(screen.getByTestId('user-email')).toHaveTextContent('no-email')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
