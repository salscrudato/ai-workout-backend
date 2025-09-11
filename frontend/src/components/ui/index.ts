/**
 * Consolidated UI Component Library
 * 
 * This file exports all essential UI components in a clean, organized manner.
 * Components have been consolidated to remove duplication and improve maintainability.
 */

// Core Components (keep existing, well-designed components)
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Form } from './Form';
export { default as Badge } from './Badge';
export { default as Tooltip } from './Tooltip';
export { default as Typography } from './Typography';

// Layout Components
export { default as AppLayout } from './AppLayout';
export { Container, Stack, Grid, Section, Flex, ContentArea } from './Layout';
export type { ContainerProps, StackProps, GridProps, SectionProps, FlexProps, ContentAreaProps, SpacingScale, ContentDensity, GridColumns } from './Layout';

// Loading Components (consolidated)
export { default as Loading, Skeleton } from './Loading';
export type { LoadingProps, SkeletonProps } from './Loading';

// Accessibility Components (consolidated)
export {
  default as AccessibilityProvider,
  useAccessibility,
  SkipLinks,
  FocusTrap,
  LiveRegion,
  AccessibleButton,
  HighContrastToggle,
} from './Accessibility';
export type {
  AccessibilityProviderProps,
  SkipLinksProps,
  FocusTrapProps,
  LiveRegionProps,
  AccessibleButtonProps,
} from './Accessibility';

// Essential Feedback Components
export { default as Toast } from './Toast';
export { ToastProvider, useToast } from './ToastManager';
export { default as ConnectionStatus } from './ConnectionStatus';

// Workout-Specific Components
export { default as WorkoutCard } from './WorkoutCard';
export { default as ExerciseCard } from './ExerciseCard';
export { default as WorkoutTimer } from './WorkoutTimer';
export { default as WorkoutSession } from './WorkoutSession';

export { default as ProgressCelebration } from './ProgressCelebration';
export { default as TouchFeedback } from './TouchFeedback';
export { default as RestTimer } from '../RestTimer';

// Navigation Components
export { default as BurgerSidebar } from './BurgerSidebar';

// Utility Components
export { default as EmptyState } from './EmptyState';
export { default as OptimizedImage } from './OptimizedImage';
export { default as ThemeToggle } from './ThemeToggle';

// Development/Debug Components (only in development)
export { default as PerformanceDashboard } from './PerformanceDashboard';
export { default as KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

// Animation Components (essential only)
export { default as AnimatedCounter } from './AnimatedCounter';

// Re-export types for convenience
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export type { CardProps, CardVariant } from './Card';
export type { InputProps } from './Input';

/**
 * DEPRECATED COMPONENTS (to be removed)
 * 
 * These components have been consolidated into the above components:
 * - LoadingSpinner -> Loading (variant="spinner")
 * - LoadingSkeleton -> Skeleton
 * - ModernLoadingSkeleton -> Skeleton
 * - EnhancedLoadingStates -> Loading/Skeleton
 * - PremiumLoadingStates -> Loading/Skeleton
 * - SmartLoadingStates -> Loading/Skeleton
 * - SkeletonLoader -> Skeleton
 * - AccessibilityOptimized -> AccessibilityProvider
 * - AccessibilityEnhanced -> AccessibilityProvider
 * - AccessibilityEnhancements -> AccessibilityProvider + components
 * - MobilePerformanceOptimized -> Remove (over-engineered)
 * - PerformanceOptimizations -> Remove (over-engineered)
 * - EnhancedMicroInteractions -> Remove (over-engineered)
 * - EnhancedTouchInteractions -> Remove (over-engineered)
 * - PremiumUIPolish -> Remove (over-engineered)
 * - EnhancedUserFlow -> Remove (over-engineered)
 * - FeatureShowcase -> Remove (demo component)
 * - DesignShowcase -> Remove (demo component)
 * - EnhancedDesignDemo -> Remove (demo component)
 * - CompositionSystem -> Remove (over-engineered)
 * - ConversationalWorkoutGenerator -> Remove (over-engineered)
 * - SmartWorkoutGuide -> Remove (over-engineered)
 * - WorkoutWizard -> Remove (over-engineered)
 * - GuidedTour -> Remove (over-engineered)
 * - OnboardingFlow -> Remove (over-engineered)
 * - NotificationSystem -> Use Toast instead
 * - FeedbackToast -> Use Toast instead
 * - UserPreferences -> Remove (over-engineered)
 * - DataVisualization -> Remove (not used)
 * - ApiHealthCheck -> Remove (debug component)
 * - PullToRefresh -> Remove (over-engineered)
 * - SwipeableCard -> Remove (over-engineered)
 * - TouchableOpacity -> Remove (over-engineered)
 * - MobileCarousel -> Remove (over-engineered)
 * - MobileWorkoutGenerator -> Remove (over-engineered)
 * - MobileWorkoutSession -> Remove (over-engineered)
 * - WorkoutSession -> Keep if actually used
 * - WorkoutFeedback -> Remove (over-engineered)
 * - EnhancedBreadcrumbs -> Remove (not used)
 * - EnhancedPageHeader -> Remove (over-engineered)
 * - EnhancedProgressIndicator -> Remove (over-engineered)
 * - EnhancedStatCard -> Remove (over-engineered)
 * - EnhancedFeedbackSystem -> Remove (over-engineered)
 * - ProgressBar -> Keep simple version
 * - ProgressIndicator -> Consolidate with ProgressBar
 * - StatCard -> Keep simple version
 */
