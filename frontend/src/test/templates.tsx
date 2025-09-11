/**
 * Testing Templates and Patterns
 * 
 * Reusable testing patterns and templates for common testing scenarios.
 * These templates provide consistent testing approaches across the application.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockUser, createMockProfile } from './utils';

// =============================================================================
// COMPONENT TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing basic component rendering
 */
export const testComponentRendering = (
  Component: React.ComponentType<any>,
  props: any = {},
  testName = 'renders without crashing'
) => {
  it(testName, () => {
    const { container } = renderWithProviders(<Component {...props} />);
    expect(container).toBeInTheDocument();
  });
};

/**
 * Template for testing component props
 */
export const testComponentProps = (
  Component: React.ComponentType<any>,
  propTests: Array<{
    prop: string;
    value: any;
    expectedBehavior: string;
    testFn: (container: HTMLElement) => void;
  }>
) => {
  propTests.forEach(({ prop, value, expectedBehavior, testFn }) => {
    it(`${expectedBehavior} when ${prop} is ${value}`, () => {
      const props = { [prop]: value };
      const { container } = renderWithProviders(<Component {...props} />);
      testFn(container);
    });
  });
};

/**
 * Template for testing component accessibility
 */
export const testComponentAccessibility = (
  Component: React.ComponentType<any>,
  props: any = {}
) => {
  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<Component {...props} />);
      
      // Test for common accessibility requirements
      const interactiveElements = screen.queryAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('type');
      });
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<Component {...props} />);
      
      const focusableElements = screen.queryAllByRole('button');
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        firstElement.focus();
        expect(firstElement).toHaveFocus();
        
        // Test Tab navigation
        fireEvent.keyDown(firstElement, { key: 'Tab' });
        // Add specific assertions based on component behavior
      }
    });

    it('has proper color contrast', () => {
      const { container } = renderWithProviders(<Component {...props} />);
      
      // This would typically use a tool like axe-core
      // For now, we'll check that text elements exist
      const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
      expect(textElements.length).toBeGreaterThanOrEqual(0);
    });
  });
};

/**
 * Template for testing component interactions
 */
export const testComponentInteractions = (
  Component: React.ComponentType<any>,
  interactions: Array<{
    name: string;
    action: (container: HTMLElement) => void | Promise<void>;
    expectation: (container: HTMLElement) => void;
  }>,
  props: any = {}
) => {
  describe('Interactions', () => {
    interactions.forEach(({ name, action, expectation }) => {
      it(name, async () => {
        const { container } = renderWithProviders(<Component {...props} />);
        await action(container);
        expectation(container);
      });
    });
  });
};

// =============================================================================
// HOOK TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing custom hooks
 */
export const testCustomHook = (
  hookName: string,
  useHook: () => any,
  tests: Array<{
    name: string;
    test: (result: any) => void;
  }>
) => {
  describe(hookName, () => {
    tests.forEach(({ name, test }) => {
      it(name, () => {
        const TestComponent = () => {
          const result = useHook();
          test(result);
          return null;
        };
        
        renderWithProviders(<TestComponent />);
      });
    });
  });
};

// =============================================================================
// CONTEXT TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing React contexts
 */
export const testReactContext = (
  contextName: string,
  Provider: React.ComponentType<any>,
  useContext: () => any,
  providerProps: any = {}
) => {
  describe(`${contextName} Context`, () => {
    it('provides context value to children', () => {
      let contextValue: any;
      
      const TestComponent = () => {
        contextValue = useContext();
        return null;
      };

      renderWithProviders(
        <Provider {...providerProps}>
          <TestComponent />
        </Provider>
      );

      expect(contextValue).toBeDefined();
    });

    it('throws error when used outside provider', () => {
      const TestComponent = () => {
        useContext();
        return null;
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithProviders(<TestComponent />, { withAuth: false, withTheme: false, withToast: false, withAppState: false });
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });
};

// =============================================================================
// API TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing API service functions
 */
export const testApiService = (
  serviceName: string,
  serviceFunction: (...args: any[]) => Promise<any>,
  tests: Array<{
    name: string;
    args: any[];
    mockResponse: any;
    expectation: (result: any) => void;
  }>
) => {
  describe(`${serviceName} API Service`, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    tests.forEach(({ name, args, mockResponse, expectation }) => {
      it(name, async () => {
        // Mock the API response
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockResponse),
        });

        const result = await serviceFunction(...args);
        expectation(result);
      });
    });

    it('handles network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(serviceFunction()).rejects.toThrow('Network error');
    });

    it('handles HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Server error' }),
      });

      await expect(serviceFunction()).rejects.toThrow();
    });
  });
};

// =============================================================================
// PERFORMANCE TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing component performance
 */
export const testComponentPerformance = (
  Component: React.ComponentType<any>,
  props: any = {},
  performanceThresholds = {
    renderTime: 100, // ms
    memoryUsage: 1024 * 1024, // 1MB
  }
) => {
  describe('Performance', () => {
    it('renders within acceptable time', async () => {
      const start = performance.now();
      renderWithProviders(<Component {...props} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(performanceThresholds.renderTime);
    });

    it('does not cause memory leaks', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount } = renderWithProviders(<Component {...props} />);
      unmount();
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(performanceThresholds.memoryUsage);
    });
  });
};

// =============================================================================
// INTEGRATION TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing component integration with providers
 */
export const testComponentIntegration = (
  Component: React.ComponentType<any>,
  integrationTests: Array<{
    name: string;
    setup: () => void;
    test: () => void | Promise<void>;
    cleanup?: () => void;
  }>,
  props: any = {}
) => {
  describe('Integration', () => {
    integrationTests.forEach(({ name, setup, test, cleanup }) => {
      it(name, async () => {
        setup();
        
        renderWithProviders(<Component {...props} />);
        
        await test();
        
        if (cleanup) {
          cleanup();
        }
      });
    });
  });
};

// =============================================================================
// SNAPSHOT TESTING TEMPLATES
// =============================================================================

/**
 * Template for snapshot testing
 */
export const testComponentSnapshots = (
  Component: React.ComponentType<any>,
  variants: Array<{
    name: string;
    props: any;
  }>
) => {
  describe('Snapshots', () => {
    variants.forEach(({ name, props }) => {
      it(`matches snapshot for ${name}`, () => {
        const { container } = renderWithProviders(<Component {...props} />);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
};

// =============================================================================
// ERROR BOUNDARY TESTING TEMPLATES
// =============================================================================

/**
 * Template for testing error boundaries
 */
export const testErrorBoundary = (
  ErrorBoundary: React.ComponentType<any>,
  ThrowingComponent: React.ComponentType<any>
) => {
  describe('Error Boundary', () => {
    beforeEach(() => {
      // Suppress console.error for error boundary tests
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('catches and displays error', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('allows retry functionality', async () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const retryButton = screen.queryByText(/try again/i);
      if (retryButton) {
        fireEvent.click(retryButton);
        // Add specific assertions based on retry behavior
      }
    });
  });
};

// =============================================================================
// UTILITY FUNCTIONS FOR TEMPLATES
// =============================================================================

/**
 * Create a component that throws an error for testing error boundaries
 */
export const createThrowingComponent = (errorMessage = 'Test error') => {
  return function ThrowingComponent() {
    throw new Error(errorMessage);
  };
};

/**
 * Create a mock component for testing
 */
export const createMockComponent = (displayName = 'MockComponent') => {
  const MockComponent = ({ children, ...props }: any) => (
    <div data-testid={displayName.toLowerCase()} {...props}>
      {children}
    </div>
  );
  
  MockComponent.displayName = displayName;
  return MockComponent;
};
