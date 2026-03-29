#!/usr/bin/env node

/**
 * Render Build Verification Script
 * Verifies that the build completed successfully
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build...');

const requiredFiles = [
  'dist/index.js',
  'dist/api/index.js',
  'dist/config/database.js',
  'dist/middleware/auth.middleware.js',
];

const requiredDirs = [
  'dist/api',
  'dist/config',
  'dist/middleware',
  'dist/models',
  'dist/services',
  'dist/controllers',
];

let hasErrors = false;

// Check required files
console.log('\n📄 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check required directories
console.log('\n📁 Checking required directories...');
requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, '..', dir))) {
    console.log(`   ✓ ${dir}`);
  } else {
    console.log(`   ✗ ${dir} - MISSING`);
    hasErrors = true;
  }
});

// Check package.json
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
if (packageJson.scripts && packageJson.scripts.start) {
  console.log(`   ✓ Start script: ${packageJson.scripts.start}`);
} else {
  console.log(`   ✗ Start script missing`);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n❌ Build verification failed!');
  process.exit(1);
} else {
  console.log('\n✅ Build verification successful!');
  process.exit(0);
}
