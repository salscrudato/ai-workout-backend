#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the main package.json
const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create a minimal package.json for the dist folder
const distPackage = {
  name: mainPackage.name,
  version: mainPackage.version,
  description: mainPackage.description,
  main: "index.js",
  type: "commonjs", // Firebase Functions use CommonJS
  engines: mainPackage.engines,
  dependencies: mainPackage.dependencies
};

console.log('📦 Creating dist package.json with:', JSON.stringify(distPackage, null, 2));

// Write the dist package.json
fs.writeFileSync('dist/package.json', JSON.stringify(distPackage, null, 2));

console.log('✅ Created dist/package.json with correct main entry point');
