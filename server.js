// Production server entry point for cPanel
// ES module compatible - imports built backend

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

try {
  // Import the built Express app
  const { default: app } = await import('./dist/index.js');
  
  console.log('✅ Femtech HR API backend loaded');
  console.log(`📡 Starting server on port ${PORT}...`);
  
  // The dist/index.js should already call app.listen(), 
  // but we ensure it here just in case
  if (app && typeof app.listen === 'function') {
    app.listen(PORT, () => {
      console.log(`✅ Femtech HR API running on port ${PORT}`);
      console.log(`📡 Access at: https://hrapi.tripa.com.ng`);
    });
  }
} catch (error) {
  console.error('❌ Failed to start backend:', error.message);
  console.error(error.stack);
  process.exit(1);
}
