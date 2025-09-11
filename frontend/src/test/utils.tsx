/**
 * Testing Utilities for AI Workout Frontend
 * 
 * Comprehensive testing utilities to make testing easier and more consistent
 * across the application. Includes custom render functions, mock factories,
 * and testing helpers.
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import type { User, Profile, WorkoutPlan, Equipment } from '../types/api';

// =============================================================================
// CUSTOM RENDER FUNCTIONS
// =============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withAuth?: boolean;
  withTheme?: boolean;
  withToast?: boolean;
  withAppState?: boolean;
  withRouter?: boolean;
}

/**
 * Custom render function with all providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    initialEntries = ['/'],
    withAuth = true,
    withTheme = true,
    withToast = true,
    withAppState = true,
    withRouter = true,
    ...renderOptions
  } = options;

  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let wrapped = children;

    if (withAppState) {
      wrapped = <AppStateProvider>{wrapped}</AppStateProvider>;
    }

    if (withAuth) {
      wrapped = <AuthProvider>{wrapped}</AuthProvider>;
    }

    if (withTheme) {
      wrapped = <ThemeProvider>{wrapped}</ThemeProvider>;
    }

    if (withToast) {
      wrapped = <ToastProvider>{wrapped}</ToastProvider>;
    }

    if (withRouter) {
      wrapped = (
        <BrowserRouter>
          {wrapped}
        </BrowserRouter>
      );
    }

    return <>{wrapped}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

/**
 * Render component with only router
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  return renderWithProviders(ui, {
    ...options,
    withAuth: false,
    withTheme: false,
    withToast: false,
    withAppState: false,
    withRouter: true,
  });
};

/**
 * Render component with auth context
 */
export const renderWithAuth = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  return renderWithProviders(ui, {
    ...options,
    withAuth: true,
    withTheme: false,
    withToast: false,
    withAppState: false,
    withRouter: false,
  });
};

// =============================================================================
// MOCK FACTORIES
// =============================================================================

/**
 * Create a mock user object
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  firebaseUid: 'firebase-uid-123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Create a mock profile object
 */
export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'profile-123',
  userId: 'user-123',
  experience: 'beginner',
  goals: ['weight_loss'],
  equipmentAvailable: ['bodyweight'],
  sex: 'prefer_not_to_say',
  constraints: [],
  health_ack: true,
  data_consent: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Create a mock workout plan object
 */
export const createMockWorkoutPlan = (overrides: Partial<WorkoutPlan> = {}): WorkoutPlan => ({
  id: 'workout-123',
  userId: 'user-123',
  name: 'Test Workout',
  description: 'A test workout plan',
  type: 'full_body',
  duration: 30,
  difficulty: 'beginner',
  exercises: [
    {
      id: 'exercise-1',
      name: 'Push-ups',
      description: 'Standard push-ups',
      category: 'strength',
      muscleGroups: ['chest', 'triceps'],
      equipment: ['bodyweight'],
      instructions: ['Get in plank position', 'Lower body', 'Push up'],
      sets: 3,
      reps: 10,
      duration: null,
      restTime: 60,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Create a mock equipment object
 */
export const createMockEquipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 'equipment-123',
  name: 'Dumbbells',
  category: 'weights',
  description: 'Adjustable dumbbells',
  ...overrides,
});

// =============================================================================
// TESTING HELPERS
// =============================================================================

/**
 * Wait for element to be removed from DOM
 */
export const waitForElementToBeRemoved = async (element: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

/**
 * Mock intersection observer for testing
 */
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  return mockIntersectionObserver;
};

/**
 * Mock resize observer for testing
 */
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });

  return mockResizeObserver;
};

/**
 * Mock matchMedia for responsive testing
 */
export const mockMatchMedia = (matches = false) => {
  const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  return mockMatchMedia;
};

/**
 * Mock local storage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
};

/**
 * Mock fetch for API testing
 */
export const mockFetch = (response: any, status = 200) => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });

  global.fetch = mockFetch;
  return mockFetch;
};

/**
 * Create a mock event
 */
export const createMockEvent = <T extends Event>(
  type: string,
  properties: Partial<T> = {}
): T => {
  const event = new Event(type) as T;
  Object.assign(event, properties);
  return event;
};

/**
 * Simulate user interaction delay
 */
export const simulateDelay = (ms = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Assert that element has accessible name
 */
export const expectAccessibleName = (element: HTMLElement, name: string) => {
  const accessibleName = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        element.textContent;
  expect(accessibleName).toContain(name);
};

/**
 * Assert that element is focusable
 */
export const expectFocusable = (element: HTMLElement) => {
  expect(element.tabIndex).toBeGreaterThanOrEqual(0);
};

/**
 * Assert that element has proper ARIA attributes
 */
export const expectProperARIA = (element: HTMLElement, role?: string) => {
  if (role) {
    expect(element).toHaveAttribute('role', role);
  }
  
  // Check for required ARIA attributes based on role
  const elementRole = element.getAttribute('role') || element.tagName.toLowerCase();
  
  switch (elementRole) {
    case 'button':
      expect(element).toHaveAttribute('type');
      break;
    case 'input':
      expect(element).toHaveAttribute('type');
      break;
    case 'dialog':
      expect(element).toHaveAttribute('aria-labelledby');
      break;
  }
};

// =============================================================================
// PERFORMANCE TESTING HELPERS
// =============================================================================

/**
 * Measure component render time
 */
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

/**
 * Test component memory usage
 */
export const testMemoryUsage = (component: React.ComponentType) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const { unmount } = render(React.createElement(component));
  const afterRenderMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  unmount();
  const afterUnmountMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return {
    renderMemoryIncrease: afterRenderMemory - initialMemory,
    memoryLeakage: afterUnmountMemory - initialMemory,
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export everything from testing library for convenience
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export { vi } from 'vitest';
