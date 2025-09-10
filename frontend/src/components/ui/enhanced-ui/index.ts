/**
 * Enhanced UI Component Library
 * 
 * A comprehensive collection of modern, accessible, and performant UI components
 * designed to rival leading tech companies' design systems.
 */

// Micro-interactions and animations
export {
  FloatingActionButton,
  InteractiveCard,
  AnimatedCounter,
  ProgressRing,
  StaggerContainer,
  type FloatingActionButtonProps,
  type InteractiveCardProps,
  type AnimatedCounterProps,
  type ProgressRingProps,
  type StaggerContainerProps,
} from '../EnhancedMicroInteractions';

// Loading states and skeletons
export {
  Skeleton,
  PulsingDots,
  Spinner,
  ProgressBar,
  CardSkeleton,
  LoadingOverlay,
  WorkoutGenerationLoader,
  type SkeletonProps,
  type PulsingDotsProps,
  type SpinnerProps,
  type ProgressBarProps,
  type CardSkeletonProps,
  type LoadingOverlayProps,
} from '../EnhancedLoadingStates';

// Component composition system
export {
  Container,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Grid,
  Section,
  type ContainerProps,
  type StackProps,
  type CardProps,
  type GridProps,
  type SectionProps,
} from '../CompositionSystem';

// Accessibility enhancements
export {
  AccessibilityProvider,
  useAccessibility,
  SkipLinks,
  FocusTrap,
  useKeyboardNavigation,
  LiveRegion,
  AccessibleButton,
  HighContrastToggle,
  type FocusTrapProps,
  type LiveRegionProps,
  type AccessibleButtonProps,
} from '../AccessibilityEnhanced';

// Premium UI polish
export {
  Toast,
  ToastContainer,
  ErrorFallback,
  PremiumLoadingOverlay,
  SuccessCelebration,
  type ToastProps,
  type ErrorFallbackProps,
  type LoadingOverlayProps,
} from '../PremiumUIPolish';

// Re-export existing enhanced components
export * from '../enhanced';
