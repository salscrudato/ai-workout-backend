"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeApiKey = maybeApiKey;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const isProd = process.env.NODE_ENV === 'production';
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("../config/env");
class TokenCache {
    cache = new Map();
    DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    set(token, decodedToken, ttl = this.DEFAULT_TTL) {
        this.cache.set(token, {
            decodedToken,
            timestamp: Date.now(),
            ttl,
        });
    }
    get(token) {
        const entry = this.cache.get(token);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(token);
            return null;
        }
        return entry.decodedToken;
    }
    clear() {
        this.cache.clear();
    }
    // Clean up expired entries periodically
    cleanup() {
        const now = Date.now();
        for (const [token, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(token);
            }
        }
    }
    delete(token) {
        this.cache.delete(token);
    }
}
const tokenCache = new TokenCache();
// Clean up cache every 10 minutes
const cleanupInterval = setInterval(() => tokenCache.cleanup(), 10 * 60 * 1000);
// Allow function instances to scale down when idle
if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
    cleanupInterval.unref();
}
function maybeApiKey(req, res, next) {
    // If no internal API key is configured, skip authentication
    if (!env_1.env.INTERNAL_API_KEY)
        return next();
    const key = req.header('X-API-Key');
    // If API key is configured but not provided in request, allow through
    // This makes the API key optional - only validate if provided
    if (!key)
        return next();
    // If API key is provided, it must match the configured key
    if (key !== env_1.env.INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
}
/**
 * Enhanced authentication middleware with token caching and security improvements
 */
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (!isProd) {
                console.log('Auth failed: No authorization header or invalid format');
            }
            res.status(401).json({
                error: 'Authorization header required',
                code: 'AUTH_HEADER_MISSING'
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Basic token format validation
        if (!token || token.length < 100) {
            if (!isProd) {
                console.log('Auth failed: Invalid token format');
            }
            res.status(401).json({
                error: 'Invalid token format',
                code: 'INVALID_TOKEN_FORMAT'
            });
            return;
        }
        if (!isProd) {
            console.log('Auth: Attempting to verify token:', token.substring(0, 50) + '...');
        }
        // Check cache first
        let decodedToken = tokenCache.get(token);
        if (!decodedToken) {
            // Verify the Firebase ID token
            decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token, true); // checkRevoked = true for better security
            // Cache the decoded token
            tokenCache.set(token, decodedToken);
        }
        // Additional security checks
        if (!decodedToken.email_verified) {
            if (!isProd) {
                console.log('Auth failed: Email not verified for user:', decodedToken.uid);
            }
            res.status(401).json({
                error: 'Email verification required',
                code: 'EMAIL_NOT_VERIFIED'
            });
            return;
        }
        // Check token expiration with buffer
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = decodedToken.exp;
        const bufferTime = 5 * 60; // 5 minutes buffer
        if (tokenExp - now < bufferTime) {
            if (!isProd) {
                console.log('Auth warning: Token expires soon for user:', decodedToken.uid);
            }
            // Still allow the request but log for monitoring
        }
        if (!isProd) {
            console.log('Auth: Token verified successfully for user:', decodedToken.uid);
        }
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Auth verification failed:', error);
        // Clear potentially invalid token from cache
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            tokenCache.delete(token);
        }
        // Provide specific error messages for different failure types
        let errorMessage = 'User not authenticated';
        let errorCode = 'AUTH_FAILED';
        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token has expired';
            errorCode = 'TOKEN_EXPIRED';
        }
        else if (error.code === 'auth/id-token-revoked') {
            errorMessage = 'Token has been revoked';
            errorCode = 'TOKEN_REVOKED';
        }
        else if (error.code === 'auth/invalid-id-token') {
            errorMessage = 'Invalid token';
            errorCode = 'INVALID_TOKEN';
        }
        if (!isProd) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
            });
        }
        else {
            console.error(`Auth error code: ${error.code || error.name}`);
        }
        res.status(401).json({
            error: errorMessage,
            code: errorCode
        });
    }
}
async function optionalAuth(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
            req.user = decodedToken;
        }
        next();
    }
    catch (error) {
        // If token verification fails, continue without user (optional auth)
        if (!isProd) {
            console.warn('Optional auth failed:', error);
        }
        next();
    }
}
//# sourceMappingURL=auth.js.map