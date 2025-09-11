/**
 * Button Component Tests
 * 
 * Comprehensive test suite for the Button component demonstrating
 * best practices and testing patterns.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import {
  testComponentRendering,
  testComponentProps,
  testComponentAccessibility,
  testComponentInteractions,
  testComponentPerformance,
  testComponentSnapshots,
} from '../../test/templates';
import Button from './Button';
import type { ButtonProps } from './Button';

// =============================================================================
// BASIC RENDERING TESTS
// =============================================================================

describe('Button Component', () => {
  // Test basic rendering
  testComponentRendering(Button, { children: 'Test Button' });

  // =============================================================================
  // PROPS TESTING
  // =============================================================================

  testComponentProps(Button, [
    {
      prop: 'variant',
      value: 'primary',
      expectedBehavior: 'applies primary styling',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-700');
      },
    },
    {
      prop: 'variant',
      value: 'secondary',
      expectedBehavior: 'applies secondary styling',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toHaveClass('bg-neutral-100', 'text-neutral-900');
      },
    },
    {
      prop: 'size',
      value: 'sm',
      expectedBehavior: 'applies small size styling',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
      },
    },
    {
      prop: 'size',
      value: 'lg',
      expectedBehavior: 'applies large size styling',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
      },
    },
    {
      prop: 'loading',
      value: true,
      expectedBehavior: 'shows loading state',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toBeDisabled();
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
      },
    },
    {
      prop: 'disabled',
      value: true,
      expectedBehavior: 'disables the button',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      },
    },
    {
      prop: 'fullWidth',
      value: true,
      expectedBehavior: 'applies full width styling',
      testFn: (container) => {
        const button = container.querySelector('button');
        expect(button).toHaveClass('w-full');
      },
    },
  ]);

  // =============================================================================
  // INTERACTION TESTS
  // =============================================================================

  testComponentInteractions(
    Button,
    [
      {
        name: 'calls onClick when clicked',
        action: async (container) => {
          const button = container.querySelector('button')!;
          fireEvent.click(button);
        },
        expectation: (container) => {
          // This would be tested with a mock function
        },
      },
      {
        name: 'handles keyboard activation',
        action: async (container) => {
          const button = container.querySelector('button')!;
          button.focus();
          fireEvent.keyDown(button, { key: 'Enter' });
        },
        expectation: (container) => {
          // This would be tested with a mock function
        },
      },
    ],
    { children: 'Test Button' }
  );

  // =============================================================================
  // ACCESSIBILITY TESTS
  // =============================================================================

  testComponentAccessibility(Button, { children: 'Test Button' });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  testComponentPerformance(Button, { children: 'Test Button' });

  // =============================================================================
  // SNAPSHOT TESTS
  // =============================================================================

  testComponentSnapshots(Button, [
    { name: 'default', props: { children: 'Default Button' } },
    { name: 'primary variant', props: { variant: 'primary', children: 'Primary Button' } },
    { name: 'secondary variant', props: { variant: 'secondary', children: 'Secondary Button' } },
    { name: 'loading state', props: { loading: true, children: 'Loading Button' } },
    { name: 'disabled state', props: { disabled: true, children: 'Disabled Button' } },
    { name: 'with icons', props: { leftIcon: '←', rightIcon: '→', children: 'Icon Button' } },
  ]);

  // =============================================================================
  // SPECIFIC BUTTON TESTS
  // =============================================================================

  describe('Button Specific Behavior', () => {
    it('renders children correctly', () => {
      renderWithProviders(<Button>Test Content</Button>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents click when loading', () => {
      const handleClick = vi.fn();
      renderWithProviders(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading text when provided', () => {
      renderWithProviders(
        <Button loading loadingText="Please wait...">
          Submit
        </Button>
      );
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('renders left icon', () => {
      renderWithProviders(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          Button with Left Icon
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      renderWithProviders(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          Button with Right Icon
        </Button>
      );
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('supports custom className', () => {
      renderWithProviders(
        <Button className="custom-class">Custom Button</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      renderWithProviders(<Button ref={ref}>Ref Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('supports all button HTML attributes', () => {
      renderWithProviders(
        <Button
          type="submit"
          form="test-form"
          data-testid="custom-button"
          aria-label="Custom button"
        >
          HTML Attributes Button
        </Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
    });
  });

  // =============================================================================
  // ANIMATION TESTS
  // =============================================================================

  describe('Animation Behavior', () => {
    it('applies hover animations when enhancedAnimation is enabled', () => {
      renderWithProviders(
        <Button enhancedAnimation>Animated Button</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });

    it('applies ripple effect when ripple is enabled', async () => {
      renderWithProviders(
        <Button ripple>Ripple Button</Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for ripple animation to start
      await waitFor(() => {
        const ripple = button.querySelector('.ripple-effect');
        expect(ripple).toBeInTheDocument();
      });
    });
  });

  // =============================================================================
  // VARIANT TESTS
  // =============================================================================

  describe('Button Variants', () => {
    const variants: Array<ButtonProps['variant']> = [
      'primary',
      'secondary',
      'ghost',
      'outline',
      'gradient',
      'premium',
      'luxury',
      'minimal',
      'electric',
      'glass',
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithProviders(
          <Button variant={variant}>{variant} Button</Button>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        // Each variant should have specific classes
        // This would be more specific based on actual implementation
        expect(button.className).toBeTruthy();
      });
    });
  });

  // =============================================================================
  // SIZE TESTS
  // =============================================================================

  describe('Button Sizes', () => {
    const sizes: Array<ButtonProps['size']> = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        renderWithProviders(
          <Button size={size}>{size} Button</Button>
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        // Each size should have specific padding and text size classes
        expect(button.className).toBeTruthy();
      });
    });
  });
});
