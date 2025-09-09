"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeApiKey = maybeApiKey;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const tslib_1 = require("tslib");
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
const env_1 = require("../config/env");
const isProd = process.env['NODE_ENV'] === 'production';
class TokenCache {
    cache = new Map();
    DEFAULT_TTL = 5 * 60 * 1000;
    MAX_CACHE_SIZE = 1000;
    MAX_ACCESS_COUNT = 100;
    set(token, decodedToken, ttl = this.DEFAULT_TTL) {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldest();
        }
        this.cache.set(token, {
            decodedToken,
            timestamp: Date.now(),
            ttl,
            accessCount: 0,
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
        if (entry.accessCount >= this.MAX_ACCESS_COUNT) {
            this.cache.delete(token);
            return null;
        }
        entry.accessCount++;
        return entry.decodedToken;
    }
    evictOldest() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    clear() {
        this.cache.clear();
    }
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
const cleanupInterval = setInterval(() => tokenCache.cleanup(), 10 * 60 * 1000);
if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
    cleanupInterval.unref();
}
function maybeApiKey(req, res, next) {
    if (!env_1.env.INTERNAL_API_KEY)
        return next();
    const key = req.header('X-API-Key');
    if (!key)
        return next();
    if (key !== env_1.env.INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
}
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
        const token = authHeader.substring(7);
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
        let decodedToken = tokenCache.get(token);
        if (!decodedToken) {
            decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token, true);
            tokenCache.set(token, decodedToken);
        }
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
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = decodedToken.exp;
        const bufferTime = 5 * 60;
        if (tokenExp - now < bufferTime) {
            if (!isProd) {
                console.log('Auth warning: Token expires soon for user:', decodedToken.uid);
            }
        }
        if (!isProd) {
            console.log('Auth: Token verified successfully for user:', decodedToken.uid);
        }
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Auth verification failed:', error);
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            tokenCache.delete(token);
        }
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
        if (!isProd) {
            console.warn('Optional auth failed:', error);
        }
        next();
    }
}
//# sourceMappingURL=auth.js.map