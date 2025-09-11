/**
 * TypeScript Utility Types for Enhanced Type Safety
 * 
 * This file contains advanced utility types that improve type safety
 * and developer experience across the application.
 */

// =============================================================================
// STRICT UTILITY TYPES
// =============================================================================

/**
 * Make all properties required and non-nullable
 */
export type StrictRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReadonlyArray<U>
    : T[P] extends Record<string, any>
    ? DeepReadonly<T[P]>
    : T[P];
};

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartialArray<U>
    : T[P] extends Record<string, any>
    ? DeepPartial<T[P]>
    : T[P];
};

interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Exact type - prevents excess properties
 */
export type Exact<T, U extends T> = T & Record<Exclude<keyof U, keyof T>, never>;

// =============================================================================
// API UTILITY TYPES
// =============================================================================

/**
 * API request state
 */
export type ApiRequestState = 'idle' | 'loading' | 'success' | 'error';

/**
 * API response wrapper with enhanced error handling
 */
export interface ApiResult<TData, TError = string> {
  data?: TData;
  error?: TError;
  loading: boolean;
  success: boolean;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export type FilterConfig<T> = {
  [K in keyof T]?: T[K] | T[K][] | { min?: T[K]; max?: T[K] };
};

// =============================================================================
// FORM UTILITY TYPES
// =============================================================================

/**
 * Form field state
 */
export interface FormFieldState<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * Form state for any object
 */
export type FormState<T> = {
  [K in keyof T]: FormFieldState<T[K]>;
};

/**
 * Form validation rules
 */
export interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
  message?: string;
}

/**
 * Form validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// =============================================================================
// EVENT UTILITY TYPES
// =============================================================================

/**
 * Event handler types with proper typing
 */
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Custom event data
 */
export interface CustomEventData<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string;
}

// =============================================================================
// COMPONENT UTILITY TYPES
// =============================================================================

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component variant types
 */
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
  id?: string;
}

/**
 * Props with loading state
 */
export interface WithLoadingProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Props with error state
 */
export interface WithErrorProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

/**
 * Polymorphic component props
 */
export type PolymorphicComponentProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

// =============================================================================
// THEME UTILITY TYPES
// =============================================================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Color palette
 */
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    neutral: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string[]>;
    fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;
  };
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
}

// =============================================================================
// PERFORMANCE UTILITY TYPES
// =============================================================================

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

/**
 * Performance observer entry
 */
export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

// =============================================================================
// UTILITY FUNCTIONS FOR TYPE GUARDS
// =============================================================================

/**
 * Type guard for non-null values
 */
export const isNotNull = <T>(value: T | null): value is T => value !== null;

/**
 * Type guard for non-undefined values
 */
export const isNotUndefined = <T>(value: T | undefined): value is T => value !== undefined;

/**
 * Type guard for non-nullish values
 */
export const isNotNullish = <T>(value: T | null | undefined): value is T => 
  value !== null && value !== undefined;

/**
 * Type guard for strings
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Type guard for numbers
 */
export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

/**
 * Type guard for booleans
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Type guard for objects
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Type guard for arrays
 */
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);

/**
 * Type guard for functions
 */
export const isFunction = (value: unknown): value is Function => typeof value === 'function';

/**
 * Type guard for promises
 */
export const isPromise = <T>(value: unknown): value is Promise<T> =>
  value instanceof Promise || (isObject(value) && isFunction((value as any).then));

/**
 * Type guard for errors
 */
export const isError = (value: unknown): value is Error => value instanceof Error;

// =============================================================================
// BRANDED TYPES FOR ENHANCED TYPE SAFETY
// =============================================================================

/**
 * Brand type for creating nominal types
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * User ID type
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Workout ID type
 */
export type WorkoutId = Brand<string, 'WorkoutId'>;

/**
 * Equipment ID type
 */
export type EquipmentId = Brand<string, 'EquipmentId'>;

/**
 * Email type
 */
export type Email = Brand<string, 'Email'>;

/**
 * URL type
 */
export type URL = Brand<string, 'URL'>;

/**
 * Timestamp type
 */
export type Timestamp = Brand<number, 'Timestamp'>;

// =============================================================================
// CONDITIONAL TYPES
// =============================================================================

/**
 * Extract function parameters
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * Extract promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Extract object values type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
