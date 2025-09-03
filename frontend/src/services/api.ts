import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { auth } from '../config/firebase';
import type {
  User,
  Profile,
  CreateProfileInput,
  Equipment,
  GenerateWorkoutRequest,
  GenerateWorkoutResponse,
  WorkoutPlanResponse,
  WorkoutSession,
  AuthResponse,
} from '../types/api';

/**
 * Simple in-memory cache for API responses
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Enhanced API client with caching, request deduplication, and optimized error handling
 *
 * Features:
 * - Automatic Firebase authentication token injection
 * - Request/response caching with configurable TTL
 * - Request deduplication to prevent duplicate API calls
 * - Comprehensive error handling with specific error codes
 * - Automatic cache invalidation for mutations
 * - Performance optimizations for better user experience
 *
 * @example
 * ```typescript
 * const client = new ApiClient();
 * const profile = await client.getProfile(userId);
 * ```
 */
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the API client with environment-specific configuration
   *
   * Automatically determines the correct API base URL based on:
   * - Development environment: localhost:3000 (unless VITE_API_BASE_URL is set)
   * - Production environment: Firebase hosting URL or custom URL from env
   *
   * Sets up Axios interceptors for:
   * - Automatic Firebase Auth token injection
   * - Request/response logging
   * - Error handling and transformation
   */
  constructor() {
    // Determine API base URL based on environment
    const isDevelopment = import.meta.env.DEV;
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;

    // Always use production URL for now to avoid CORS issues
    // In development, you can override with VITE_API_BASE_URL environment variable
    this.baseURL = envApiUrl || 'https://ai-workout-backend-2024.web.app';

    console.log('API Client initialized with baseURL:', this.baseURL);

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false, // Explicitly set for CORS
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;
        console.log('API: Current Firebase user:', user ? { uid: user.uid, email: user.email } : 'No user');

        if (user) {
          try {
            const token = await user.getIdToken();
            console.log('API: Got Firebase token:', token ? `${token.substring(0, 50)}...` : 'No token');
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API: Set Authorization header:', config.headers.Authorization ? 'Yes' : 'No');
          } catch (error) {
            console.error('API: Failed to get Firebase token:', error);
          }
        } else {
          console.warn('API: No Firebase user found, request will be unauthenticated');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - LOG but don't redirect for now
          console.error('401 Unauthorized - would redirect to login but disabled for debugging');
          console.error('Full error:', error);
          // Temporarily disabled: window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a cache key for a request
   */
  private getCacheKey(method: string, url: string, data?: any): string {
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataStr}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isCacheValid(entry)) {
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key); // Remove expired entry
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache entries (useful for invalidating after mutations)
   */
  private clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Make a cached request with deduplication
   */
  private async cachedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    options: { cache?: boolean; cacheTtl?: number } = {}
  ): Promise<T> {
    const { cache = method === 'GET', cacheTtl = this.DEFAULT_CACHE_TTL } = options;
    const cacheKey = this.getCacheKey(method, url, data);

    // Check cache first (only for cacheable requests)
    if (cache) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check for pending request to avoid duplicate requests
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Make the request
    const requestPromise = this.makeRequest<T>(method, url, data);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache the result if caching is enabled
      if (cache) {
        this.setCache(cacheKey, result, cacheTtl);
      }

      return result;
    } finally {
      // Always clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any
  ): Promise<T> {
    const config = {
      method,
      url,
      ...(data && ['POST', 'PUT', 'PATCH'].includes(method) && { data }),
      ...(data && method === 'GET' && { params: data }),
    };

    const response = await this.client.request<T>(config);
    return this.handleResponse(response);
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  private handleError(error: any): never {
    console.error('API Error:', error);

    // Network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }

    // Server response errors
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    // HTTP status errors
    if (error.response?.status) {
      const status = error.response.status;
      if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (status === 404) {
        throw new Error('The requested resource was not found.');
      } else if (status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else if (status === 401) {
        throw new Error('Authentication required. Please sign in again.');
      }
    }

    // Generic error
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }

  // Authentication
  async authenticateWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      // Authentication requests should not be cached
      return await this.cachedRequest<AuthResponse>('POST', '/v1/auth/google', { idToken }, { cache: false });
    } catch (error) {
      this.handleError(error);
    }
  }

  // User management
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Clear user-related cache after creation
      const result = await this.cachedRequest<User>('POST', '/v1/users', userData, { cache: false });
      this.clearCachePattern('/v1/users');
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Profile management
  async createProfile(profileData: CreateProfileInput): Promise<Profile> {
    try {
      // Clear profile cache after creation
      const result = await this.cachedRequest<Profile>('POST', '/v1/profile', profileData, { cache: false });
      this.clearCachePattern('/v1/profile');
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(userId: string): Promise<Profile> {
    try {
      // Cache profile data for 10 minutes
      return await this.cachedRequest<Profile>('GET', `/v1/profile/${userId}`, undefined, {
        cache: true,
        cacheTtl: 10 * 60 * 1000
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(userId: string, profileData: Partial<CreateProfileInput>): Promise<Profile> {
    try {
      // Clear profile cache after update
      const result = await this.cachedRequest<Profile>('PATCH', `/v1/profile/${userId}`, profileData, { cache: false });
      this.clearCachePattern('/v1/profile');
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Equipment
  async getEquipment(): Promise<{ items: Equipment[] }> {
    try {
      // Cache equipment data for 1 hour (rarely changes)
      return await this.cachedRequest<{ items: Equipment[] }>('GET', '/v1/equipment', undefined, {
        cache: true,
        cacheTtl: 60 * 60 * 1000
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Workout generation
  async generateWorkout(workoutRequest: GenerateWorkoutRequest): Promise<GenerateWorkoutResponse> {
    try {
      console.log('API: Making request to /v1/workouts/generate with:', workoutRequest);
      // Don't cache workout generation requests
      const result = await this.cachedRequest<GenerateWorkoutResponse>('POST', '/v1/workouts/generate', workoutRequest, { cache: false });
      console.log('API: Received response:', result);
      // Clear workout cache after generation
      this.clearCachePattern('/v1/workouts');
      return result;
    } catch (error) {
      console.error('API: Error in generateWorkout:', error);
      this.handleError(error);
    }
  }

  // Workout management
  async getWorkout(workoutId: string): Promise<WorkoutPlanResponse> {
    try {
      // Cache individual workout data for 15 minutes
      return await this.cachedRequest<WorkoutPlanResponse>('GET', `/v1/workouts/${workoutId}`, undefined, {
        cache: true,
        cacheTtl: 15 * 60 * 1000
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async listWorkouts(userId: string): Promise<{ workouts: WorkoutPlanResponse[] }> {
    try {
      // Cache workout list for 5 minutes
      return await this.cachedRequest<{ workouts: WorkoutPlanResponse[] }>('GET', `/v1/workouts`, { userId }, {
        cache: true,
        cacheTtl: 5 * 60 * 1000
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async completeWorkout(workoutId: string, feedback?: string, rating?: number): Promise<WorkoutSession> {
    try {
      const response = await this.client.post<WorkoutSession>(`/v1/workouts/${workoutId}/complete`, {
        feedback,
        rating,
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.client.get<{ status: string }>('/health');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
