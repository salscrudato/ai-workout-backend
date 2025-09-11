import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type { WorkoutPlan, Equipment } from '../types/api';
import type { ReactNode } from 'react';

/**
 * Global application state management with optimized context pattern
 * 
 * Features:
 * - Centralized state management
 * - Action-based state updates
 * - Memoized selectors to prevent unnecessary re-renders
 * - Type-safe state and actions
 * - Separation of concerns between different state domains
 */

// Application state interface
export interface AppState {
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    loading: {
      global: boolean;
      workoutGeneration: boolean;
      profileUpdate: boolean;
    };
    notifications: Notification[];
  };
  workout: {
    currentWorkout: WorkoutPlan | null;
    generationHistory: WorkoutPlan[];
    preferences: {
      defaultDuration: number;
      preferredEquipment: string[];
      workoutTypes: string[];
    };
  };
  cache: {
    equipment: Equipment[] | null;
    lastFetch: {
      equipment: number | null;
      workouts: number | null;
      profile: number | null;
    };
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// Action types
export type AppAction =
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_WORKOUT_GENERATION_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE_UPDATE_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_CURRENT_WORKOUT'; payload: WorkoutPlan | null }
  | { type: 'ADD_TO_GENERATION_HISTORY'; payload: WorkoutPlan }
  | { type: 'UPDATE_WORKOUT_PREFERENCES'; payload: Partial<AppState['workout']['preferences']> }
  | { type: 'SET_EQUIPMENT_CACHE'; payload: Equipment[] }
  | { type: 'UPDATE_CACHE_TIMESTAMP'; payload: { key: keyof AppState['cache']['lastFetch']; timestamp: number } }
  | { type: 'CLEAR_CACHE' };

// Initial state
const initialState: AppState = {
  ui: {
    sidebarOpen: false,
    theme: 'system',
    loading: {
      global: false,
      workoutGeneration: false,
      profileUpdate: false,
    },
    notifications: [],
  },
  workout: {
    currentWorkout: null,
    generationHistory: [],
    preferences: {
      defaultDuration: 45,
      preferredEquipment: [],
      workoutTypes: [],
    },
  },
  cache: {
    equipment: null,
    lastFetch: {
      equipment: null,
      workouts: null,
      profile: null,
    },
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: { ...state.ui.loading, global: action.payload },
        },
      };

    case 'SET_WORKOUT_GENERATION_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: { ...state.ui.loading, workoutGeneration: action.payload },
        },
      };

    case 'SET_PROFILE_UPDATE_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: { ...state.ui.loading, profileUpdate: action.payload },
        },
      };

    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, newNotification],
        },
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        ui: { ...state.ui, notifications: [] },
      };

    case 'SET_CURRENT_WORKOUT':
      return {
        ...state,
        workout: { ...state.workout, currentWorkout: action.payload },
      };

    case 'ADD_TO_GENERATION_HISTORY':
      return {
        ...state,
        workout: {
          ...state.workout,
          generationHistory: [action.payload, ...state.workout.generationHistory].slice(0, 10), // Keep last 10
        },
      };

    case 'UPDATE_WORKOUT_PREFERENCES':
      return {
        ...state,
        workout: {
          ...state.workout,
          preferences: { ...state.workout.preferences, ...action.payload },
        },
      };

    case 'SET_EQUIPMENT_CACHE':
      return {
        ...state,
        cache: { ...state.cache, equipment: action.payload },
      };

    case 'UPDATE_CACHE_TIMESTAMP':
      return {
        ...state,
        cache: {
          ...state.cache,
          lastFetch: {
            ...state.cache.lastFetch,
            [action.payload.key]: action.payload.timestamp,
          },
        },
      };

    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: {
          equipment: null,
          lastFetch: {
            equipment: null,
            workouts: null,
            profile: null,
          },
        },
      };

    default:
      return state;
  }
}

// Context interfaces
interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

interface AppStateActionsContextValue {
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGlobalLoading: (loading: boolean) => void;
  setWorkoutGenerationLoading: (loading: boolean) => void;
  setProfileUpdateLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Workout actions
  setCurrentWorkout: (workout: any | null) => void;
  addToGenerationHistory: (workout: any) => void;
  updateWorkoutPreferences: (preferences: Partial<AppState['workout']['preferences']>) => void;
  
  // Cache actions
  setEquipmentCache: (equipment: Equipment[]) => void;
  updateCacheTimestamp: (key: keyof AppState['cache']['lastFetch']) => void;
  clearCache: () => void;
}

// Create contexts
const AppStateContext = createContext<AppStateContextValue | null>(null);
const AppStateActionsContext = createContext<AppStateActionsContextValue | null>(null);

// Provider component
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoize state context value
  const stateContextValue = useMemo(() => ({
    state,
    dispatch,
  }), [state]);

  // Memoize action creators
  const actionsContextValue = useMemo<AppStateActionsContextValue>(() => ({
    // UI actions
    setSidebarOpen: (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open }),
    setTheme: (theme: 'light' | 'dark' | 'system') => dispatch({ type: 'SET_THEME', payload: theme }),
    setGlobalLoading: (loading: boolean) => dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading }),
    setWorkoutGenerationLoading: (loading: boolean) => dispatch({ type: 'SET_WORKOUT_GENERATION_LOADING', payload: loading }),
    setProfileUpdateLoading: (loading: boolean) => dispatch({ type: 'SET_PROFILE_UPDATE_LOADING', payload: loading }),
    
    // Notification actions
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => 
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    
    // Workout actions
    setCurrentWorkout: (workout: any | null) => dispatch({ type: 'SET_CURRENT_WORKOUT', payload: workout }),
    addToGenerationHistory: (workout: any) => dispatch({ type: 'ADD_TO_GENERATION_HISTORY', payload: workout }),
    updateWorkoutPreferences: (preferences: Partial<AppState['workout']['preferences']>) => 
      dispatch({ type: 'UPDATE_WORKOUT_PREFERENCES', payload: preferences }),
    
    // Cache actions
    setEquipmentCache: (equipment: Equipment[]) => dispatch({ type: 'SET_EQUIPMENT_CACHE', payload: equipment }),
    updateCacheTimestamp: (key: keyof AppState['cache']['lastFetch']) => 
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key, timestamp: Date.now() } }),
    clearCache: () => dispatch({ type: 'CLEAR_CACHE' }),
  }), []);

  return (
    <AppStateContext.Provider value={stateContextValue}>
      <AppStateActionsContext.Provider value={actionsContextValue}>
        {children}
      </AppStateActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom hooks with error handling
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export function useAppActions() {
  const context = useContext(AppStateActionsContext);
  if (!context) {
    throw new Error('useAppActions must be used within an AppStateProvider');
  }
  return context;
}

// Selector hooks to prevent unnecessary re-renders
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useAppState();
  return useMemo(() => selector(state), [state, selector]);
}

// Specific selector hooks for common use cases
export const useUIState = () => useAppSelector(state => state.ui);
export const useWorkoutState = () => useAppSelector(state => state.workout);
export const useCacheState = () => useAppSelector(state => state.cache);
export const useNotifications = () => useAppSelector(state => state.ui.notifications);
export const useLoadingState = () => useAppSelector(state => state.ui.loading);
