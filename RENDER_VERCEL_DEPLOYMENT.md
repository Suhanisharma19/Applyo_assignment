# Deploy to Render.com + Vercel - Complete Step-by-Step Guide

## Overview

Deploy your app **completely FREE** using:
- **Frontend**: Vercel (FREE)
- **Backend**: Render.com (FREE)
- **Database**: MongoDB Atlas (FREE 512MB)

**Total Cost**: $0/month ✅

---

## PART 1: Deploy Backend to Render.com

### Step 1.1: Create Render Account

1. Go to https://render.com
2. Click **"Sign Up"**
3. Sign up with GitHub (easiest)
   - Click **"Sign up with GitHub"**
   - Authorize Render
4. Verify email (might need to check email)
5. You're logged in ✅

### Step 1.2: Create New Service

**In Render Dashboard**:

1. Click **"New+"** button (top right)
2. Click **"Web Service"**
3. Click **"Build and deploy from a Git repository"**

### Step 1.3: Connect GitHub Repository

1. **Select Repository**:
   - You should see your repositories listed
   - Find: `Applyo_assignment`
   - Click **"Connect"** next to it

2. **If not listed**:
   - Click **"Connect GitHub account"** button
   - Authorize Render to access your repos
   - Refresh page
   - Select `Applyo_assignment`

### Step 1.4: Configure Render Service

**After connecting repo, fill in the form**:

| Field | Value |
|-------|-------|
| **Name** | `realtime-poll-backend` |
| **Environment** | `Node` |
| **Region** | `us-east` (or your region) |
| **Branch** | `main` |
| **Build Command** | Leave blank |
| **Start Command** | Leave blank |
| **Runtime** | `node-18` |

### Step 1.5: Set Root Directory

**⚠️ IMPORTANT - This is the fix for your Railway issue!**

1. **Look for "Root Directory" field** (scroll down)
2. **Enter**: `realtime-poll-backend`
3. **This tells Render where your app is**

### Step 1.6: Add Environment Variables

1. Scroll to **"Environment"** section
2. Click **"Add Environment Variable"**

**Add these variables**:

```
Key: MONGODB_URI
Value: mongodb+srv://Bharatverse16:Bharatverse16@cluster0.isvdyer.mongodb.net/?appName=Cluster0

Key: NODE_ENV
Value: production

Key: PORT
Value: 3000
```

3. Click **"Add"** after each one

### Step 1.7: Choose Free Plan

1. Scroll to **"Pricing"** section
2. Select **"Free"** plan
3. Note: App will spin down after 15 min of inactivity (restarts in ~30 sec when accessed)

### Step 1.8: Deploy

1. Click **"Create Web Service"** button
2. Wait for deployment (3-5 minutes)

**Watch the logs**:
- Should see: `Installing dependencies`
- Should see: `npm install` running
- Should see: `Starting server`
- Should see: `Server running on port 3000`
- Should see: `MongoDB Connected`

✅ Backend is live!

### Step 1.9: Get Backend URL

1. After deployment completes
2. Look for **"Live Service URL"** (top of page)
3. Copy it (looks like: `https://realtime-poll-backend-xxxx.onrender.com`)
4. **Save this URL - you need it for frontend!**

---

## PART 2: Update Frontend for Render Backend

### Step 2.1: Update API Endpoints

**Edit file**: `realtime-poll-frontend/src/pages/PollPage.js`

Find these lines:
```javascript
const response = await axios.get('http://localhost:3002/api/polls/${id}');
const socket = io('http://localhost:3002');
```

Replace with your Render URL:
```javascript
const response = await axios.get('https://your-render-url.onrender.com/api/polls/${id}');
const socket = io('https://your-render-url.onrender.com');
```

**Example**:
```javascript
const response = await axios.get('https://realtime-poll-backend-xyz123.onrender.com/api/polls/${id}');
const socket = io('https://realtime-poll-backend-xyz123.onrender.com');
```

**Edit file**: `realtime-poll-frontend/src/pages/CreatePoll.js`

Find:
```javascript
const response = await axios.post('http://localhost:3002/api/polls', {
```

Replace with:
```javascript
const response = await axios.post('https://your-render-url.onrender.com/api/polls', {
```

### Step 2.2: Find & Replace All

**Use VS Code Find & Replace**:
1. Press `Ctrl + Shift + H`
2. Find: `http://localhost:3002`
3. Replace: `https://your-render-url.onrender.com`
4. Click "Replace All"

### Step 2.3: Push Changes

```bash
cd c:\Users\suhan\applyo
git add .
git commit -m "Update API endpoints for Render backend"
git push origin main
```

---

## PART 3: Update Backend CORS for Vercel Frontend

### Step 3.1: Update Backend CORS

**Edit file**: `realtime-poll-backend/server.js`

Find:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

Replace with:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://realtime-poll-frontend.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Also update Socket.IO CORS in same file:
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://realtime-poll-frontend.vercel.app'  // Add this
    ],
    credentials: true,
    optionsSuccessStatus: 200
  },
  transports: ['websocket', 'polling']
});
```

### Step 3.2: Push Backend Update

```bash
cd c:\Users\suhan\applyo\realtime-poll-backend
git add .
git commit -m "Update CORS for Vercel frontend"
git push origin main
```

**Render auto-redeploys** after push! (takes ~2 min)

---

## PART 4: Deploy Frontend to Vercel

### Step 4.1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel
4. You're logged in ✅

### Step 4.2: Import Project

**In Vercel Dashboard**:

1. Click **"Add New..."**
2. Click **"Project"**
3. Click **"Import Git Repository"**
4. Paste: `https://github.com/Suhanisharma19/Applyo_assignment`
5. Click **"Import"**

### Step 4.3: Configure Frontend

**After import, Vercel shows settings**:

1. **Project Name**: `realtime-poll-frontend`

2. **Root Directory**: 
   - Click the dropdown
   - Select: `realtime-poll-frontend`

3. **Framework Preset**: 
   - Should auto-detect: `Create React App`

4. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Environment Variables** (optional):
   ```
   REACT_APP_API_URL = https://your-render-url.onrender.com
   ```

6. Click **"Deploy"**

### Step 4.4: Wait for Deployment

- Vercel builds and deploys (3-5 minutes)
- Shows "Congratulations! Your project has been successfully deployed"

### Step 4.5: Get Frontend URL

- Copy the URL shown (looks like: `https://realtime-poll-frontend-xxx.vercel.app`)
- This is your public app URL! 🎉

---

## PART 5: Test Everything

### Step 5.1: Test Frontend Loads

1. Open your Vercel URL in browser
2. Should see the poll creation form
3. No errors in console (F12 → Console tab)

### Step 5.2: Create a Poll

1. Enter question: "What's your favorite color?"
2. Add options: "Blue", "Red", "Green"
3. Click "Create Poll"
4. Should see success screen with share link

### Step 5.3: Test Share Link

1. Copy the share link
2. Open in **new private/incognito window**
3. Poll should load correctly
4. Vote on an option

### Step 5.4: Test Real-Time Updates

1. Open poll in two browser windows
2. Vote in Window A
3. Watch Window B update automatically
4. If works: Real-time is working! ✅

### Step 5.5: Test Data Persistence

1. Vote and note the count (e.g., 2 votes)
2. Refresh page (F5)
3. Vote count should be the same (not reset to 0)
4. ✅ Data persisted!

---

## Summary: Your Live App

### URLs

```
Frontend:  https://realtime-poll-frontend-xxx.vercel.app
Backend:   https://realtime-poll-backend-xxx.onrender.com
Database:  MongoDB Atlas (cloud-hosted)
```

### Cost

```
Render Backend:     FREE (with spin-down)
Vercel Frontend:    FREE (no restrictions)
MongoDB Atlas:      FREE (512MB)
─────────────────────────────────
Total:             $0/month ✅
```

### How It Works

```
User visits Vercel URL
    ↓
Frontend loads (React app)
    ↓
User creates/votes on poll
    ↓
Frontend calls Render API
    ↓
Render backend validates & saves to MongoDB
    ↓
Real-time updates via WebSocket
    ↓
All users see changes instantly
```

---

## Render Free Tier Details

### What's Included?

- ✅ 0.5 GB RAM (enough for most apps)
- ✅ Shared CPU (good performance)
- ✅ Free SSL/HTTPS
- ✅ Auto-deploys on git push
- ✅ Free database backup

### What's Limited?

- ⚠️ **Spins down after 15 min of inactivity**
  - App goes to sleep if unused for 15 minutes
  - Next request wakes it up (takes ~30 seconds)
  - Good for dev/hobby projects

- ⚠️ Limited to 0.5 GB RAM

### Upgrade When Needed

- **Starter Plan**: $7/month (always on, more RAM)
- **Standard Plan**: $12/month (more resources)

For now, FREE tier is perfect! 🎉

---

## Troubleshooting

### Issue: "Build failed"

**Check**:
1. Root Directory set to `realtime-poll-backend` ✅
2. package.json exists in that folder ✅
3. Check build logs for specific error

**Fix**:
- View build logs in Render dashboard
- Push a git commit to retrigger build

### Issue: "Cannot connect to MongoDB"

**Check**:
1. MONGODB_URI is set in Render environment variables ✅
2. Connection string is correct ✅
3. IP whitelist allows all IPs (0.0.0.0/0) ✅

**Fix**:
1. Go to MongoDB Atlas
2. Network Access
3. Add entry: 0.0.0.0/0 (allows all IPs)

### Issue: "Real-time updates not working"

**Check**:
1. Socket.IO URL updated to Render URL ✅
2. CORS configured for Vercel URL ✅
3. Check browser console (F12) for errors

**Fix**:
- Update Socket.IO URL in PollPage.js
- Push changes
- Render auto-redeploys

### Issue: "App goes to sleep"

**This is normal!**
- Render free tier spins down after 15 min
- Just wait ~30 seconds for it to wake up
- Upgrade to paid plan to prevent this

---

## Quick Command Reference

```bash
# View logs locally
git log --oneline -3

# Check status
git status

# Push changes to trigger Render redeploy
git push origin main

# View git remote
git remote -v
```

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend for Render URL
3. ✅ Deploy frontend to Vercel
4. ✅ Test everything
5. ✅ Share with friends!

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## Comparison: Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Tier** | Yes, unlimited | $5/month free credit |
| **Sleep** | 15 min spin-down | Always running |
| **Perfect for** | Dev/hobby | Production |
| **Cost** | FREE → $7/mo | FREE → $25/mo |

**Choose based on your needs**:
- **Hobby/Dev**: Use Render ✅
- **Production/Critical**: Use Railway ✅

---

**🎉 Ready to deploy? Follow the steps above!**

Your app will be live and FREE within 15 minutes!
