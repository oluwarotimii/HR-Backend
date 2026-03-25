/**
 * Production entry point for cPanel
 * Runs the built CommonJS backend from dist/
 */

// Set production environment
process.env.NODE_ENV = 'production';

// Load the built Express app
const app = require('./dist/index.js');

console.log('✅ Femtech HR API backend loaded');
console.log('📡 Starting server...');

// The dist/index.js should already call app.listen(),
// but we ensure it here just in case
const PORT = process.env.PORT || 3000;

if (app && typeof app.listen === 'function') {
  app.listen(PORT, () => {
    console.log(`✅ Femtech HR API running on port ${PORT}`);
    console.log(`📡 Access at: https://hrapi.tripa.com.ng`);
  });
}
