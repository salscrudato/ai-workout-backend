import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

/**
 * Enhanced State Management System for Components
 * 
 * This system provides:
 * - Type-safe state management with reducers
 * - Optimized re-renders with selective subscriptions
 * - Built-in loading, error, and success states
 * - Async action handling with proper error boundaries
 * - Middleware support for logging and debugging
 */

// Base state interface that all component states should extend
export interface BaseState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

// Base action interface
export interface BaseAction {
  type: string;
  payload?: any;
}

// Common action types
export const COMMON_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_SUCCESS: 'CLEAR_SUCCESS',
  RESET_STATE: 'RESET_STATE',
} as const;

// Base reducer that handles common state transitions
export function createBaseReducer<T extends BaseState>(
  initialState: T,
  customReducer?: (state: T, action: BaseAction) => T
) {
  return (state: T, action: BaseAction): T => {
    // Handle common actions first
    switch (action.type) {
      case COMMON_ACTIONS.SET_LOADING:
        return {
          ...state,
          loading: action.payload,
          error: action.payload ? null : state.error, // Clear error when starting to load
        };

      case COMMON_ACTIONS.SET_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload,
          success: false,
        };

      case COMMON_ACTIONS.SET_SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          success: action.payload,
        };

      case COMMON_ACTIONS.CLEAR_ERROR:
        return {
          ...state,
          error: null,
        };

      case COMMON_ACTIONS.CLEAR_SUCCESS:
        return {
          ...state,
          success: false,
        };

      case COMMON_ACTIONS.RESET_STATE:
        return {
          ...initialState,
          ...action.payload, // Allow partial reset
        };

      default:
        // Delegate to custom reducer if provided
        return customReducer ? customReducer(state, action) : state;
    }
  };
}

// Enhanced context with actions
interface StateContextValue<T extends BaseState> {
  state: T;
  dispatch: React.Dispatch<BaseAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: boolean) => void;
    clearError: () => void;
    clearSuccess: () => void;
    resetState: (partialState?: Partial<T>) => void;
  };
}

// Generic state provider factory
export function createStateProvider<T extends BaseState>(
  initialState: T,
  customReducer?: (state: T, action: BaseAction) => T
) {
  const StateContext = createContext<StateContextValue<T> | null>(null);

  const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(
      createBaseReducer(initialState, customReducer),
      initialState
    );

    // Memoized actions to prevent unnecessary re-renders
    const actions = React.useMemo(() => ({
      setLoading: (loading: boolean) => 
        dispatch({ type: COMMON_ACTIONS.SET_LOADING, payload: loading }),
      
      setError: (error: string | null) => 
        dispatch({ type: COMMON_ACTIONS.SET_ERROR, payload: error }),
      
      setSuccess: (success: boolean) => 
        dispatch({ type: COMMON_ACTIONS.SET_SUCCESS, payload: success }),
      
      clearError: () => 
        dispatch({ type: COMMON_ACTIONS.CLEAR_ERROR }),
      
      clearSuccess: () => 
        dispatch({ type: COMMON_ACTIONS.CLEAR_SUCCESS }),
      
      resetState: (partialState?: Partial<T>) => 
        dispatch({ type: COMMON_ACTIONS.RESET_STATE, payload: partialState }),
    }), []);

    const contextValue = React.useMemo(() => ({
      state,
      dispatch,
      actions,
    }), [state, actions]);

    return (
      <StateContext.Provider value={contextValue}>
        {children}
      </StateContext.Provider>
    );
  };

  const useStateContext = () => {
    const context = useContext(StateContext);
    if (!context) {
      throw new Error('useStateContext must be used within a StateProvider');
    }
    return context;
  };

  return { StateProvider, useStateContext };
}

// Async action handler with built-in error handling
export function useAsyncAction<T extends BaseState>(
  actions: StateContextValue<T>['actions']
) {
  const executeAsync = useCallback(async (
    asyncFn: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
      showSuccess?: boolean;
      successMessage?: string;
    }
  ) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const result = await asyncFn();

      if (options?.showSuccess !== false) {
        actions.setSuccess(true);
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      actions.setError(errorMessage);
      options?.onError?.(error as Error);
      return null;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  return { executeAsync };
}

// Auto-clear success/error states after a delay
export function useAutoReset<T extends BaseState>(
  state: T,
  actions: StateContextValue<T>['actions'],
  options?: {
    successDelay?: number;
    errorDelay?: number;
  }
) {
  const { successDelay = 3000, errorDelay = 5000 } = options || {};

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        actions.clearSuccess();
      }, successDelay);
      return () => clearTimeout(timer);
    }
  }, [state.success, actions, successDelay]);

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        actions.clearError();
      }, errorDelay);
      return () => clearTimeout(timer);
    }
  }, [state.error, actions, errorDelay]);
}

// Optimistic updates helper
export function useOptimisticUpdate<T extends BaseState, D>(
  state: T,
  dispatch: React.Dispatch<BaseAction>,
  actions: StateContextValue<T>['actions']
) {
  const performOptimisticUpdate = useCallback(async (
    optimisticData: D,
    asyncFn: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
      revertOnError?: boolean;
    }
  ) => {
    const originalData = state.data;

    try {
      // Apply optimistic update immediately
      dispatch({
        type: 'SET_DATA',
        payload: optimisticData,
      });

      // Perform async operation
      const result = await asyncFn();

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (options?.revertOnError !== false) {
        dispatch({
          type: 'SET_DATA',
          payload: originalData,
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      actions.setError(errorMessage);
      options?.onError?.(error as Error);
      return null;
    }
  }, [state.data, dispatch, actions]);

  return { performOptimisticUpdate };
}

// Debounced state updates
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = React.useState(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [immediateValue, delay]);

  return [immediateValue, debouncedValue, setImmediateValue];
}

// Local storage persistence
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setState(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setValue];
}

// Example usage for a specific component state
export interface WorkoutState extends BaseState {
  workouts: any[];
  selectedWorkout: any | null;
  filters: {
    type: string;
    duration: number;
    difficulty: string;
  };
}

const initialWorkoutState: WorkoutState = {
  loading: false,
  error: null,
  success: false,
  data: null,
  workouts: [],
  selectedWorkout: null,
  filters: {
    type: '',
    duration: 30,
    difficulty: '',
  },
};

// Custom reducer for workout-specific actions
function workoutReducer(state: WorkoutState, action: BaseAction): WorkoutState {
  switch (action.type) {
    case 'SET_WORKOUTS':
      return {
        ...state,
        workouts: action.payload,
        data: action.payload,
      };

    case 'SELECT_WORKOUT':
      return {
        ...state,
        selectedWorkout: action.payload,
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

// Export the workout state provider
export const { StateProvider: WorkoutStateProvider, useStateContext: useWorkoutState } = 
  createStateProvider(initialWorkoutState, workoutReducer);
