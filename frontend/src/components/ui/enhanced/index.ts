/**
 * Enhanced Component Architecture System
 * 
 * This module exports a comprehensive set of enhanced components and utilities
 * that provide a modern, type-safe, and performant foundation for building
 * sophisticated user interfaces.
 * 
 * Key Features:
 * - Component Composition: Flexible, reusable component patterns
 * - Form System: Advanced form handling with validation and accessibility
 * - State Management: Type-safe state management with optimizations
 * - Hook System: Reusable hooks for common component logic
 * - Performance Optimizations: Built-in performance best practices
 * - Accessibility: WCAG-compliant components by default
 */

// Component Composition System
export {
  Container,
  Section,
  Grid,
  CompositionProvider,
  useComposition,
  type BaseComponentProps,
  type ContainerProps,
  type SectionProps,
  type GridProps,
  type CompositionProviderProps,
} from './ComponentComposition';

// Enhanced Form System
export {
  FormProvider,
  FormField,
  FormActions,
  FormGroup,
  useFormContext,
  type FormProviderProps,
  type FormFieldProps,
  type FormActionsProps,
  type FormGroupProps,
} from './FormSystem';

// State Management System
export {
  createStateProvider,
  createBaseReducer,
  useAsyncAction,
  useAutoReset,
  useOptimisticUpdate,
  useDebouncedState,
  usePersistedState,
  WorkoutStateProvider,
  useWorkoutState,
  COMMON_ACTIONS,
  type BaseState,
  type BaseAction,
  type WorkoutState,
} from './StateManagement';

// Enhanced Hook System
export {
  useToggle,
  useFormValidation,
  useIntersectionObserver,
  useMediaQuery,
  useBreakpoints,
  useKeyboardNavigation,
  useFocusManagement,
  useAnimation,
  useRouteManagement,
} from './HookSystem';

// Mobile-First Components
export {
  TouchTarget,
  SwipeableCard,
  MobileCarousel,
  BottomSheet,
  type TouchTargetProps,
  type SwipeableCardProps,
  type MobileCarouselProps,
  type BottomSheetProps,
} from './MobileFirst';

// Responsive Layout Components
export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  MobileNavigation,
  ResponsiveText,
  type ResponsiveContainerProps,
  type ResponsiveGridProps,
  type ResponsiveStackProps,
  type MobileNavigationProps,
  type ResponsiveTextProps,
} from './ResponsiveLayout';

// Touch Interaction Components
export {
  PullToRefresh,
  SwipeActions,
  LongPress,
  TouchButton,
  type PullToRefreshProps,
  type SwipeActionsProps,
  type LongPressProps,
  type TouchButtonProps,
} from './TouchInteractions';

// Performance-Optimized Components
export {
  OptimizedFadeIn,
  OptimizedSpinner,
  OptimizedSkeleton,
  OptimizedStagger,
  OptimizedHoverScale,
  OptimizedProgress,
  OptimizedSlideIn,
  OptimizedParallax,
  type OptimizedFadeInProps,
  type OptimizedSpinnerProps,
  type OptimizedSkeletonProps,
  type OptimizedStaggerProps,
  type OptimizedHoverScaleProps,
  type OptimizedProgressProps,
  type OptimizedSlideInProps,
  type OptimizedParallaxProps,
} from './PerformanceOptimized';

// Animation Utilities
export {
  easingFunctions,
  springConfigs,
  usePerformanceMonitor,
  useOptimizedSpring,
  createGPUOptimizedVariants,
  createStaggerVariants,
  useParallaxScroll,
  useOptimizedInView,
  createSequentialAnimation,
  microInteractionVariants,
  loadingVariants,
  createResponsiveAnimation,
} from './AnimationUtils';

// Optimized Loading Components
export {
  OptimizedDots,
  OptimizedPulse,
  OptimizedProgressBar,
  OptimizedLoadingOverlay,
  type OptimizedDotsProps,
  type OptimizedPulseProps,
  type OptimizedProgressBarProps,
  type OptimizedLoadingOverlayProps,
} from './OptimizedLoading';

// Re-export commonly used types for convenience
export type {
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  FormHTMLAttributes,
} from 'react';

// Utility types for enhanced component development
export type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type Size = 'sm' | 'md' | 'lg';
export type Color = 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning' | 'error';
export type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// Component composition utilities
export interface ComponentWithVariants<T extends string = string> {
  variant?: T;
}

export interface ComponentWithSize {
  size?: Size;
}

export interface ComponentWithColor {
  color?: Color;
}

export interface ComponentWithSpacing {
  spacing?: Spacing;
}

export interface ComponentWithAnimation {
  animate?: boolean;
  animationDelay?: number;
  animationDuration?: number;
}

export interface ComponentWithAccessibility {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  role?: string;
}

// Compound component props for flexible composition
export type CompoundComponentProps<T = {}> = T & {
  children?: React.ReactNode;
  className?: string;
} & ComponentWithAnimation & ComponentWithAccessibility;

// Enhanced event handlers with better typing
export type EnhancedClickHandler<T = HTMLElement> = (
  event: React.MouseEvent<T>,
  context?: { [key: string]: any }
) => void;

export type EnhancedChangeHandler<T = HTMLInputElement> = (
  event: React.ChangeEvent<T>,
  value: any,
  context?: { [key: string]: any }
) => void;

export type EnhancedSubmitHandler<T = HTMLFormElement> = (
  event: React.FormEvent<T>,
  data: any,
  context?: { [key: string]: any }
) => void;

// Performance optimization utilities
import React from 'react';

export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => React.memo(Component, propsAreEqual);

export const withCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => React.useCallback(callback, deps);

export const withMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => React.useMemo(factory, deps);

// Component development best practices
export const COMPONENT_BEST_PRACTICES = {
  // Always use forwardRef for components that might need ref access
  USE_FORWARD_REF: 'Use React.forwardRef for components that render DOM elements',
  
  // Provide meaningful display names for debugging
  SET_DISPLAY_NAME: 'Set displayName for better debugging experience',
  
  // Use TypeScript for better type safety
  USE_TYPESCRIPT: 'Use TypeScript interfaces for props and state',
  
  // Implement proper accessibility
  ACCESSIBILITY_FIRST: 'Implement ARIA attributes and keyboard navigation',
  
  // Optimize performance with memoization
  OPTIMIZE_PERFORMANCE: 'Use React.memo, useMemo, and useCallback appropriately',
  
  // Follow composition over inheritance
  COMPOSITION_PATTERN: 'Use composition patterns for flexible component APIs',
  
  // Provide consistent styling APIs
  CONSISTENT_STYLING: 'Use consistent variant, size, and color props',
  
  // Handle loading and error states
  HANDLE_STATES: 'Provide loading, error, and empty states',
  
  // Support theming and customization
  SUPPORT_THEMING: 'Support theme customization and CSS custom properties',
  
  // Write comprehensive tests
  WRITE_TESTS: 'Write unit and integration tests for components',
} as const;

// Development utilities for component testing and debugging
export const createMockProps = <T extends object>(
  defaultProps: T,
  overrides?: Partial<T>
): T => ({
  ...defaultProps,
  ...overrides,
});

export const createTestId = (componentName: string, element?: string): string => {
  return element ? `${componentName}-${element}` : componentName;
};

// Accessibility Components
export {
  SkipLink,
  AccessibleButton,
  AccessibleFormField,
  AccessibleModal,
  AccessibleNotification,
  type SkipLinkProps,
  type AccessibleButtonProps,
  type AccessibleFormFieldProps,
  type AccessibleModalProps,
  type AccessibleNotificationProps,
} from './AccessibilityComponents';

// Keyboard Navigation Components
export {
  useFocusTrap,
  useArrowNavigation,
  KeyboardNavigableList,
  useKeyboardShortcuts,
  KeyboardDropdown,
  KeyboardTabs,
  type KeyboardNavigableListProps,
  type KeyboardDropdownProps,
  type KeyboardTabsProps,
} from './KeyboardNavigation';

// Screen Reader Utilities
export {
  ScreenReaderOnly,
  LiveRegion,
  useScreenReaderAnnouncement,
  AccessibleProgress,
  AccessibleStatus,
  ValidationSummary,
  AccessibleBreadcrumb,
  AccessibleTable,
  type ScreenReaderOnlyProps,
  type LiveRegionProps,
  type AccessibleProgressProps,
  type AccessibleStatusProps,
  type ValidationSummaryProps,
  type BreadcrumbItem,
  type AccessibleBreadcrumbProps,
  type AccessibleTableProps,
} from './ScreenReaderUtils';

// Visual Polish Components
export {
  shadowStyles,
  gradientStyles,
  GlassCard,
  PremiumButton,
  PremiumCard,
  spacing as visualSpacing,
  VisualHeading,
  VisualSeparator,
  PremiumLoading,
  type GlassCardProps,
  type PremiumButtonProps,
  type PremiumCardProps,
  type VisualHeadingProps,
  type VisualSeparatorProps,
  type PremiumLoadingProps,
} from './VisualPolish';

// Design Tokens
export {
  colors,
  typography,
  spacing as designSpacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  components,
  designTokens,
} from './DesignTokens';

// Export React for convenience
export { React };
