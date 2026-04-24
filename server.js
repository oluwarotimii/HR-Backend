/**
 * Production entry point for cPanel
 * Runs the compiled CommonJS backend from dist/
 */

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Femtech HR API...');

// Load the compiled Express app.
// dist/index.js already starts the HTTP server, so we only need to require it here.
require('./dist/index.js');
