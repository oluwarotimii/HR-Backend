# Backend Deployment Script for cPanel
# Run this on the server via SSH

#!/bin/bash

echo "🚀 Starting Femtech HR Backend Deployment..."

# Navigate to app directory
cd /home/ptzxhqgs/hrapi.tripa.com.ng || exit 1

echo "📦 Pulling latest code from Git..."
git pull origin main

echo "📦 Installing dependencies (including tsx)..."
npm install --production

echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Create .env file with your environment variables"
echo "2. Restart the application in cPanel"
echo ""
echo "To create .env, run:"
echo "cat > .env << 'EOF'"
echo "NODE_ENV=production"
echo "PORT=3000"
echo "DB_HOST=localhost"
echo "DB_USER=your_db_user"
echo "DB_PASS=your_db_password"
echo "DB_NAME=your_db_name"
echo "JWT_SECRET=your_secret_key_32_chars_min"
echo "ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng"
echo "EOF"
