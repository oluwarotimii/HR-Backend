#!/bin/bash

# Render Deployment Setup Script
# Run this script to prepare your backend for Render deployment

set -e

echo "🚀 Preparing HR Backend for Render Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the Backend directory${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Running in correct directory${NC}"

# Step 1: Install dependencies
echo ""
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 2: Build TypeScript
echo ""
echo -e "${YELLOW}Step 2: Building TypeScript...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}"

# Step 3: Verify build
echo ""
echo -e "${YELLOW}Step 3: Verifying build...${NC}"
node scripts/verify-build.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build verification passed${NC}"
else
    echo -e "${RED}✗ Build verification failed${NC}"
    exit 1
fi

# Step 4: Check environment file
echo ""
echo -e "${YELLOW}Step 4: Checking environment configuration...${NC}"
if [ -f ".env.render" ]; then
    echo -e "${GREEN}✓ .env.render found${NC}"
    echo -e "${BLUE}  Next steps:${NC}"
    echo "    1. Copy .env.render to .env on your Render instance"
    echo "    2. Update with your actual database credentials"
    echo "    3. Generate secure JWT secrets"
else
    echo -e "${YELLOW}! .env.render not found (should have been created)${NC}"
fi

# Step 5: Git check
echo ""
echo -e "${YELLOW}Step 5: Checking Git status...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Git repository detected${NC}"
    
    UNCOMMITTED=$(git status --porcelain)
    if [ -n "$UNCOMMITTED" ]; then
        echo -e "${YELLOW}! You have uncommitted changes:${NC}"
        git status --short
        echo ""
        echo -e "${BLUE}  Recommended: Commit changes before deploying${NC}"
        echo "    git add ."
        echo "    git commit -m 'Prepare for Render deployment'"
    else
        echo -e "${GREEN}✓ Working tree clean${NC}"
    fi
    
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "${BLUE}  Current branch: ${CURRENT_BRANCH}${NC}"
    echo -e "${BLUE}  Make sure this branch is pushed to GitHub/GitLab${NC}"
else
    echo -e "${YELLOW}! Git repository not detected${NC}"
    echo -e "${BLUE}  To initialize:${NC}"
    echo "    git init"
    echo "    git add ."
    echo "    git commit -m 'Initial commit'"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Ready for Render Deployment!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Push your code to GitHub/GitLab:"
echo -e "   ${YELLOW}git push origin ${CURRENT_BRANCH:-main}${NC}"
echo ""
echo "2. Create a new Web Service on Render:"
echo -e "   ${YELLOW}https://dashboard.render.com/new${NC}"
echo ""
echo "3. Configure your service:"
echo "   - Root Directory: Backend"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: node dist/index.js"
echo ""
echo "4. Set up your database (TiDB Cloud recommended):"
echo -e "   ${YELLOW}https://tidbcloud.com${NC}"
echo ""
echo "5. Add environment variables on Render:"
echo "   - DATABASE_URL (from your database provider)"
echo "   - JWT_SECRET (generate secure random string)"
echo "   - JWT_REFRESH_SECRET (generate secure random string)"
echo "   - NODE_ENV=production"
echo ""
echo -e "${BLUE}For detailed instructions, see:${NC}"
echo "   RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "=========================================="
echo ""
