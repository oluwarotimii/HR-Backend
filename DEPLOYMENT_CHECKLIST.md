# ✅ Backend Deployment Checklist - hrapi.tripa.com.ng

## ⚠️ Critical Fix Applied

**Problem:** `ReferenceError: require is not defined`  
**Cause:** ES module package trying to run as CommonJS  
**Solution:** Created `server.js` as ES module entry point

---

## 🎯 cPanel Configuration

### Create Node.js App
- [ ] Node.js version: **20.19.4**
- [ ] Application mode: **Production**
- [ ] Application root: **hrapi.tripa.com.ng**
- [ ] Application URL: **https://hrapi.tripa.com.ng**
- [ ] Startup file: **server.js** ← NOT `dist/index.js`

---

## 📦 Upload Files

### Required Files (upload to hrapi.tripa.com.ng/)
- [ ] `server.js` - ES module entry point (NEW!)
- [ ] `package.json` - Updated with `"main": "server.js"`
- [ ] `.env` - Environment variables
- [ ] `dist/` - Entire build folder

### DO NOT Upload
- [ ] ❌ `node_modules/`
- [ ] ❌ `src/`
- [ ] ❌ `.git/`

---

## 🔧 Server Setup

### Install Dependencies
```bash
cd /home/[username]/hrapi.tripa.com.ng
npm install --production
```
- [ ] Dependencies installed

### Environment Variables
Create `.env`:
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_secret_key_32_chars_min
ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng
```
- [ ] .env file created

### Create Uploads Folder
```bash
mkdir -p uploads
chmod 755 uploads
```
- [ ] Uploads directory created

### Restart Application
- [ ] Click **Restart** in cPanel
- [ ] Wait 20-30 seconds
- [ ] Check logs

---

## ✅ Verification

### Check Logs
```bash
tail -f logs/error.log
```
Expected:
```
✅ Database connected
✅ Server running on port 3000
📡 Access at: https://hrapi.tripa.com.ng
```
- [ ] No errors in logs
- [ ] Database connected
- [ ] Server running

### Test API
```bash
curl https://hrapi.tripa.com.ng/api/system-complete/readiness
```
- [ ] Returns JSON response
- [ ] `success: true` in response

### Browser Test
Visit: `https://hrapi.tripa.com.ng/api/system-complete/readiness`
- [ ] JSON displays (not error page)

### Frontend Integration
- [ ] PWA (hrapp.tripa.com.ng) can connect
- [ ] Admin (hradmin.tripa.com.ng) can connect
- [ ] No CORS errors
- [ ] Authentication works

---

## 🐛 Troubleshooting

### If `require is not defined` error:
- [ ] Verify `server.js` is startup file (not `dist/index.js`)
- [ ] Check `package.json` has `"type": "module"`
- [ ] Restart application

### If database connection fails:
- [ ] Check `.env` DB credentials
- [ ] Verify database exists
- [ ] Test: `psql -U username -d database_name`

### If CORS errors:
- [ ] Update `ALLOWED_ORIGINS` in `.env`
- [ ] Include both app domains
- [ ] Restart application

### If uploads fail:
- [ ] Check `uploads/` folder exists
- [ ] Verify permissions: `chmod 755 uploads`
- [ ] Check `UPLOAD_DIR` in .env

---

## 📊 Post-Deployment

### Monitor
- [ ] Check logs first 24 hours
- [ ] Monitor error rate
- [ ] Check API response times
- [ ] Watch disk usage

### Security
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] File upload limits set

---

**Deployed:** _______________  
**By:** _______________  
**Status:** ✅ Complete

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `server.js` | ES module entry point |
| `dist/index.js` | Built Express app |
| `.env` | Configuration |
| `uploads/` | File uploads |

---

**Remember:** Startup file MUST be `server.js`, not `dist/index.js`!
