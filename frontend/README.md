# AI Workout Frontend

A modern, optimized React frontend for the AI Workout application, built with performance, accessibility, and AI agent collaboration in mind.

## 🚀 Features

- **Modern React 19.1.1** with TypeScript and strict mode
- **Vite Build System** with optimized configuration and hot reloading
- **Comprehensive Design System** with 10+ component variants
- **Accessibility-First** approach with WCAG AA compliance
- **Performance Optimized** with code splitting and tree shaking
- **Testing Infrastructure** with Vitest and Testing Library
- **AI Agent Friendly** with extensive documentation and patterns

## 🛠 Technology Stack

- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite with custom optimization
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Authentication**: Firebase Auth
- **Testing**: Vitest + Testing Library + Accessibility Testing
- **Animation**: Framer Motion
- **Development**: VSCode optimized workspace

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, Modal, etc.)
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── features/       # Feature-specific components
├── contexts/           # React Context providers (Auth, AppState)
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions
└── test/               # Testing utilities and templates
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Development Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:analyze    # Build with bundle analysis
npm run preview          # Preview production build
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run type-check       # TypeScript type checking
npm run lint             # ESLint checking
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run validate         # Run all quality checks
```

## 🎨 Design System

### Component Variants
Our components support multiple variants for different use cases:

```typescript
// Button variants
type ButtonVariant =
  | 'primary' | 'secondary' | 'ghost' | 'outline'
  | 'gradient' | 'premium' | 'luxury' | 'minimal'
  | 'electric' | 'glass';

// Size system
type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
```

### Color Palette
- **Primary**: Blue-based gradient system
- **Neutral**: Grayscale for text and backgrounds
- **Semantic**: Success, warning, and error colors
- **Accessibility**: WCAG AA compliant contrast ratios

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Render time and memory monitoring

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test Button.test.tsx
```

### Testing Utilities
```typescript
import { renderWithProviders } from '@/test/utils';
import { testComponentAccessibility } from '@/test/templates';

// Render with all providers
renderWithProviders(<Component />);

// Test accessibility automatically
testComponentAccessibility(Component, { prop: 'value' });
```

## 🏗 Architecture

### Performance Optimizations
- **Bundle Splitting**: Automatic code splitting with Vite
- **Tree Shaking**: Eliminate unused code from bundles
- **Lazy Loading**: Route-based and component-based lazy loading
- **Memoization**: Strategic use of React.memo, useMemo, useCallback
- **Core Web Vitals**: Performance monitoring and optimization

### Build Configuration
```typescript
// vite.config.ts highlights
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'ui-vendor': ['framer-motion'],
        },
      },
    },
  },
});
```

### TypeScript Configuration
- **Strict Mode**: Enhanced type checking and safety
- **Path Aliases**: Clean import paths with @ aliases
- **Utility Types**: Advanced TypeScript patterns
- **Type Guards**: Runtime type validation

## 🤖 AI Agent Guidelines

This codebase is optimized for AI agent development. Key resources:

- **[AI_AGENT_GUIDELINES.md](./AI_AGENT_GUIDELINES.md)**: Comprehensive development guidelines
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Development setup and workflows
- **[TESTING.md](./TESTING.md)**: Testing strategies and patterns
- **[docs/](./docs/)**: Architectural decision records (ADRs)

### Quick AI Agent Checklist
- [ ] Follow established component patterns
- [ ] Use TypeScript strict mode (no `any` types)
- [ ] Include comprehensive tests
- [ ] Ensure accessibility compliance
- [ ] Update documentation for changes
- [ ] Run validation before submitting

## 📊 Performance Metrics

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Current bundle sizes (optimized):
# - Main chunk: ~45KB (gzipped)
# - React vendor: ~42KB (gzipped)
# - Firebase vendor: ~25KB (gzipped)
# - UI vendor (Framer Motion): ~78KB (gzipped)
```

### Test Coverage
- **Target**: 80% minimum coverage
- **Components**: 85% minimum coverage
- **Utils**: 90% minimum coverage

### Build Performance
- **Development**: Hot reload < 100ms
- **Production Build**: < 2 minutes
- **Type Checking**: < 30 seconds

## 🔧 Development Tools

### VSCode Configuration
The project includes optimized VSCode settings:
- **Extensions**: Recommended extensions for React/TypeScript
- **Settings**: Optimized for development workflow
- **Tasks**: Automated development tasks
- **Launch**: Debug configurations for Chrome and Node.js

### Code Quality Tools
- **ESLint**: Strict linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Vitest**: Fast unit testing
- **Testing Library**: User-centric testing utilities

## 📚 Documentation

### Core Documentation
- **[README.md](./README.md)**: This file - project overview
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Development guide and setup
- **[TESTING.md](./TESTING.md)**: Testing strategies and patterns
- **[AI_AGENT_GUIDELINES.md](./AI_AGENT_GUIDELINES.md)**: AI agent development guidelines

### Architecture Documentation
- **[ADR-001](./docs/ADR-001-Frontend-Architecture.md)**: Frontend architecture decisions
- **[ADR-002](./docs/ADR-002-Component-Design-System.md)**: Component design system

## 🤝 Contributing

### For AI Agents
1. Review the [AI Agent Guidelines](./AI_AGENT_GUIDELINES.md)
2. Follow established patterns and conventions
3. Ensure comprehensive test coverage
4. Maintain accessibility standards
5. Update documentation for significant changes

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] Component follows design system patterns
- [ ] Comprehensive test coverage
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed
- [ ] Documentation updated

## 🔗 Related Projects

- **Backend**: AI Workout Backend (Firebase Functions)
- **Mobile**: React Native mobile application (planned)
- **Admin**: Admin dashboard (planned)

## 📄 License

This project is part of the AI Workout application suite.

---

**Built with ❤️ for AI agents and human developers alike**
