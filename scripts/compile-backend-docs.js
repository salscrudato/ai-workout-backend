#!/usr/bin/env node

/**
 * Backend Code Compilation Script
 *
 * This script compiles all backend TypeScript/JavaScript files into a single
 * comprehensive markdown document with file paths, descriptions, and full code.
 *
 * Usage: node scripts/compile-backend-docs.js
 * Output: src/BACKEND_CODE_COMPILATION.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = 'src';
const OUTPUT_FILE = path.join(SOURCE_DIR, 'BACKEND_CODE_COMPILATION.md');
const EXCLUDED_DIRS = ['node_modules', 'dist', 'frontend', 'tests', '.git'];
const INCLUDED_EXTENSIONS = ['.ts', '.js', '.json'];

// File descriptions based on common patterns and purposes
const FILE_DESCRIPTIONS = {
  // Main application files
  'index.ts': 'Main application entry point that initializes and starts the server',
  'app.ts': 'Express application configuration with middleware, routes, and error handling',
  
  // Configuration files
  'config/db.ts': 'Database connection configuration and initialization',
  'config/env.ts': 'Environment variables configuration and validation',
  
  // Controllers
  'controllers/profile.ts': 'Profile management controller handling user profile CRUD operations',
  'controllers/user.ts': 'User management controller for authentication and user operations',
  'controllers/workout.ts': 'Workout controller managing workout generation, retrieval, and management',
  
  // Libraries
  'libs/hash.ts': 'Cryptographic hashing utilities for password security',
  'libs/openai.ts': 'OpenAI API integration for AI-powered workout generation',
  
  // Middleware
  'middlewares/auth.ts': 'Authentication middleware for protecting routes and validating tokens',
  'middlewares/errors.ts': 'Global error handling middleware for consistent error responses',
  
  // Models
  'models/Equipment.ts': 'Equipment data model defining available workout equipment',
  'models/Profile.ts': 'User profile data model with fitness preferences and constraints',
  'models/User.ts': 'User data model for authentication and basic user information',
  'models/WorkoutPlan.ts': 'Workout plan data model defining workout structure and exercises',
  'models/WorkoutSession.ts': 'Workout session data model tracking completed workouts',
  
  // Routes
  'routes/analytics.ts': 'Analytics API routes for performance metrics and usage tracking',
  'routes/health.ts': 'Health check routes for monitoring application status',
  'routes/v1.ts': 'Main API v1 routes configuration and endpoint definitions',
  
  // Schemas
  'schemas/preworkout.ts': 'Pre-workout data validation schemas',
  'schemas/validation.ts': 'General validation schemas for API requests',
  'schemas/workoutOutput.ts': 'Workout output validation schemas for AI-generated content',
  
  // Security
  'security/advancedRateLimit.ts': 'Advanced rate limiting implementation for API protection',
  'security/inputValidation.ts': 'Input validation and sanitization utilities',
  
  // Services
  'services/adaptiveLearning.simple.ts': 'Simplified adaptive learning system for workout personalization',
  'services/advancedPerformanceMonitor.ts': 'Advanced performance monitoring and metrics collection',
  'services/generator.ts': 'Core workout generation service using AI and business logic',
  'services/gracefulDegradation.ts': 'Graceful degradation service for handling service failures',
  'services/intelligentCache.ts': 'Intelligent caching system for optimizing performance',
  'services/performanceAnalytics.ts': 'Performance analytics service for tracking system metrics',
  'services/periodizationEngine.ts': 'Periodization engine for advanced workout planning',
  'services/promptAnalytics.ts': 'Analytics service for AI prompt performance tracking',
  'services/promptOptimizer.ts': 'AI prompt optimization service for better workout generation',
  'services/promptVersioning.ts': 'Version management system for AI prompts',
  'services/realTimeCoaching.ts': 'Real-time coaching service for workout guidance',
  'services/recoveryManager.ts': 'Recovery management service for workout planning',
  'services/requestDeduplication.ts': 'Request deduplication service to prevent duplicate processing',
  'services/socialGamification.ts': 'Social features and gamification service',
  
  // Utils
  'utils/circuitBreaker.ts': 'Circuit breaker pattern implementation for fault tolerance',
  'utils/errorClassification.ts': 'Error classification and categorization utilities',
  'utils/logger.ts': 'Centralized logging utility with structured logging',
  'utils/validation.ts': 'General validation utilities and helper functions'
};

/**
 * Get file description based on file path
 */
function getFileDescription(filePath) {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  
  // Check for exact match
  if (FILE_DESCRIPTIONS[relativePath]) {
    return FILE_DESCRIPTIONS[relativePath];
  }
  
  // Check for pattern matches
  const fileName = path.basename(filePath);
  const dirName = path.dirname(relativePath);
  
  // Generic descriptions based on directory and file patterns
  if (dirName.includes('controllers')) {
    return `Controller handling ${fileName.replace('.ts', '').replace('.js', '')} related API endpoints and business logic`;
  }
  
  if (dirName.includes('models')) {
    return `Data model defining the structure and validation for ${fileName.replace('.ts', '').replace('.js', '')} entities`;
  }
  
  if (dirName.includes('services')) {
    return `Service layer implementing ${fileName.replace('.ts', '').replace('.js', '')} business logic and operations`;
  }
  
  if (dirName.includes('routes')) {
    return `API route definitions for ${fileName.replace('.ts', '').replace('.js', '')} endpoints`;
  }
  
  if (dirName.includes('middlewares')) {
    return `Middleware for ${fileName.replace('.ts', '').replace('.js', '')} functionality`;
  }
  
  if (dirName.includes('utils')) {
    return `Utility functions for ${fileName.replace('.ts', '').replace('.js', '')} operations`;
  }
  
  if (dirName.includes('config')) {
    return `Configuration settings for ${fileName.replace('.ts', '').replace('.js', '')}`;
  }
  
  if (dirName.includes('schemas')) {
    return `Validation schemas for ${fileName.replace('.ts', '').replace('.js', '')} data structures`;
  }
  
  if (dirName.includes('security')) {
    return `Security implementation for ${fileName.replace('.ts', '').replace('.js', '')} protection`;
  }
  
  if (dirName.includes('libs')) {
    return `Library integration for ${fileName.replace('.ts', '').replace('.js', '')} functionality`;
  }
  
  return `Backend implementation file for ${fileName.replace('.ts', '').replace('.js', '')} functionality`;
}

/**
 * Check if file should be included
 */
function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath);
  return INCLUDED_EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
}

/**
 * Check if directory should be excluded
 */
function shouldExcludeDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  return EXCLUDED_DIRS.includes(dirName);
}

/**
 * Recursively get all files in directory
 */
function getAllFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!shouldExcludeDirectory(filePath)) {
        getAllFiles(filePath, fileList);
      }
    } else if (shouldIncludeFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Generate markdown content for a file
 */
function generateFileMarkdown(filePath) {
  const relativePath = path.relative('.', filePath);
  const fileName = path.basename(filePath);
  const description = getFileDescription(filePath);
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    content = `Error reading file: ${error.message}`;
  }
  
  const fileExtension = path.extname(filePath).substring(1);
  const language = fileExtension === 'ts' ? 'typescript' : fileExtension === 'js' ? 'javascript' : fileExtension;
  
  return `## ${fileName}

**File Path:** \`${relativePath}\`

**Description:** ${description}

\`\`\`${language}
${content}
\`\`\`

---

`;
}

/**
 * Main compilation function
 */
function compileBackendDocs() {
  console.log('🚀 Starting backend code compilation...');
  
  // Get all backend files
  const backendFiles = getAllFiles(SOURCE_DIR);
  
  // Sort files by path for better organization
  backendFiles.sort();
  
  console.log(`📁 Found ${backendFiles.length} backend files to compile`);
  
  // Generate header
  const header = `# AI Workout Backend - Complete Code Compilation

This document contains the complete backend codebase for the AI Workout application.
Generated on: ${new Date().toISOString()}

## Table of Contents

${backendFiles.map(file => {
  const fileName = path.basename(file);
  const relativePath = path.relative('.', file);
  return `- [${fileName}](#${fileName.toLowerCase().replace(/[^a-z0-9]/g, '')}) - \`${relativePath}\``;
}).join('\n')}

---

`;
  
  // Generate content for each file
  let markdownContent = header;
  
  backendFiles.forEach((file, index) => {
    console.log(`📄 Processing ${index + 1}/${backendFiles.length}: ${path.relative('.', file)}`);
    markdownContent += generateFileMarkdown(file);
  });
  
  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, markdownContent, 'utf8');
  
  console.log(`✅ Backend code compilation complete!`);
  console.log(`📋 Output file: ${OUTPUT_FILE}`);
  console.log(`📊 Total files compiled: ${backendFiles.length}`);
  console.log(`📏 Total size: ${Math.round(markdownContent.length / 1024)} KB`);
}

// Run the compilation
if (import.meta.url === `file://${process.argv[1]}`) {
  compileBackendDocs();
}

export { compileBackendDocs };
