# Build Command Configuration - Railway & Vercel

## Overview

Build commands tell the deployment platform how to prepare your app for production. Here's what to use for each service.

---

## BACKEND (Node.js) - Railway

### Automatic Detection
Railway **automatically detects** Node.js projects. Usually no custom build command needed.

### Default Behavior
- Detects `package.json`
- Runs: `npm install`
- Runs: `npm start` (from package.json start script)
- Starts on port specified in environment

### Custom Build Command (Optional)

If you need a custom build step, use:

```bash
npm run build
```

**When to use custom build**:
- Transpiling TypeScript: `npm run build`
- Running migrations: `npm run migrate`
- Building assets: `npm run assets`

### Configuration on Railway

**In Railway Dashboard**:
1. Go to your project
2. Click the backend service (`realtime-poll-backend`)
3. Click **"Settings"**
4. Look for **"Build Command"** field
5. Leave **blank** (uses default) OR enter custom command
6. Save and redeploy

### For Our Backend

**Package.json contains**:
```json
{
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

**On Railway**:
- **Build Command**: Leave blank (uses default)
- **Start Command**: Auto-detected as `npm start` ✅

---

## FRONTEND (React) - Vercel

### Automatic Detection
Vercel **automatically detects** React apps and sets build command.

### Default Configuration

Vercel automatically sets:

| Field | Value |
|-------|-------|
| **Framework** | Create React App |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

### Manual Configuration

**In Vercel Dashboard**:
1. Go to your project
2. Click **"Settings"**
3. Click **"Build & Development Settings"**
4. Scroll to **"Build Command"**

```
Build Command:     npm run build
Output Directory:  build
Install Command:   npm install
Development:       npm start
```

### For Our Frontend

**Package.json contains**:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

**On Vercel** ✅ (All auto-configured):
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

---

## Configuration Step-by-Step

### Railway Backend Configuration

1. **Go to Railway Dashboard**
   - https://railway.app/dashboard

2. **Click Your Project**
   - Find "realtime-poll-backend"

3. **Click the Service**
   - Select the backend service card

4. **Go to Settings**
   - Find **Settings** tab
   - Scroll to **Build Command**

5. **Set Build Command**
   ```
   Leave BLANK
   ```
   (Uses default `npm start` from package.json)

6. **Environment Variables**
   - Verify these are set:
     ```
     MONGODB_URI=mongodb+srv://...
     NODE_ENV=production
     ```

7. **Save & Deploy**
   - Click "Deploy" or "Redeploy"
   - Wait 2-3 minutes for build

### Vercel Frontend Configuration

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Your Project**
   - Click "realtime-poll-frontend"

3. **Go to Settings**
   - Settings → Build & Development Settings

4. **Verify Build Settings**
   ```
   Build Command:     npm run build
   Output Directory:  build
   Install Command:   npm install
   ```

5. **Save Changes**
   - Click "Save"
   - Vercel auto-redeploys

6. **Check Deployment**
   - Go to "Deployments" tab
   - Wait for build to complete
   - Check "Build Logs" if error occurs

---

## What Each Command Does

### Backend (Node.js)

**`npm start`**
```bash
# Runs the start script from package.json
# Our backend: node server.js
# Starts the Express server on port 3002
# Listens for HTTP requests
# Connects to MongoDB
```

**`npm run build`** (if you add it)
```bash
# Could transpile TypeScript
# Could bundle/minify code
# Could run migrations
# Not needed for our simple backend
```

### Frontend (React)

**`npm run build`**
```bash
# Creates optimized production build
# Output: ./build/ folder
# Minifies JavaScript & CSS
# Optimizes images
# Creates source maps
# Ready for deployment
```

**Output**:
```
build/
├── index.html          (Main HTML file)
├── static/
│   ├── js/
│   │   ├── main.xxx.js (Bundled JavaScript)
│   │   └── ...
│   └── css/
│       ├── main.xxx.css (Bundled CSS)
│       └── ...
└── favicon.ico
```

---

## Environment Variables

### Set in Railway

1. **Go to Variables tab**
2. **Add variables**:

```
Key: MONGODB_URI
Value: mongodb+srv://Bharatverse16:Bharatverse16@cluster0.isvdyer.mongodb.net/?appName=Cluster0

Key: NODE_ENV
Value: production
```

3. **Save**
4. **Railway auto-redeploys** with new variables

### Set in Vercel

1. **Go to Settings → Environment Variables**
2. **Add variables** (optional):

```
REACT_APP_API_URL = https://your-railway-url.up.railway.app
REACT_APP_SOCKET_URL = https://your-railway-url.up.railway.app
```

3. **Select environments** (Production / Preview / Development)
4. **Save**
5. **Vercel auto-redeploys** with new variables

---

## Troubleshooting Build Failures

### Issue: "npm not found"

**Cause**: Node.js not installed on platform
**Solution**: 
- Railway should auto-install Node.js
- Check `package.json` exists in root of service directory
- For Railway: Restart the build

### Issue: "Cannot find module"

**Cause**: Dependencies not installed
**Solution**:
- Verify `package.json` lists all dependencies
- Check `package-lock.json` exists
- Reinstall locally: `npm install`
- Push changes: `git push`
- Redeploy

### Issue: Build succeeds but app doesn't start

**Cause**: Wrong start command
**Solution**:
- Check `package.json` has correct `start` script
- Verify environment variables are set
- Check logs for error messages

### Issue: "Port already in use"

**Cause**: Another app using the port
**Solution** (for Railway):
- Railway manages ports automatically
- App should listen on `process.env.PORT`
- Not an issue in production

### Issue: Build times out (>30 min)

**Cause**: Very large dependencies or build process
**Solution**:
- Optimize dependencies
- Remove unused packages
- Check for infinite loops in build script
- Contact support

---

## Advanced Build Configurations

### If You Want to Add TypeScript

**Backend**:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node server.ts"
  }
}
```

**Then on Railway**, set:
- Build Command: `npm run build`

### If You Want to Run Database Migrations

```json
{
  "scripts": {
    "build": "npm run migrate",
    "migrate": "node scripts/migrate.js",
    "start": "node server.js"
  }
}
```

**Then on Railway**, set:
- Build Command: `npm run build`

### If You Want to Add Pre-deployment Tests

```json
{
  "scripts": {
    "test": "jest",
    "build": "npm run test && tsc",
    "start": "node dist/server.js"
  }
}
```

---

## Current Setup Summary

### Backend (Railway)

| Setting | Value | Notes |
|---------|-------|-------|
| Framework | Node.js | Auto-detected |
| Build Command | (blank) | Uses default `npm start` |
| Start Command | (auto) | Runs `npm start` from package.json |
| Port | 3002 | From .env PORT variable |
| Environment | NODE_ENV=production | Set in Railway Variables |

### Frontend (Vercel)

| Setting | Value | Notes |
|---------|-------|-------|
| Framework | React | Auto-detected |
| Build Command | npm run build | Standard React build |
| Output Directory | build | Where compiled files go |
| Install Command | npm install | Standard npm install |
| Node Version | 18.x | Auto-selected |

---

## Deployment Checklist

Before deploying, verify:

- [ ] **Backend**
  - [ ] `package.json` has `"start": "node server.js"`
  - [ ] `.env` file NOT committed to git
  - [ ] Environment variables set in Railway dashboard
  - [ ] MongoDB connection string is valid
  - [ ] CORS configured for production frontend URL

- [ ] **Frontend**
  - [ ] `package.json` has `"build": "react-scripts build"`
  - [ ] API endpoint updated to production URL
  - [ ] Socket.IO URL updated to production URL
  - [ ] Environment variables set (optional)
  - [ ] No hardcoded localhost URLs

---

## Quick Commands for Local Testing

**Test backend build**:
```bash
cd realtime-poll-backend
npm install
npm start
# Should see: "Server running on port 3002"
# Should see: "MongoDB Connected"
```

**Test frontend build**:
```bash
cd realtime-poll-frontend
npm install
npm run build
# Creates ./build folder with production files
# Should see: "Build succeeded"
```

**Test production frontend locally**:
```bash
npm install -g serve
serve -s build
# Serves frontend on http://localhost:3000
# Shows optimized production build
```

---

## Next Steps

1. **Verify current configuration**:
   - Check Railway backend settings
   - Check Vercel frontend settings

2. **If using custom build**:
   - Add build script to `package.json`
   - Test locally first
   - Deploy and monitor logs

3. **Monitor builds**:
   - Railway: Check "Build Logs" after deployment
   - Vercel: Check "Build Logs" in Deployments tab

4. **Troubleshoot if needed**:
   - Review logs for errors
   - Check environment variables
   - Verify file structure

---

## Resources

- **Railway Docs**: https://docs.railway.app/deploy/builds
- **Vercel Docs**: https://vercel.com/docs/deployments/configure-a-build
- **Node.js Package Scripts**: https://docs.npmjs.com/misc/scripts
- **React Build**: https://create-react-app.dev/docs/production-build/

