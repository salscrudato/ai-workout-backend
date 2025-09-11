/**
 * Global type definitions for the AI Workout application
 * 
 * This file contains:
 * - Global type augmentations
 * - Environment variable types
 * - Window object extensions
 * - Third-party library type extensions
 */

// Environment Variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_API_BASE_URL?: string;
  }
}

// Vite Environment Variables
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_API_BASE_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window object extensions
declare global {
  interface Window {
    // Error reporting service (e.g., Sentry, LogRocket)
    errorReportingService?: {
      captureException: (error: Error, context?: Record<string, any>) => void;
      captureMessage: (message: string, level?: string) => void;
      setUser: (user: { id: string; email?: string }) => void;
      setTag: (key: string, value: string) => void;
      setContext: (key: string, context: Record<string, any>) => void;
    };

    // Analytics service (e.g., Google Analytics, Mixpanel)
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      page: (name?: string, properties?: Record<string, any>) => void;
    };

    // Performance monitoring
    performance: Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
  }
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export type ErrorBoundaryLevel = 'global' | 'page' | 'component';

// Form Types
export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface FormField<T = FormFieldValue> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

// Event Handler Types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Firebase Types Extensions
declare module 'firebase/auth' {
  interface User {
    // Add any custom properties if needed
  }
}

// React Hook Form Types
declare module 'react-hook-form' {
  interface FieldError {
    message?: string;
    type?: string;
  }
}

// Tailwind CSS IntelliSense
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Asset Types
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// JSON Modules
declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

export {};
