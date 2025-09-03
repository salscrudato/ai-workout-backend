# AI Workout Application - Architecture Documentation

## Overview

The AI Workout Application is a modern, full-stack web application built with React/TypeScript frontend and Node.js/Express backend, deployed on Firebase. The application provides AI-powered workout generation, user profile management, and workout tracking capabilities.

## Architecture Principles

### 1. **Separation of Concerns**
- Clear separation between frontend and backend responsibilities
- Modular component architecture with single responsibility principle
- Dedicated layers for data access, business logic, and presentation

### 2. **Security First**
- Firebase Authentication with JWT token validation
- Comprehensive input validation and sanitization
- Rate limiting and CORS protection
- Secure Firestore rules with user-based access control

### 3. **Performance Optimization**
- Code splitting and lazy loading for optimal bundle size
- Request caching and deduplication
- Memoized React components to prevent unnecessary re-renders
- Optimized database queries and indexing

### 4. **Type Safety**
- Comprehensive TypeScript usage across the entire stack
- Zod schemas for runtime validation
- Shared type definitions between frontend and backend

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │   Firebase      │
│                 │    │                 │    │                 │
│ • Components    │◄──►│ • Controllers   │◄──►│ • Firestore     │
│ • Contexts      │    │ • Middlewares   │    │ • Auth          │
│ • Services      │    │ • Models        │    │ • Functions     │
│ • Types         │    │ • Validation    │    │ • Hosting       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vite Build    │    │  TypeScript     │    │   OpenAI API    │
│                 │    │  Compilation    │    │                 │
│ • Bundle Split  │    │                 │    │ • GPT-4o-mini   │
│ • Asset Opt.    │    │ • Type Check    │    │ • Workout Gen   │
│ • Cache Bust    │    │ • Validation    │    │ • JSON Schema   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Component Hierarchy
```
App
├── AuthProvider (Context)
├── Router
│   ├── ProtectedRoute
│   ├── ProfileSetupRoute
│   └── Pages (Lazy Loaded)
│       ├── LoginPage
│       ├── DashboardPage
│       ├── ProfileSetupPage
│       ├── WorkoutGeneratorPage
│       ├── WorkoutDetailPage
│       ├── WorkoutHistoryPage
│       └── ProfilePage
└── UI Components
    ├── LoadingSpinner
    ├── RestTimer
    └── Form Components
```

### State Management
- **React Context**: Authentication state, user profile
- **Local State**: Component-specific state with useState/useReducer
- **Form State**: React Hook Form with Zod validation
- **Cache State**: API client with in-memory caching

### Performance Optimizations
- **Code Splitting**: Lazy loading of page components
- **Memoization**: React.memo, useMemo, useCallback for expensive operations
- **Bundle Optimization**: Manual chunk splitting for vendor libraries
- **Asset Optimization**: Optimized images, fonts, and static assets

## Backend Architecture

### Layer Structure
```
┌─────────────────────────────────────────────────────────────┐
│                     Express Application                      │
├─────────────────────────────────────────────────────────────┤
│                      Middlewares                            │
│  • Authentication  • Rate Limiting  • CORS  • Validation   │
├─────────────────────────────────────────────────────────────┤
│                      Controllers                            │
│  • User Controller  • Profile Controller  • Workout Ctrl   │
├─────────────────────────────────────────────────────────────┤
│                      Services                               │
│  • OpenAI Service  • Prompt Builder  • Workout Generator   │
├─────────────────────────────────────────────────────────────┤
│                      Models                                 │
│  • User Model  • Profile Model  • Workout Models          │
├─────────────────────────────────────────────────────────────┤
│                      Database                               │
│                   Firebase Firestore                       │
└─────────────────────────────────────────────────────────────┘
```

### API Design
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **Consistent Response Format**: Standardized error and success responses
- **Input Validation**: Zod schemas for all request validation
- **Error Handling**: Comprehensive error middleware with specific error codes

### Security Measures
- **Authentication**: Firebase JWT token validation with caching
- **Authorization**: User-based access control in Firestore rules
- **Input Sanitization**: XSS protection and HTML entity encoding
- **Rate Limiting**: Tiered rate limiting for different endpoint types
- **CORS**: Strict origin validation with environment-specific rules

## Database Design

### Firestore Collections

#### Users Collection
```typescript
interface User {
  id: string;
  email: string;
  firebaseUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Profiles Collection
```typescript
interface Profile {
  id: string;
  userId: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  equipmentAvailable: string[];
  age?: number;
  sex: 'male' | 'female' | 'prefer_not_to_say';
  height_ft?: number;
  height_in?: number;
  weight_lb?: number;
  injury_notes?: string;
  constraints: string[];
  health_ack: boolean;
  data_consent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Workout Plans Collection
```typescript
interface WorkoutPlan {
  id: string;
  userId: string;
  model: string;
  promptVersion: string;
  preWorkout: PreWorkout;
  plan: WorkoutPlanData;
  createdAt: Timestamp;
}
```

### Security Rules
- **User-based Access**: Users can only access their own data
- **Admin Access**: Designated admin users can read all data
- **Equipment Read-only**: Equipment data is read-only for regular users
- **Validation**: Server-side validation for all write operations

## Deployment Architecture

### Firebase Hosting
- **Frontend**: Static assets served from Firebase Hosting
- **Backend**: Express app deployed as Firebase Cloud Function
- **Database**: Firestore with automatic scaling
- **Authentication**: Firebase Auth with Google OAuth

### Build Process
```
Development → TypeScript Compilation → Bundle Optimization → Deployment
     ↓              ↓                        ↓                ↓
   tsx watch    tsc build              vite build      firebase deploy
```

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Optimized builds with cache busting
- **Environment Variables**: Secure configuration management

## Performance Considerations

### Frontend Performance
- **Bundle Size**: Code splitting reduces initial load time
- **Caching**: API responses cached with configurable TTL
- **Lazy Loading**: Components and routes loaded on demand
- **Memoization**: Prevents unnecessary React re-renders

### Backend Performance
- **Request Caching**: Firebase token validation results cached
- **Database Optimization**: Efficient queries with proper indexing
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Compression**: Gzip compression for all responses

### Monitoring and Logging
- **Structured Logging**: Pino logger with request correlation
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Metrics**: Response time and resource usage monitoring

## Development Workflow

### Code Quality
- **TypeScript**: Strict type checking across the entire codebase
- **ESLint**: Consistent code style and best practices
- **Prettier**: Automated code formatting
- **Zod Validation**: Runtime type validation for API boundaries

### Testing Strategy
- **Unit Tests**: Component and function-level testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: User workflow validation
- **Type Safety**: Compile-time error prevention

### Deployment Pipeline
1. **Development**: Local development with hot reload
2. **Build**: TypeScript compilation and bundle optimization
3. **Test**: Automated testing suite execution
4. **Deploy**: Firebase deployment with cache busting
5. **Monitor**: Performance and error monitoring

## Future Enhancements

### Scalability Improvements
- **Database Sharding**: Horizontal scaling for large user bases
- **CDN Integration**: Global content delivery optimization
- **Microservices**: Service decomposition for better scalability
- **Caching Layer**: Redis integration for distributed caching

### Feature Enhancements
- **Real-time Updates**: WebSocket integration for live features
- **Mobile App**: React Native or native mobile applications
- **Advanced Analytics**: User behavior and workout effectiveness tracking
- **Social Features**: Community sharing and workout challenges

### Security Enhancements
- **Advanced Monitoring**: Intrusion detection and prevention
- **Data Encryption**: End-to-end encryption for sensitive data
- **Compliance**: GDPR, HIPAA, and other regulatory compliance
- **Audit Logging**: Comprehensive audit trail for all operations
