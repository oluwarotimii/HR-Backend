# 🚀 Backend API - Git Deployment Guide (cPanel)

## ✅ Git-Based Deployment

Since you're using Git version control, deployment is streamlined:

---

## 🎯 cPanel Configuration

### Setup Node.js App

| Field | Value |
|-------|-------|
| **Node.js version** | `20.19.4` |
| **Application mode** | `Production` |
| **Application root** | `hrapi.tripa.com.ng` |
| **Application URL** | `https://hrapi.tripa.com.ng` |
| **Application startup file** | `server.js` |

---

## 📁 What's Tracked in Git

### ✅ Committed Files
```
Backend/
├── src/                    ← TypeScript source
│   ├── index.ts
│   ├── api/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── ...
├── server.js               ← Entry point (NEW)
├── package.json            ← Dependencies & scripts
├── tsconfig.json           ← TypeScript config
├── .gitignore              ← Git ignore rules
└── scripts/                ← Setup scripts
```

### ❌ Ignored Files (not in Git)
```
node_modules/               ← Install on server
dist/                       ← Not needed with tsx
.env                        ← Create on server
uploads/                    ← Created on server
logs/                       ← cPanel logs
```

---

## 🔧 Deployment Steps

### Option 1: cPanel Git Version Control (Recommended)

#### Step 1: Clone Repository in cPanel

In cPanel → **Git Version Control**:

1. Click **Create**
2. Repository URL: `https://github.com/your-org/your-repo.git`
3. Directory: `/home/[username]/hrapi.tripa.com.ng`
4. Branch: `main` (or your branch)
5. Click **Clone**

#### Step 2: Configure Node.js App

In cPanel → **Setup Node.js App**:

1. Select existing app or create new one
2. Set **Application root**: `hrapi.tripa.com.ng`
3. Set **Startup file**: `server.js`
4. Click **Save**

#### Step 3: Install Dependencies

Via SSH or Terminal:
```bash
cd /home/[username]/hrapi.tripa.com.ng
npm install --production
```

#### Step 4: Create Environment File

Create `.env` in `hrapi.tripa.com.ng`:
```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_secret_key_32_chars_min
ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng
EOF
```

#### Step 5: Create Uploads Directory
```bash
mkdir -p uploads
chmod 755 uploads
touch uploads/.gitkeep
```

#### Step 6: Restart Application

In cPanel Node.js App interface:
1. Click **Restart**
2. Wait 20-30 seconds

---

### Option 2: Manual Git Pull

#### On Server (via SSH):

```bash
cd /home/[username]/hrapi.tripa.com.ng

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart app (in cPanel or via command)
```

---

### Option 3: Push to Deploy (Automated)

If your hosting supports it (e.g., Heroku, Railway, Vercel):

1. Connect repository in hosting panel
2. Push to `main` branch
3. Automatic deployment triggered

---

## 🔄 Update Procedure

### To Deploy Updates:

```bash
# 1. Commit changes locally
cd /home/frobenius/Desktop/Femtech/HR/Backend
git add .
git commit -m "Fix: [description]"
git push origin main

# 2. On server (via SSH):
cd /home/[username]/hrapi.tripa.com.ng
git pull origin main
npm install --production  # Only if package.json changed

# 3. Restart in cPanel
# Click Restart button
```

---

## ✅ Verification

### Check Logs
```bash
tail -f /home/[username]/hrapi.tripa.com.ng/logs/error.log
```

**Expected:**
```
✅ Database connected
🚀 Server running on port 3000
```

### Test API
```bash
curl https://hrapi.tripa.com.ng/api/system-complete/readiness
```

### Check Git Status
```bash
cd /home/[username]/hrapi.tripa.com.ng
git status  # Should be clean after pull
git log -1  # Latest commit
```

---

## 🐛 Troubleshooting

### Error: `Cannot find module 'tsx'`

```bash
cd /home/[username]/hrapi.tripa.com.ng
npm install tsx
```

### Error: `require is not defined`

Verify these files are correct:
```bash
# Check package.json doesn't have "type": "module"
cat package.json | grep '"type"'

# Check tsconfig.json has "module": "commonjs"
cat tsconfig.json | grep '"module"'

# Check server.js exists
ls -la server.js
```

### Git Issues

#### Pull fails - local changes conflict:
```bash
# Stash local changes
git stash

# Pull latest
git pull origin main

# Apply stashed changes (if needed)
git stash pop
```

#### Wrong branch:
```bash
# Switch to main
git checkout main
git pull origin main
```

#### Missing files:
```bash
# Reset to match remote
git fetch origin
git reset --hard origin/main
```

---

## 📊 Git Workflow

### Development Flow:
```
Local Development
  ↓
git add .
git commit -m "feature: description"
git push origin main
  ↓
Server (cPanel)
  ↓
git pull origin main
npm install (if needed)
Restart app
```

### Branch Strategy (Optional):
```
main          ← Production-ready
develop       ← Development branch
feature/*     ← New features
bugfix/*      ← Bug fixes
```

---

## 🔐 Security with Git

### Never Commit:
- ❌ `.env` files
- ❌ API keys/secrets
- ❌ Database credentials
- ❌ Uploads folder contents

### Always Commit:
- ✅ Source code (`src/`)
- ✅ `package.json`
- ✅ Configuration files (`.json`, `.ts`)
- ✅ Entry point (`server.js`)

### Environment Variables on Server:

Create `.env` on server only:
```bash
# On server via SSH:
cd /home/[username]/hrapi.tripa.com.ng
cat > .env << EOF
NODE_ENV=production
# ... other variables
EOF

# Set permissions
chmod 600 .env
```

---

## 📚 File Reference

| File | Git Tracked | Purpose |
|------|-------------|---------|
| `src/` | ✅ Yes | TypeScript source |
| `server.js` | ✅ Yes | Entry point |
| `package.json` | ✅ Yes | Dependencies |
| `tsconfig.json` | ✅ Yes | TypeScript config |
| `.gitignore` | ✅ Yes | Git ignore rules |
| `node_modules/` | ❌ No | Dependencies |
| `.env` | ❌ No | Environment variables |
| `dist/` | ❌ No | Build output |
| `uploads/` | ❌ No | User uploads |

---

## 🎉 Success Indicators

- ✅ `git pull` succeeds without conflicts
- ✅ `npm install` completes
- ✅ App restarts without errors
- ✅ Logs show "Server running"
- ✅ API responds correctly
- ✅ Frontend apps connect successfully

---

## 📞 Quick Commands

### Deploy Update:
```bash
# Server (SSH):
cd /home/[username]/hrapi.tripa.com.ng
git pull origin main
npm install --production
# Restart in cPanel
```

### Check Status:
```bash
git status
git log -1
npm list tsx
```

### View Logs:
```bash
tail -f logs/error.log
```

---

**Version:** 1.0.0  
**Last Updated:** March 25, 2026  
**Deployment:** Git-based  
**Status:** ✅ Production Ready

**Deploy with Git! 🚀**
