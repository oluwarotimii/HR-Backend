# ✅ Backend Git Deployment Checklist

## 📋 Pre-Deployment

### Verify Files to Commit
- [ ] `src/` folder (all TypeScript source)
- [ ] `server.js` (entry point)
- [ ] `package.json` (dependencies)
- [ ] `tsconfig.json` (TypeScript config)
- [ ] `.gitignore` (ignore rules)

### Verify .gitignore
- [ ] `node_modules/` is ignored
- [ ] `.env` is ignored
- [ ] `dist/` is ignored
- [ ] `uploads/` is ignored

---

## 🎯 cPanel Setup

### Create Node.js App
- [ ] Node.js version: **20.19.4**
- [ ] Application mode: **Production**
- [ ] Application root: **hrapi.tripa.com.ng**
- [ ] Application URL: **https://hrapi.tripa.com.ng**
- [ ] Startup file: **server.js**

### Clone Repository (First Time)
In cPanel → Git Version Control:
- [ ] Repository URL: `https://github.com/your-org/repo.git`
- [ ] Directory: `/home/[username]/hrapi.tripa.com.ng`
- [ ] Branch: **main**
- [ ] Click **Clone**

---

## 🔧 Server Setup

### Install Dependencies
```bash
cd /home/[username]/hrapi.tripa.com.ng
npm install --production
```
- [ ] Dependencies installed

### Create .env File
```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_secret_32_chars
ALLOWED_ORIGINS=https://hrapp.tripa.com.ng,https://hradmin.tripa.com.ng
EOF
```
- [ ] .env created
- [ ] Permissions set: `chmod 600 .env`

### Create Uploads Folder
```bash
mkdir -p uploads
chmod 755 uploads
touch uploads/.gitkeep
```
- [ ] Uploads directory created

---

## 🚀 Deploy

### Push Changes (Local)
```bash
cd /home/frobenius/Desktop/Femtech/HR/Backend
git add .
git commit -m "Deploy: [description]"
git push origin main
```
- [ ] Changes committed
- [ ] Changes pushed

### Pull on Server (via SSH)
```bash
cd /home/[username]/hrapi.tripa.com.ng
git pull origin main
npm install --production  # If package.json changed
```
- [ ] Code pulled successfully
- [ ] Dependencies updated (if needed)

### Restart Application
In cPanel Node.js App:
- [ ] Click **Restart**
- [ ] Wait 20-30 seconds

---

## ✅ Verification

### Check Logs
```bash
tail -f logs/error.log
```
Expected:
```
✅ Database connected
🚀 Server running on port 3000
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

### If tsx not found:
```bash
npm install tsx
```
- [ ] tsx installed

### If module errors:
- [ ] Verify `package.json` has no `"type": "module"`
- [ ] Verify `tsconfig.json` has `"module": "commonjs"`
- [ ] Check `server.js` exists

### If Git issues:
```bash
git status
git pull origin main
```
- [ ] Git repository clean

---

## 📊 Post-Deployment

### Monitor
- [ ] Check logs first 24 hours
- [ ] Monitor error rate
- [ ] Check API response times

### Document
- [ ] Record deployment date
- [ ] Note any issues encountered
- [ ] Update team on changes

---

**Deployed:** _______________  
**By:** _______________  
**Commit:** _______________  
**Status:** ✅ Complete

---

## 🔑 Key Files

| File | Status |
|------|--------|
| `server.js` | ✅ Entry point |
| `src/` | ✅ Source code |
| `package.json` | ✅ Dependencies |
| `.env` | ⚠️ On server only |

---

**Remember:** Always test after deployment!
