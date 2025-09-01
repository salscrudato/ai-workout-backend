# AI Workout Frontend Development - Comprehensive Build Prompt

## 🎯 PROJECT OVERVIEW

You are tasked with building a **leading, modern, clean, simple, intuitive and innovative** React/Vite frontend application for an AI-powered workout generation platform. This app will integrate seamlessly with a production Firebase backend.

## 👥 ASSIGNED PERSONAS

You must embody these three expert personas simultaneously:

### 🚀 **Expert React/Vite Frontend Engineer**
- Master of React 18+ with latest hooks and patterns
- Vite build optimization expert
- TypeScript implementation specialist
- Modern JavaScript/ES6+ proficiency
- Component architecture and state management expert

### 🔥 **Backend Firebase Integration Expert**
- Firebase hosting and deployment specialist
- API integration and error handling expert
- Authentication and security implementation
- Performance optimization for Firebase services
- Environment configuration and secrets management

### 🎨 **Expert UI/UX Designer**
- Leading modern design patterns and trends
- Clean, minimalist, and intuitive interfaces
- Responsive design and mobile-first approach
- Accessibility and usability expert
- Innovative interaction design and micro-animations

## 🏗️ TECHNICAL REQUIREMENTS

### **Core Stack**
- **React 18+** (latest version)
- **Vite** (latest version) 
- **TypeScript** for type safety
- **Tailwind CSS** for modern, clean styling
- **Firebase Hosting** for deployment

### **Additional Libraries**
- React Router DOM for navigation
- Axios for API calls
- React Hook Form for form management
- Framer Motion for animations
- Lucide React for icons
- React Hot Toast for notifications

## 🌐 BACKEND INTEGRATION

### **Production API Base URL**
```
https://ai-workout-backend-2024.web.app
```

### **Core API Endpoints**

#### **Health Check**
```
GET /health
Response: { ok: true, timestamp: string, version: string, environment: string }
```

#### **Equipment Management**
```
GET /v1/equipment
Response: { items: [{ slug: string, label: string }] }
```

#### **User Management**
```
POST /v1/users
Body: {
  email?: string,
  experience?: 'beginner' | 'intermediate' | 'advanced',
  goals?: string[],
  equipmentAvailable?: string[],
  age?: number,
  sex?: 'male' | 'female' | 'prefer_not_to_say',
  height_ft?: number,
  height_in?: number,
  weight_lb?: number,
  injury_notes?: string,
  constraints?: string[],
  health_ack?: boolean,
  data_consent?: boolean
}
Response: { userId: string, profile?: object }
```

#### **Profile Management**
```
GET /v1/profile/{userId}
Response: { profile: object }

PATCH /v1/profile/{userId}
Body: { /* profile fields to update */ }
Response: { profile: object }
```

#### **Workout Generation & Management**
```
POST /v1/workouts/generate
Body: {
  userId: string,
  goals: string[],
  experience: string,
  duration: number,
  equipment: string[],
  constraints?: string[]
}
Response: { workoutId: string, plan: object }

GET /v1/workouts/{workoutId}
Response: { workout: object }

GET /v1/workouts?userId={userId}
Response: { workouts: object[] }

POST /v1/workouts/{workoutId}/complete
Body: {
  startedAt?: string,
  completedAt?: string,
  feedback?: object
}
Response: { session: object }
```

## 🎨 UI/UX DESIGN REQUIREMENTS

### **Design Principles**
- **Leading & Modern**: Implement cutting-edge design trends
- **Clean & Minimalist**: Embrace whitespace and simplicity
- **Intuitive Navigation**: Self-explanatory user flows
- **Innovative Interactions**: Subtle animations and micro-interactions
- **Mobile-First**: Responsive design that works perfectly on all devices

### **Color Palette & Styling**
- Use a modern, fitness-focused color scheme
- Implement dark/light mode toggle
- Consistent spacing using Tailwind's spacing scale
- Modern typography with excellent readability
- Subtle shadows and gradients for depth

### **Key UI Components**
- Modern card-based layouts
- Smooth transitions and hover effects
- Loading states with skeleton screens
- Toast notifications for user feedback
- Modal dialogs for complex interactions
- Progress indicators for multi-step flows

## 📱 CORE APPLICATION FEATURES

### **1. User Onboarding Flow**
- Welcome screen with app introduction
- User registration (email optional)
- Profile setup wizard:
  - Experience level selection
  - Fitness goals (multiple selection)
  - Available equipment checklist
  - Physical stats (age, sex, height, weight)
  - Injury notes and constraints
  - Health acknowledgment and data consent

### **2. Dashboard/Home Screen**
- Welcome message with user's name/progress
- Quick workout generation CTA
- Recent workouts history
- Progress tracking overview
- Equipment quick-access

### **3. Workout Generation**
- Interactive form with:
  - Goal selection (strength, cardio, flexibility, etc.)
  - Duration slider (15-120 minutes)
  - Equipment multi-select with visual icons
  - Additional constraints text area
- Real-time form validation
- Loading state during AI generation
- Generated workout display with:
  - Exercise list with descriptions
  - Sets, reps, and duration details
  - Equipment needed per exercise
  - Estimated total time

### **4. Workout Execution**
- Start workout interface
- Exercise-by-exercise progression
- Timer functionality for timed exercises
- Rest period countdowns
- Progress tracking within workout
- Completion celebration and feedback collection

### **5. Workout History**
- List of completed workouts
- Workout details view
- Performance tracking over time
- Favorite workouts functionality

### **6. Profile Management**
- Edit profile information
- Update equipment availability
- Modify fitness goals
- View workout statistics

## 🚀 FIREBASE DEPLOYMENT SETUP

### **Project Structure**
```
ai-workout-frontend/
├── src/
├── public/
├── firebase.json
├── .firebaserc
├── package.json
└── vite.config.ts
```

### **Firebase Configuration**
1. Initialize Firebase project: `ai-workout-frontend`
2. Enable Firebase Hosting
3. Configure build output directory as `dist`
4. Set up single-page application rewrites
5. Configure environment variables for API base URL

### **Deployment Commands**
```bash
npm run build
firebase deploy
```

## 🔧 IMPLEMENTATION GUIDELINES

### **State Management**
- Use React Context for global state (user, theme)
- Local component state for UI interactions
- Custom hooks for API calls and data fetching

### **Error Handling**
- Comprehensive error boundaries
- User-friendly error messages
- Retry mechanisms for failed API calls
- Offline state handling

### **Performance Optimization**
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization for expensive calculations
- Bundle size optimization

### **Accessibility**
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## 📋 DEVELOPMENT CHECKLIST

### **Setup Phase**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Set up Firebase project and hosting
- [ ] Configure environment variables
- [ ] Install required dependencies

### **Core Development**
- [ ] Implement routing structure
- [ ] Create reusable UI components
- [ ] Build user onboarding flow
- [ ] Implement workout generation
- [ ] Create workout execution interface
- [ ] Build profile management
- [ ] Add workout history functionality

### **Polish & Deploy**
- [ ] Implement animations and micro-interactions
- [ ] Add loading states and error handling
- [ ] Optimize performance and bundle size
- [ ] Test responsive design across devices
- [ ] Deploy to Firebase Hosting
- [ ] Verify production functionality

## 🎯 SUCCESS CRITERIA

The final application must:
1. **Seamlessly integrate** with the production backend API
2. **Provide an exceptional user experience** that feels modern and intuitive
3. **Work flawlessly** across all device sizes and browsers
4. **Load quickly** with optimized performance
5. **Handle errors gracefully** with helpful user feedback
6. **Be accessible** to users with disabilities
7. **Deploy successfully** to Firebase Hosting

## 🚀 GET STARTED

Begin by creating the project structure, setting up the development environment, and implementing the core user flows. Focus on creating a polished, production-ready application that showcases modern web development best practices.

**Remember**: This is not just a functional app—it's a showcase of leading frontend development that users will love to use!

## 📊 DETAILED API SCHEMAS

### **Workout Generation Request**
```typescript
interface WorkoutGenerationRequest {
  userId: string;
  goals: string[];           // e.g., ["strength", "muscle_building"]
  experience: "beginner" | "intermediate" | "advanced";
  duration: number;          // minutes (15-120)
  equipment: string[];       // equipment slugs from /v1/equipment
  constraints?: string[];    // e.g., ["no_jumping", "lower_back_injury"]
}
```

### **Generated Workout Response**
```typescript
interface WorkoutPlan {
  workoutId: string;
  plan: {
    title: string;
    description: string;
    estimatedDuration: number;
    difficulty: string;
    exercises: Exercise[];
    warmup?: Exercise[];
    cooldown?: Exercise[];
  };
}

interface Exercise {
  name: string;
  description: string;
  sets?: number;
  reps?: number;
  duration?: number;        // seconds
  restTime?: number;        // seconds
  equipment: string[];
  instructions: string[];
  tips?: string[];
  targetMuscles: string[];
}
```

### **User Profile Schema**
```typescript
interface UserProfile {
  userId: string;
  email?: string;
  experience: "beginner" | "intermediate" | "advanced";
  goals: string[];
  equipmentAvailable: string[];
  age?: number;
  sex?: "male" | "female" | "prefer_not_to_say";
  height_ft?: number;
  height_in?: number;
  weight_lb?: number;
  injury_notes?: string;
  constraints: string[];
  health_ack: boolean;
  data_consent: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🔥 FIREBASE SETUP INSTRUCTIONS

### **1. Create Firebase Project**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Use existing project: ai-workout-frontend
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds and deploys with GitHub: No
```

### **2. Firebase Configuration Files**

**firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

**.firebaserc**
```json
{
  "projects": {
    "default": "ai-workout-frontend"
  }
}
```

### **3. Environment Configuration**

**.env.production**
```
VITE_API_BASE_URL=https://ai-workout-backend-2024.web.app
VITE_APP_NAME=AI Workout Generator
VITE_APP_VERSION=1.0.0
```

**.env.development**
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=AI Workout Generator (Dev)
VITE_APP_VERSION=1.0.0-dev
```

### **4. Vite Configuration**

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

## 📦 COMPLETE PACKAGE.JSON

```json
{
  "name": "ai-workout-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

## 🎨 TAILWIND CONFIGURATION

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        fitness: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
```

## 🚀 DEPLOYMENT WORKFLOW

### **Development to Production**
1. **Development**: `npm run dev` (localhost:5173)
2. **Build**: `npm run build` (creates optimized dist/)
3. **Preview**: `npm run preview` (test production build locally)
4. **Deploy**: `npm run deploy` (builds and deploys to Firebase)

### **Production URL**
After deployment, your app will be available at:
```
https://ai-workout-frontend.web.app
```

## ✅ FINAL VERIFICATION CHECKLIST

Before considering the project complete:

- [ ] All API endpoints integrate successfully
- [ ] User can complete full onboarding flow
- [ ] Workout generation works with real AI responses
- [ ] Workout execution interface is fully functional
- [ ] Profile management allows updates
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Loading states and error handling work properly
- [ ] App deploys successfully to Firebase
- [ ] Production app connects to production backend
- [ ] Performance metrics are acceptable (Lighthouse score >90)

## 🎯 INNOVATION OPPORTUNITIES

Consider implementing these advanced features:
- **Progressive Web App** (PWA) capabilities
- **Offline workout caching** for poor connectivity
- **Voice commands** during workout execution
- **Workout sharing** and social features
- **Advanced analytics** and progress visualization
- **Integration with fitness wearables**
- **Personalized workout recommendations** based on history

---

**🚀 Ready to build the future of AI-powered fitness? Let's create something amazing!**
