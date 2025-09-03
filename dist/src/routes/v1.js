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
const r = (0, express_1.Router)();
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
// Equipment routes (public)
r.get('/equipment', (0, errors_1.asyncHandler)(async (_req, res) => {
    const items = await Equipment_1.EquipmentModel.find();
    res.json({ items: items.map(i => ({ slug: i.slug, label: i.label })) });
}));
// Workout routes (protected)
r.post('/workouts/generate', auth_1.requireAuth, workout_1.generate);
r.get('/workouts/:workoutId', auth_1.requireAuth, workout_1.getWorkout);
r.get('/workouts', auth_1.requireAuth, workout_1.listWorkouts);
r.post('/workouts/:workoutId/complete', auth_1.requireAuth, workout_1.completeWorkout);
exports.default = r;
//# sourceMappingURL=v1.js.map