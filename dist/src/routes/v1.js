"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const profile_1 = require("../controllers/profile");
const workout_1 = require("../controllers/workout");
const Equipment_1 = require("../models/Equipment");
const errors_1 = require("../middlewares/errors");
const auth_1 = require("../middlewares/auth");
// import { performanceOptimizer } from '../services/performanceOptimizer';
const adaptiveLearning_simple_1 = require("../services/adaptiveLearning.simple");
// import { generateWorkoutIntelligence } from '../services/workoutIntelligence';
const r = (0, express_1.Router)();
// Add performance monitoring middleware to all routes
const performanceOptimizer_1 = require("../services/performanceOptimizer");
r.use(performanceOptimizer_1.performanceOptimizer.optimizeRequest());
// Add intelligent caching for GET requests (5 minute cache)
r.use(performanceOptimizer_1.performanceOptimizer.cacheMiddleware(5 * 60 * 1000));
// Authentication routes
r.post('/auth/google', user_1.authenticateUser);
// Debug auth endpoint (manual verification)
r.post('/auth/debug', (0, errors_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(400).json({ error: 'No authorization header' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
        const decodedToken = await admin.default.auth().verifyIdToken(token);
        res.json({
            success: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                projectId: decodedToken.aud, // This shows which project the token is for
            },
            backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
            code: error.code,
            backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
        });
    }
}));
// Debug auth endpoint (using requireAuth middleware)
r.post('/auth/debug-middleware', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'requireAuth middleware worked!',
        user: {
            uid: req.user?.uid,
            email: req.user?.email,
            projectId: req.user?.aud,
        },
        backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
    });
}));
// User routes
r.post('/users', user_1.createUser);
// Profile routes (protected)
r.post('/profile', auth_1.requireAuth, profile_1.createProfile);
r.get('/profile/:userId', auth_1.requireAuth, profile_1.getProfile);
r.patch('/profile/:userId', auth_1.requireAuth, profile_1.patchProfile);
// Equipment routes (public) - with caching
r.get('/equipment', (0, errors_1.asyncHandler)(async (req, res) => {
    // Set cache headers for static data
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    const items = await Equipment_1.EquipmentModel.find();
    res.json({
        items: items.map(i => ({ slug: i.slug, label: i.label })),
        cached: false // Will be true when served from cache
    });
}));
// Workout routes (protected) - Specific routes first
r.post('/workouts/generate', auth_1.requireAuth, workout_1.generate);
r.post('/workouts/quick-generate', auth_1.requireAuth, workout_1.generateQuickWorkout); // NEW: One-tap workout generation
// Debug endpoint to test workout generation route
r.get('/workouts/test', (0, errors_1.asyncHandler)(async (req, res) => {
    res.json({
        message: 'Workout generation endpoint is accessible',
        timestamp: new Date().toISOString(),
        routes: {
            generate: 'POST /v1/workouts/generate (requires auth)',
            quickGenerate: 'POST /v1/workouts/quick-generate (requires auth)'
        }
    });
}));
// NEW: Advanced AI Enhancement Routes - Frictionless UX
r.get('/workouts/predictive-schedule', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const daysAhead = parseInt(req.query.days) || 7;
    const { frictionlessUXService } = await Promise.resolve().then(() => __importStar(require('../services/frictionlessUX')));
    const schedule = await frictionlessUXService.generatePredictiveSchedule(userId, daysAhead);
    res.json({ schedule });
}));
// Smart defaults for quick workout generation
r.get('/workouts/smart-defaults', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const { frictionlessUXService } = await Promise.resolve().then(() => __importStar(require('../services/frictionlessUX')));
    const smartDefaults = await frictionlessUXService.generateSmartDefaults(userId);
    res.json({ smartDefaults });
}));
// One-tap workout options
r.get('/workouts/quick-start-options', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const { frictionlessUXService } = await Promise.resolve().then(() => __importStar(require('../services/frictionlessUX')));
    const quickStartOptions = await frictionlessUXService.generateQuickStartOptions(userId);
    res.json({ quickStartOptions });
}));
// Conversational workout generation
r.post('/workouts/conversational', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const { input, context } = req.body;
    if (!input) {
        res.status(400).json({ error: 'Input text is required' });
        return;
    }
    const { frictionlessUXService } = await Promise.resolve().then(() => __importStar(require('../services/frictionlessUX')));
    const conversationalContext = frictionlessUXService.processConversationalInput(input, context);
    res.json({ conversationalContext });
}));
r.post('/workouts/:workoutId/adapt', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.uid;
    const { workoutId } = req.params;
    const currentMetrics = req.body;
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    // Mock user for now - implement UserModel later
    const user = { id: req.user?.uid || 'mock-user-id' };
    // Mock adaptation - implement frictionlessUXService later
    const adaptation = {
        exerciseSwaps: [],
        restAdjustments: [],
        intensityChanges: [],
        reasoning: 'Mock adaptation based on current metrics',
    };
    res.json({ adaptation });
}));
// Enhanced AI and Analytics routes (protected)
r.get('/workouts/recommendations/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }
    const recommendations = await adaptiveLearning_simple_1.adaptiveLearningEngine.generateRecommendations(userId);
    res.json({ recommendations });
}));
r.get('/analytics/intelligence/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }
    // Simplified intelligence response for now
    const intelligence = {
        adaptiveLoading: { currentLoad: 'moderate', recommendation: 'maintain' },
        recoveryStatus: { status: 'good', recommendation: 'proceed' },
        progressionRecommendation: { phase: 'development', nextMilestone: 'strength gains' }
    };
    res.json({ intelligence });
}));
r.get('/analytics/behavior/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }
    const behaviorPattern = await adaptiveLearning_simple_1.adaptiveLearningEngine.analyzeUserBehavior(userId);
    res.json({ behaviorPattern });
}));
r.get('/analytics/timing/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }
    const optimalTiming = await adaptiveLearning_simple_1.adaptiveLearningEngine.predictOptimalTiming(userId);
    res.json({ optimalTiming });
}));
r.post('/workouts/:workoutId/feedback', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { workoutId } = req.params;
    const { rating, difficulty, enjoyment, completed, notes } = req.body;
    // Validate feedback data
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        return;
    }
    if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
        res.status(400).json({ error: 'Difficulty must be a number between 1 and 5' });
        return;
    }
    if (typeof enjoyment !== 'number' || enjoyment < 1 || enjoyment > 5) {
        res.status(400).json({ error: 'Enjoyment must be a number between 1 and 5' });
        return;
    }
    if (!workoutId) {
        res.status(400).json({ error: 'Workout ID is required' });
        return;
    }
    await adaptiveLearning_simple_1.adaptiveLearningEngine.learnFromFeedback(req.user.uid, workoutId, {
        rating,
        difficulty,
        enjoyment,
        completed: Boolean(completed),
        notes: notes || undefined
    });
    res.json({ success: true, message: 'Feedback recorded successfully' });
}));
// Advanced Analytics Routes
r.get('/analytics/user/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    const { advancedAnalyticsService } = await Promise.resolve().then(() => __importStar(require('../services/advancedAnalytics')));
    const analytics = await advancedAnalyticsService.generateUserAnalytics(userId);
    res.json({ analytics });
}));
r.get('/analytics/workout/:workoutId/effectiveness', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { workoutId } = req.params;
    if (!workoutId) {
        res.status(400).json({ error: 'Workout ID is required' });
        return;
    }
    const { advancedAnalyticsService } = await Promise.resolve().then(() => __importStar(require('../services/advancedAnalytics')));
    const effectiveness = await advancedAnalyticsService.analyzeWorkoutEffectiveness(workoutId);
    res.json({ effectiveness });
}));
r.get('/analytics/learning-insights/:userId', auth_1.requireAuth, (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    // Verify user can access this data
    if (req.user?.uid !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    const { advancedAnalyticsService } = await Promise.resolve().then(() => __importStar(require('../services/advancedAnalytics')));
    const insights = await advancedAnalyticsService.generateLearningInsights(userId);
    res.json({ insights });
}));
// Performance and health monitoring routes
r.get('/health/performance', (0, errors_1.asyncHandler)(async (_req, res) => {
    const { performanceOptimizer } = await Promise.resolve().then(() => __importStar(require('../services/performanceOptimizer')));
    const metrics = performanceOptimizer.getPerformanceMetrics();
    const cacheStats = performanceOptimizer.getCacheStatistics();
    const health = {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        performance: metrics,
        cache: cacheStats
    };
    res.json(health);
}));
r.get('/health/metrics', (0, errors_1.asyncHandler)(async (_req, res) => {
    const { performanceOptimizer } = await Promise.resolve().then(() => __importStar(require('../services/performanceOptimizer')));
    const metrics = performanceOptimizer.getPerformanceMetrics();
    res.json({ metrics });
}));
r.get('/health/optimization-recommendations', (0, errors_1.asyncHandler)(async (_req, res) => {
    const { performanceOptimizer } = await Promise.resolve().then(() => __importStar(require('../services/performanceOptimizer')));
    const recommendations = performanceOptimizer.generateOptimizationRecommendations();
    res.json({ recommendations });
}));
// Parameterized workout routes (must be last to avoid conflicts)
r.get('/workouts/:workoutId', auth_1.requireAuth, workout_1.getWorkout);
r.get('/workouts', auth_1.requireAuth, workout_1.listWorkouts);
r.post('/workouts/:workoutId/complete', auth_1.requireAuth, workout_1.completeWorkout);
exports.default = r;
//# sourceMappingURL=v1.js.map