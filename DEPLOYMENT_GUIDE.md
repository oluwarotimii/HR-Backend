# 🚀 Backend API - Production Deployment Guide

## ⚠️ Critical: ES Module Issue Fix

The error `ReferenceError: require is not defined` occurs because the backend uses ES modules (`"type": "module"`) but was trying to load a CommonJS file.

### ✅ Solution Applied

Created `server.js` as an ES module entry point that properly imports the built backend.

---

## 🎯 cPanel Configuration

### Setup Node.js App

| Field | Value |
|-------|-------|
| **Node.js version** | `20.19.4` |
| **Application mode** | `Production` |
| **Application root** | `hrapi.tripa.com.ng` |
| **Application URL** | `https://hrapi.tripa.com.ng` |
| **Application startup file** | `server.js` ← **Important!** |

---

## 📁 File Structure

Upload to `/home/[username]/hrapi.tripa.com.ng/`:

```
hrapi.tripa.com.ng/
├── server.js              ← NEW entry point (ES module compatible)
├── package.json           ← Updated with "main": "server.js"
├── .env                   ← Environment variables
├── dist/                  ← Built TypeScript files
│   ├── index.js
│   ├── api/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── ...
└── node_modules/          ← Dependencies
```

---

## 🔧 Deployment Steps

### Step 1: Build Locally

```bash
cd /home/frobenius/Desktop/Femtech/HR/Backend

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
```

This creates the `dist/` folder with compiled JS.

### Step 2: Upload to cPanel

Upload these to `hrapi.tripa.com.ng`:

**Required:**
- ✅ `server.js` (NEW - ES module entry point)
- ✅ `package.json` (updated)
- ✅ `.env` (or create on server)
- ✅ `dist/` (entire folder)

### Step 3: Install Dependencies

```bash
cd /home/[username]/hrapi.tripa.com.ng
npm install --production
```

### Step 4: Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_PORT=5432

# Redis (if using)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key

# CORS
ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/home/[username]/hrapi.tripa.com.ng/uploads
```

### Step 5: Create Uploads Directory

```bash
mkdir -p /home/[username]/hrapi.tripa.com.ng/uploads
chmod 755 /home/[username]/hrapi.tripa.com.ng/uploads
```

### Step 6: Restart Application

In cPanel Node.js App interface:
1. Click **Restart**
2. Wait 15-30 seconds (backend needs to initialize)
3. Check logs

---

## ✅ Verification

### Check Logs

```bash
tail -f /home/[username]/hrapi.tripa.com.ng/logs/error.log
```

**Expected output:**
```
✅ Database connected
✅ Redis connected (if using)
✅ Server running on port 3000
📡 API available at: https://hrapi.tripa.com.ng
```

### Test API Endpoints

```bash
# Health check
curl https://hrapi.tripa.com.ng/api/system-complete/readiness

# Should return JSON with success: true
```

### Test in Browser

Visit: `https://hrapi.tripa.com.ng/api/system-complete/readiness`

Should see JSON response, not error page.

---

## 🐛 Troubleshooting

### Error: `require is not defined`

**Cause:** Trying to run ES module as CommonJS

**Solution:**
1. Ensure `server.js` exists
2. Verify `package.json` has `"type": "module"`
3. Set startup file to `server.js` (not `dist/index.js`)
4. Restart application

### Error: `Cannot find module`

**Solution:**
```bash
# Rebuild locally
npm run build

# Reupload dist/ folder
```

### Error: Database connection failed

**Solution:**
1. Check `.env` has correct DB credentials
2. Verify database exists
3. Check database user permissions
4. Test connection locally first

### Error: CORS issues

**Solution:**
1. Update `ALLOWED_ORIGINS` in `.env`
2. Include both app domains:
   ```
   ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng
   ```

### Application won't start

```bash
# Check Node version
node --version  # Should be v20.x

# Check package.json
cat package.json | grep '"type"'  # Should be "module"

# Check server.js exists
ls -la server.js

# View full logs
cat logs/error.log
```

---

## 📊 Backend Architecture

### Entry Point Flow

```
server.js (ES module)
  ↓
dist/index.js (compiled TypeScript)
  ↓
Express app initialized
  ↓
Routes, middleware, database connected
  ↓
Server listening on PORT
```

### Important Files

| File | Purpose |
|------|---------|
| `server.js` | Entry point for cPanel |
| `dist/index.js` | Main Express app |
| `.env` | Configuration |
| `dist/config/database.js` | DB connection |
| `dist/middleware/auth.middleware.js` | JWT auth |

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong random string (min 32 chars)
- [ ] Database password is strong
- [ ] CORS configured for specific domains only
- [ ] HTTPS enforced (cPanel SSL)
- [ ] File upload limits set
- [ ] Rate limiting enabled
- [ ] Helmet security headers active

---

## 📞 Monitoring

### Check Running Process

```bash
ps aux | grep node
```

### View Logs Real-time

```bash
tail -f /home/[username]/hrapi.tripa.com.ng/logs/error.log
```

### Check Disk Usage

```bash
df -h
du -sh /home/[username]/hrapi.tripa.com.ng/*
```

### Check Memory Usage

```bash
free -m
```

---

## 🔄 Update Procedure

To deploy backend updates:

```bash
# 1. Build locally
cd /home/frobenius/Desktop/Femtech/HR/Backend
npm run build

# 2. Upload new dist/ folder
# (via FTP, Git, or cPanel File Manager)

# 3. Restart in cPanel
# Click Restart button

# 4. Verify
curl https://hrapi.tripa.com.ng/api/system-complete/readiness
```

---

## 📚 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database user | `hr_user` |
| `DB_PASS` | Database password | `secure_password` |
| `DB_NAME` | Database name | `hr_database` |
| `JWT_SECRET` | JWT signing secret | `random_32_char_string` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `ALLOWED_ORIGINS` | CORS domains | `*` |
| `MAX_FILE_SIZE` | Upload limit | `10485760` |
| `UPLOAD_DIR` | Upload folder | `./uploads` |

---

**Version:** 1.0.0  
**Last Updated:** March 25, 2026  
**Status:** ✅ Production Ready

---

## 🎉 Success Indicators

Your backend is running correctly when:

- ✅ Logs show "Server running on port XXXX"
- ✅ `/api/system-complete/readiness` returns JSON
- ✅ No errors in logs
- ✅ Frontend apps can authenticate
- ✅ Database queries work
- ✅ File uploads succeed

---

**Deploy with confidence! 🚀**
