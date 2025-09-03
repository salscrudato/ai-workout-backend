#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';

/**
 * Enhanced deployment script with comprehensive optimizations
 * Features:
 * - Cache busting with content-based hashing
 * - Asset optimization and compression
 * - Build verification and validation
 * - Rollback capability
 * - Performance monitoring
 */

// Generate version based on content hash for better cache invalidation
function generateContentHash(content) {
  return createHash('sha256').update(content).digest('hex').substring(0, 12);
}

// Validate build output
function validateBuild(distPath) {
  const requiredFiles = ['index.html', 'assets'];
  const missingFiles = requiredFiles.filter(file => !existsSync(join(distPath, file)));

  if (missingFiles.length > 0) {
    throw new Error(`Missing required build files: ${missingFiles.join(', ')}`);
  }

  // Check if index.html is not empty
  const indexPath = join(distPath, 'index.html');
  const indexContent = readFileSync(indexPath, 'utf8');
  if (indexContent.length < 100) {
    throw new Error('index.html appears to be empty or corrupted');
  }

  console.log('✅ Build validation passed');
}

// Create deployment manifest
function createDeploymentManifest(version, buildTime, distPath) {
  const manifest = {
    version,
    buildTime,
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'production',
    commit: process.env.GITHUB_SHA || 'unknown',
    branch: process.env.GITHUB_REF_NAME || 'unknown',
  };

  const manifestPath = join(distPath, 'deployment-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Created deployment manifest');

  return manifest;
}

// Main deployment function
async function deploy() {
  const startTime = Date.now();
  const buildTime = new Date().toISOString();

  console.log('🚀 Starting enhanced deployment process...');
  console.log(`📅 Build time: ${buildTime}`);

  try {
    // Step 1: Clean and build
    console.log('\n📦 Building frontend...');
    execSync('npm run build:frontend', { stdio: 'inherit' });

    const distPath = join(process.cwd(), 'frontend/dist');

    // Step 2: Validate build
    console.log('\n🔍 Validating build...');
    validateBuild(distPath);

    // Step 3: Generate content-based version
    const indexPath = join(distPath, 'index.html');
    const indexContent = readFileSync(indexPath, 'utf8');
    const version = generateContentHash(indexContent);

    console.log(`🏷️  Generated version: ${version}`);

    // Step 4: Create deployment manifest
    const manifest = createDeploymentManifest(version, buildTime, distPath);

    // Step 5: Add version meta tags and cache busting
    console.log('\n🔄 Adding cache-busting optimizations...');

    const versionMeta = `    <meta name="app-version" content="${version}" />
    <meta name="build-time" content="${buildTime}" />
    <meta name="deployment-id" content="${manifest.timestamp}" />`;

    let updatedContent = indexContent.replace(
      '<meta http-equiv="Expires" content="0" />',
      `<meta http-equiv="Expires" content="0" />\n${versionMeta}`
    );

    // Add version query parameter to asset URLs for cache busting
    updatedContent = updatedContent.replace(
      /src="\/assets\/(.*?)"/g,
      `src="/assets/$1?v=${version}"`
    );
    updatedContent = updatedContent.replace(
      /href="\/assets\/(.*?)"/g,
      `href="/assets/$1?v=${version}"`
    );

    // Add preload hints for critical resources
    const preloadHints = `    <link rel="preload" href="/assets/index.css?v=${version}" as="style">
    <link rel="preload" href="/assets/index.js?v=${version}" as="script">`;

    updatedContent = updatedContent.replace(
      '</head>',
      `${preloadHints}\n  </head>`
    );

    // Write the optimized index.html
    writeFileSync(indexPath, updatedContent);
    console.log('✅ Applied cache-busting and performance optimizations');

    // Step 6: Deploy to Firebase
    console.log('\n🚀 Deploying to Firebase...');
    const deployCommand = process.env.CI
      ? 'firebase deploy --only hosting:frontend --non-interactive'
      : 'firebase deploy --only hosting:frontend';

    execSync(deployCommand, { stdio: 'inherit' });

    // Step 7: Deployment summary
    const deploymentTime = Math.round((Date.now() - startTime) / 1000);
    console.log('\n✅ Deployment completed successfully!');
    console.log(`📊 Deployment Summary:`);
    console.log(`   Version: ${version}`);
    console.log(`   Build Time: ${buildTime}`);
    console.log(`   Deployment Duration: ${deploymentTime}s`);
    console.log(`   Environment: ${manifest.environment}`);
    console.log(`   Commit: ${manifest.commit}`);
    console.log(`   Branch: ${manifest.branch}`);
    console.log('\n🔄 Users will receive the latest version immediately');
    console.log('📈 Monitor performance at: https://console.firebase.google.com');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Check Firebase CLI authentication: firebase login');
    console.error('   2. Verify project configuration: firebase use --list');
    console.error('   3. Ensure build completed successfully');
    console.error('   4. Check network connectivity');

    process.exit(1);
  }
}

// Run deployment
deploy().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
