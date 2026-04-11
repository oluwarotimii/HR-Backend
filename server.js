/**
 * Production entry point for cPanel
 * Runs the compiled CommonJS backend from dist/
 */

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Femtech HR API...');

// Load the compiled Express app
const app = require('./dist/index.js');

// The dist/index.js should already call app.listen(),
// but we ensure it here just in case
const PORT = process.env.PORT || 3000;

if (app && typeof app.listen === 'function') {
  app.listen(PORT, () => {
    console.log(`✅ Femtech HR API running on port ${PORT}`);
    const appUrl = process.env.APP_URL || `https://hrapi.femtechaccess.com.ng`;
    console.log(`📡 Access at: ${appUrl}`);
  });
}
