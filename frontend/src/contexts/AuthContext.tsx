import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  User as FirebaseUser
} from 'firebase/auth';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { apiClient } from '../services/api';
import type { User, Profile } from '../types/api';
import { normalizeProfile } from '../utils/profileUtils';

// Enhanced error types for better error handling
interface NetworkError extends Error {
  code?: string;
  status?: number;
}

interface AuthenticationError extends Error {
  code?: string;
  customData?: any;
}

interface AuthContextType {
  // Firebase user
  firebaseUser: FirebaseUser | null;
  // Backend user data
  user: User | null;
  profile: Profile | null;
  // Auth state
  loading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Handle Firebase auth state changes
  useEffect(() => {
    // Handle redirect result first
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect sign-in successful:', result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await getIdToken(firebaseUser);
          
          // Authenticate with backend
          const authResponse = await apiClient.authenticateWithGoogle(idToken);
          
          setFirebaseUser(firebaseUser);
          setUser(authResponse.user);
          setProfile(normalizeProfile(authResponse.profile));
          setIsNewUser(authResponse.isNewUser);
        } catch (error: unknown) {
          const authError = error as NetworkError;
          console.error('Backend authentication failed:', authError);

          // If it's a network error, create a temporary user object and continue
          if (authError.message?.includes('Unable to connect to the server') ||
              authError.message?.includes('Network Error')) {
            console.warn('Backend unavailable, creating temporary user session');

            // Create a temporary user object from Firebase user
            const tempUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firebaseUid: firebaseUser.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setFirebaseUser(firebaseUser);
            setUser(tempUser);
            setProfile(null);
            setIsNewUser(true); // Assume new user when backend is unavailable

            console.log('Auth: Using temporary user session due to backend unavailability');
          } else {
            // For other errors, sign out from Firebase too
            await firebaseSignOut(auth);
            setFirebaseUser(null);
            setUser(null);
            setProfile(null);
            setIsNewUser(false);
          }
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setProfile(null);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);

      // Try popup first, but with better error handling for COOP
      try {
        await signInWithPopup(auth, googleProvider);
        // The onAuthStateChanged listener will handle the rest
      } catch (popupError: unknown) {
        const authError = popupError as AuthenticationError;
        console.warn('Popup sign-in failed, trying redirect:', authError);

        // If popup fails due to COOP or other popup-related issues, use redirect
        if (
          authError?.code === 'auth/popup-blocked' ||
          popupError?.code === 'auth/popup-closed-by-user' ||
          popupError?.message?.includes('Cross-Origin-Opener-Policy') ||
          popupError?.message?.includes('popup')
        ) {
          console.log('Using redirect method due to popup restrictions...');
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          return; // Don't set loading to false as redirect will reload the page
        }

        // Re-throw other errors
        throw authError;
      }
    } catch (error: unknown) {
      const authError = error as AuthenticationError;
      console.error('Google sign-in failed:', authError);
      setLoading(false);
      throw authError;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will handle clearing state
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const updatedProfile = await apiClient.getProfile(user.id);
      setProfile(normalizeProfile(updatedProfile));
      setIsNewUser(false);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  }, [user?.id]);

  // Memoize computed values to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => !!firebaseUser && !!user, [firebaseUser, user]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo<AuthContextType>(() => ({
    firebaseUser,
    user,
    profile,
    loading,
    isAuthenticated,
    isNewUser,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }), [
    firebaseUser,
    user,
    profile,
    loading,
    isAuthenticated,
    isNewUser,
    signInWithGoogle,
    signOut,
    refreshProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
