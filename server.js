/**
 * Production entry point for cPanel
 * Runs TypeScript source directly using tsx
 */

// Set production environment
process.env.NODE_ENV = 'production';

// Load tsx and run the TypeScript source
require('tsx/cjs');
const path = require('path');

console.log('🚀 Starting Femtech HR API...');

// Import and run the TypeScript source
require(path.join(__dirname, 'src', 'index.ts'));
