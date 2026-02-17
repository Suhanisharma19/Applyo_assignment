# Deploy Frontend to Vercel + Backend to Railway - Step by Step

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account (free at https://github.com)
- [ ] Vercel account (free at https://vercel.com)
- [ ] Railway account (free at https://railway.app)
- [ ] MongoDB Atlas account with connection string ready
- [ ] Code pushed to GitHub repository

---

## PART 1: Prepare Your Code for Deployment

### Step 1.1: Create GitHub Repository

**On your computer**:
```bash
cd c:\Users\suhan\applyo
git init
git config user.name "Your Name"
git config user.email "your-email@gmail.com"
git add .
git commit -m "Initial commit: RealTime Poll application"
```

**On GitHub.com**:
1. Go to https://github.com/new
2. Name: `realtime-poll`
3. Description: "Real-time polling application"
4. Select Public (easier for deployment)
5. Click "Create repository"

**Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR-USERNAME/realtime-poll.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub

---

## PART 2: Deploy Backend to Railway

### Step 2.1: Create Railway Account

1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub
4. Authorize Railway to access your GitHub account
5. You're logged in ✅

### Step 2.2: Create Railway Project

**In Railway Dashboard**:
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select `realtime-poll` repository
4. Click "Deploy"

Railway will:
- Detect Node.js project automatically
- Install dependencies
- Start building

**Wait for build to complete** (2-3 minutes)

### Step 2.3: Configure Environment Variables

**After build completes**:

1. Click on the `realtime-poll-backend` service
2. Go to the **Variables** tab
3. Click "Add Variable"

**Add these variables**:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/applyo?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |

⚠️ **Get your MongoDB URI**:
- Go to MongoDB Atlas (https://cloud.mongodb.com)
- Select your cluster
- Click "Connect"
- Choose "Connect your application"
- Copy connection string
- Replace `<username>` and `<password>` with your MongoDB credentials

4. After adding variables, Railway auto-redeploys

**Wait for redeployment** (1-2 minutes)

### Step 2.4: Get Backend URL

1. In Railway dashboard, click your project
2. Click `realtime-poll-backend` service
3. Look for **"Deployments"** tab
4. Copy the **"Public URL"** (looks like: `https://realtime-poll-backend.up.railway.app`)

✅ Backend is now live! Test it:
```
Open browser: https://your-railway-url/health
Should see: { "status": "ok" }
```

**Save this URL - you'll need it for frontend!**

---

## PART 3: Update Frontend Configuration

### Step 3.1: Update API Endpoints

**Edit file**: `realtime-poll-frontend/src/pages/PollPage.js`

Find these lines and update them:

**Original** (localhost):
```javascript
const response = await axios.get('http://localhost:3002/api/polls/${id}');
```

**New** (Railway backend):
```javascript
const response = await axios.get('https://your-railway-url.up.railway.app/api/polls/${id}');
```

Also find:
```javascript
const socket = io('http://localhost:3002');
```

Change to:
```javascript
const socket = io('https://your-railway-url.up.railway.app');
```

**Edit file**: `realtime-poll-frontend/src/pages/CreatePoll.js`

Find:
```javascript
const response = await axios.post('http://localhost:3002/api/polls', {
```

Change to:
```javascript
const response = await axios.post('https://your-railway-url.up.railway.app/api/polls', {
```

### Step 3.2: Replace All Occurrences

**Use Find & Replace in VS Code**:
1. Press `Ctrl + Shift + H` (or Cmd + Shift + H on Mac)
2. Find: `http://localhost:3002`
3. Replace: `https://your-railway-url.up.railway.app`
4. Click "Replace All"

### Step 3.3: Push Changes to GitHub

```bash
cd c:\Users\suhan\applyo
git add .
git commit -m "Update API endpoints for Railway backend"
git push origin main
```

✅ Code updated and pushed

---

## PART 4: Deploy Frontend to Vercel

### Step 4.1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. You're logged in ✅

### Step 4.2: Import Project to Vercel

**In Vercel Dashboard**:
1. Click "Add New..."
2. Click "Project"
3. Click "Import Project"
4. Paste GitHub URL: `https://github.com/YOUR-USERNAME/realtime-poll`
5. Click "Import"

Vercel will:
- Detect React app automatically
- Show build settings
- Ask for root directory

**Select Root Directory**:
- From dropdown, select `realtime-poll-frontend`
- Click "Continue"

### Step 4.3: Configure Vercel Deployment

**Environment Variables** (optional, but recommended):

1. Go to **"Environment Variables"** section
2. Add:
   ```
   Key: REACT_APP_API_URL
   Value: https://your-railway-url.up.railway.app
   ```
3. Add:
   ```
   Key: REACT_APP_SOCKET_URL
   Value: https://your-railway-url.up.railway.app
   ```

4. Click "Deploy"

**Wait for deployment** (3-5 minutes)

### Step 4.4: Get Frontend URL

After deployment completes:
1. You'll see **"Congratulations! Your project has been successfully deployed"**
2. Click the project URL (looks like: `https://realtime-poll-frontend.vercel.app`)
3. Your app is LIVE! 🎉

---

## PART 5: Update Backend CORS for Production

Your backend needs to allow requests from your frontend domain.

### Step 5.1: Update Backend Code

**Edit file**: `realtime-poll-backend/server.js`

Find the CORS configuration:
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
    'http://localhost:3000',  // Keep for local testing
    'https://realtime-poll-frontend.vercel.app'  // Add Vercel URL
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

### Step 5.2: Push Backend Update

```bash
cd c:\Users\suhan\applyo\realtime-poll-backend
git add .
git commit -m "Update CORS for Vercel frontend"
git push origin main
```

### Step 5.3: Railway Auto-Redeploys

Railway automatically detects the push and redeploys the backend.

**Check status**:
1. Go to https://railway.app
2. Click your project
3. Watch the **"Build Logs"** tab
4. Wait for "Build successful" message (1-2 minutes)

✅ Backend updated with correct CORS

---

## PART 6: Test Your Deployed App

### Step 6.1: Test Frontend

1. Open https://realtime-poll-frontend.vercel.app
2. Create a test poll: "What's your favorite color?"
   - Options: "Blue", "Red", "Green"
3. Click "Create Poll"
4. You should see the success screen with a share link

### Step 6.2: Test Sharing Link

1. Copy the share link
2. Open in a **new private/incognito window** (to simulate different user)
3. Verify the poll displays correctly
4. Vote on an option
5. Check that vote count updates in real-time

### Step 6.3: Test Real-Time Updates

1. Open the poll in **two browser tabs/windows**
2. In Tab A: Vote for "Blue"
3. In Tab B: Watch the vote count update automatically (should change to 1)
4. In Tab B: Vote for "Red"
5. In Tab A: Watch vote count update for "Red" (should change to 1)

**If real-time doesn't work**:
- Check browser console (F12 → Console tab)
- Look for WebSocket connection errors
- Verify Railway backend URL is correct

### Step 6.4: Test after Page Refresh

1. In poll page, note the current vote counts
2. Press F5 (refresh page)
3. Verify vote counts are the same (not reset to 0)
4. ✅ Data persistence working!

---

## Complete Deployment Summary

### What You've Done ✅

| Component | Platform | Status |
|-----------|----------|--------|
| Frontend | Vercel | ✅ Live |
| Backend | Railway | ✅ Live |
| Database | MongoDB Atlas | ✅ Live |
| Domain | Custom | ⏳ Optional |

### Your Live URLs

```
Frontend:  https://realtime-poll-frontend.vercel.app
Backend:   https://your-railway-url.up.railway.app
Database:  MongoDB Atlas (cloud-hosted)
```

### How to Share Your App

Send this link to users:
```
https://realtime-poll-frontend.vercel.app
```

They can:
- Create polls
- Share links with others
- Vote on polls
- See real-time results

---

## Optional: Add Custom Domain

### Add Domain to Frontend (Vercel)

1. Go to https://vercel.com/dashboard/projects
2. Click your `realtime-poll-frontend` project
3. Click **"Settings"** → **"Domains"**
4. Enter your domain (e.g., `realtime-poll.com`)
5. Follow DNS instructions from your domain registrar
6. Wait 24-48 hours for DNS to propagate

### Add Domain to Backend (Railway)

1. Go to https://railway.app
2. Click your project
3. Click `realtime-poll-backend` service
4. Go to **"Settings"** → **"Public URL"**
5. Add custom domain
6. Update CORS in backend code with new domain
7. Redeploy

---

## Troubleshooting

### Issue: "Cannot GET /api/polls"

**Cause**: Frontend can't reach backend
**Solution**:
1. Check Railway backend URL is correct in frontend code
2. Verify Railway backend is deployed and running
3. Check CORS configuration includes your Vercel URL
4. Redeploy backend after CORS changes

### Issue: Real-time updates not working

**Cause**: WebSocket connection failed
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for WebSocket error messages
4. Verify Socket.IO URL matches backend
5. Check Railway backend logs for errors

### Issue: "Cross-Origin Request Blocked"

**Cause**: CORS not properly configured
**Solution**:
```javascript
// In server.js, check:
app.use(cors({
  origin: 'https://realtime-poll-frontend.vercel.app',  // Exact match
  credentials: true
}));
```

### Issue: MongoDB connection fails

**Cause**: Wrong connection string
**Solution**:
1. Check `MONGODB_URI` in Railway Variables
2. Verify connection string format
3. Ensure IP whitelist allows all IPs (0.0.0.0/0) in MongoDB Atlas
4. Test connection string locally first

### Issue: Railway deployment fails

**Cause**: Missing environment variables
**Solution**:
1. Check Railway Variables tab
2. Verify `MONGODB_URI` is set
3. Verify `NODE_ENV` is set to `production`
4. Check build logs for error messages
5. Redeploy manually

### Issue: Vercel deployment shows blank page

**Cause**: Frontend build error or API endpoint wrong
**Solution**:
1. Check Vercel build logs
2. Verify API endpoint is updated to Railway URL
3. Check browser console for errors
4. Ensure backend is running and accessible

---

## Monitor Your Apps

### Railway Dashboard

Track your backend:
1. Go to https://railway.app
2. Click your project
3. Monitor:
   - Build status
   - Deploy status
   - Network activity
   - Memory usage
   - Error logs

### Vercel Dashboard

Track your frontend:
1. Go to https://vercel.com/dashboard
2. Click `realtime-poll-frontend`
3. Monitor:
   - Deployment status
   - Build logs
   - Performance metrics
   - Error tracking

---

## Cost Breakdown

### Railway
- **Free tier**: First $5 of usage free
- **Typical cost**: $5-10/month for production app
- No credit card required for free tier

### Vercel
- **Free tier**: Includes 1 project, unlimited deployments
- **Typical cost**: FREE (generous free tier)
- Optional Pro plan ($20/month) for advanced features

### MongoDB Atlas
- **Free tier**: M0 cluster (512MB storage, perfect for testing)
- **Typical cost**: FREE (for hobby projects) or $10+/month (production)

### Total Monthly Cost
```
Railway:       $5-10
Vercel:        $0 (free)
MongoDB:       $0-10
─────────────────────
Total:         $5-20/month
```

Much cheaper than Heroku! ✅

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Test thoroughly
4. ✅ Share with friends!
5. (Optional) Add custom domain
6. (Optional) Set up error monitoring
7. (Optional) Add analytics

---

## Quick Reference Commands

```bash
# View current branch and status
git status

# Check what files are uncommitted
git diff

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push origin main

# Check git log
git log --oneline -5

# View Railway logs
railway logs

# View Vercel deployment status
vercel status

# Pull latest changes
git pull origin main
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Socket.IO Docs**: https://socket.io/docs

---

**🎉 Congratulations! Your app is now deployed and live on the internet!**

Share the Vercel URL with anyone and they can use your polling app immediately.
