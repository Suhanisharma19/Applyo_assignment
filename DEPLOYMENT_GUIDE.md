# RealTime Poll - Deployment Guide

## Deployment Overview

Deploy your RealTime Poll application to production using one of these approaches:

### Quick Summary

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| **Vercel + Heroku** | Vercel | Heroku | MongoDB Atlas | $0-20/mo | ⭐ Easy |
| **Vercel + Railway** | Vercel | Railway | MongoDB Atlas | $5-30/mo | ⭐ Easy |
| **AWS** | CloudFront + S3 | Lambda/EC2 | RDS/DynamoDB | $10-100/mo | ⭐⭐⭐ Hard |
| **Azure** | Static Web Apps | App Service | CosmosDB | $10-80/mo | ⭐⭐ Medium |
| **DigitalOcean** | App Platform | App Platform | Managed DB | $12-100/mo | ⭐⭐ Medium |
| **Docker + Any Host** | Docker | Docker | MongoDB | Varies | ⭐⭐⭐ Hard |

**Recommended for beginners**: Vercel (Frontend) + Heroku (Backend) + MongoDB Atlas (Database)

---

## Option 1: Vercel + Heroku (RECOMMENDED - Easiest)

### Prerequisites
- GitHub account (for source control)
- Vercel account (free)
- Heroku account (free tier)
- MongoDB Atlas account (free tier)

### Step 1: Push to GitHub

**Create repository**:
```bash
cd c:\Users\suhan\applyo
git init
git add .
git commit -m "Initial commit: RealTime Poll application"
git remote add origin https://github.com/YOUR-USERNAME/realtime-poll.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Heroku

**Install Heroku CLI**:
```bash
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# Or via npm:
npm install -g heroku
```

**Create Heroku app**:
```bash
cd realtime-poll-backend
heroku login
heroku create realtime-poll-backend  # Choose unique name
```

**Configure environment variables**:
```bash
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/applyo?retryWrites=true&w=majority
heroku config:set NODE_ENV=production
```

**Deploy**:
```bash
git push heroku main
```

**Verify**:
```bash
heroku logs --tail
# Should see: "Server running on port 3002"
# And: "MongoDB Connected: ..."
```

**Backend URL**: `https://realtime-poll-backend.herokuapp.com`

### Step 3: Deploy Frontend to Vercel

**Install Vercel CLI**:
```bash
npm install -g vercel
```

**Update API endpoint** in `src/pages/PollPage.js`:
```javascript
// Change from:
const response = await axios.get('http://localhost:3002/api/polls/${id}');

// To:
const response = await axios.get('https://realtime-poll-backend.herokuapp.com/api/polls/${id}');
```

Also update Socket.IO connection in same file:
```javascript
// Change from:
const socket = io('http://localhost:3002');

// To:
const socket = io('https://realtime-poll-backend.herokuapp.com');
```

**Deploy**:
```bash
cd realtime-poll-frontend
vercel --prod
```

**Follow prompts**:
- Project name: `realtime-poll-frontend`
- Framework: `Create React App`
- Build command: `npm run build`
- Output directory: `build`

**Frontend URL**: `https://realtime-poll-frontend.vercel.app`

### Step 4: Update Backend CORS

**In backend** (`server.js`):
```javascript
const cors = require('cors');
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://realtime-poll-frontend.vercel.app'  // Add Vercel frontend
  ],
  credentials: true
}));
```

**Deploy updated backend**:
```bash
cd realtime-poll-backend
git add .
git commit -m "Update CORS for production"
git push heroku main
```

### Done! ✅

Your app is now live:
- **Frontend**: https://realtime-poll-frontend.vercel.app
- **Backend**: https://realtime-poll-backend.herokuapp.com
- **Database**: MongoDB Atlas (cloud-hosted)

**Test it**:
1. Open frontend URL in browser
2. Create a poll
3. Share link with others
4. Vote and see real-time updates

---

## Option 2: Railway (Modern Alternative to Heroku)

Railway is newer, more affordable, and easier than Heroku.

### Step 1: Create Railway Account
Visit https://railway.app and sign up with GitHub

### Step 2: Deploy Backend

**From Railway dashboard**:
1. Click "New Project"
2. Click "Deploy from GitHub"
3. Select `realtime-poll-backend` repository
4. Railway auto-detects Node.js project
5. Click "Deploy"

**Configure environment**:
1. In Railway dashboard, go to Variables
2. Add:
   ```
   MONGODB_URI=mongodb+srv://...
   NODE_ENV=production
   ```
3. Click Deploy

**Get backend URL**:
- Railway generates URL automatically
- Example: `https://realtime-poll-backend.up.railway.app`

### Step 3: Update Frontend

Update API endpoints in `src/pages/PollPage.js`:
```javascript
const API_URL = 'https://realtime-poll-backend.up.railway.app';
const SOCKET_URL = 'https://realtime-poll-backend.up.railway.app';

// Use in axios and io() calls
```

Deploy frontend to Vercel (same as Option 1, Step 3)

### Cost Comparison
- **Heroku**: Free tier deprecated, $7+/month
- **Railway**: $5/month credit, pay-as-you-go ($0.50/hour servers)
- **Vercel**: Free tier available

---

## Option 3: Docker + Containerization

Deploy using Docker for maximum portability.

### Step 1: Create Dockerfile (Backend)

**realtime-poll-backend/Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3002

CMD ["node", "server.js"]
```

### Step 2: Create Dockerfile (Frontend)

**realtime-poll-frontend/Dockerfile**:
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV REACT_APP_API_URL=https://api.yourdomain.com
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**realtime-poll-frontend/nginx.conf**:
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
}
```

### Step 3: Docker Compose (Local Testing)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./realtime-poll-backend
    ports:
      - "3002:3002"
    environment:
      MONGODB_URI: mongodb://mongo:27017/applyo
      NODE_ENV: production
    depends_on:
      - mongo
    networks:
      - app-network

  frontend:
    build: ./realtime-poll-frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:3002
    depends_on:
      - backend
    networks:
      - app-network

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

volumes:
  mongo_data:

networks:
  app-network:
```

**Test locally**:
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:3002
# MongoDB: localhost:27017
```

### Step 4: Deploy Docker

Options:
- **AWS ECR + ECS**: $20-100/month
- **Google Cloud Run**: Pay per request
- **DigitalOcean App Platform**: $5-100/month
- **Render.com**: $0-25/month
- **Fly.io**: $0-50/month

---

## Option 4: AWS Deployment

Advanced option for large-scale deployments.

### Architecture

```
┌─────────────────────────────────────┐
│     CloudFront (CDN)                │
│     + S3 (Static Files)             │
│     (Frontend)                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     API Gateway                     │
│     + Lambda/EC2                    │
│     (Backend API)                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     RDS PostgreSQL / DynamoDB       │
│     (Database)                      │
└─────────────────────────────────────┘
```

### Estimated Costs
- Frontend (S3 + CloudFront): $1-5/month
- Backend (Lambda): $0-20/month (pay-per-request)
- Database (RDS): $10-50/month
- **Total**: $15-75/month

### Deployment Steps (Summary)

1. **Upload Frontend**:
   ```bash
   aws s3 sync build/ s3://realtime-poll-frontend/
   ```

2. **Configure CloudFront**:
   - Create distribution pointing to S3
   - Set origin domain: `realtime-poll-frontend.s3.amazonaws.com`
   - Set default root object: `index.html`

3. **Deploy Backend**:
   - Use AWS Elastic Beanstalk (easiest)
   - Or: Lambda + API Gateway (more complex)
   - Or: EC2 (most control)

4. **Database**:
   - Use MongoDB Atlas (recommended, not AWS)
   - Or RDS + custom setup

---

## Configuration Checklist

### Before Deployment

**Environment Variables**:
```bash
# Backend (.env or platform config)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/applyo
NODE_ENV=production
PORT=3002

# Frontend (.env.production)
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

**CORS Configuration**:
```javascript
// server.js
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-frontend-url.com',
    'https://www.your-frontend-url.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

**Socket.IO Configuration**:
```javascript
// server.js
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'https://your-frontend-url.com',
      'https://www.your-frontend-url.com'
    ],
    credentials: true
  },
  transports: ['websocket', 'polling']
});
```

**MongoDB Atlas Security**:
1. Create IP whitelist entry: `0.0.0.0/0` (or your IP range)
2. Create database user with strong password
3. Enable encryption at rest
4. Enable audit logging

---

## Post-Deployment Tasks

### 1. Domain Configuration

**Add Custom Domain** (Vercel):
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain (e.g., `realtime-poll.com`)
3. Follow DNS instructions from your registrar

**Update API Endpoint**:
```javascript
// src/pages/PollPage.js
const API_URL = 'https://api.realtime-poll.com';  // Your domain
```

### 2. SSL/HTTPS Certificate

**Vercel/Heroku/Railway**: Automatic ✅
- All provide free HTTPS

**Custom Domain**:
- Use Let's Encrypt (free)
- Or AWS Certificate Manager (free)

### 3. Monitoring & Logging

**Heroku Logs**:
```bash
heroku logs --tail
```

**Vercel Analytics**:
- Dashboard shows deployment status
- Real-time errors and warnings

**Railway Monitoring**:
- Built-in dashboard with metrics
- Database monitoring

**Add Error Tracking** (Free):
```javascript
// Install Sentry for error monitoring
npm install @sentry/react

// In src/index.js
import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID",
  environment: "production"
});
```

### 4. Performance Optimization

**Frontend**:
```bash
npm run build  # Creates optimized production build
# Output: build/ folder (minified JS, CSS, assets)
```

**Backend**:
- Use `NODE_ENV=production`
- Enable compression middleware
- Add caching headers

**Database**:
- Create indexes (already done in code)
- Monitor slow queries
- Archive old polls (optional)

### 5. Backup Strategy

**MongoDB Atlas Automatic Backups** ✅
- Daily snapshots retained 35 days
- Point-in-time recovery

**Manual Backup** (Optional):
```bash
# Export data
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/applyo"

# Import data
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/applyo" dump/
```

### 6. Rate Limiting (Optional)

Add to prevent abuse:
```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Troubleshooting Deployment Issues

### Issue: "Cannot find module" Error

**Solution**:
```bash
# Ensure all dependencies installed
npm install

# Check package.json has all dependencies
npm list

# On deployed platform, run:
npm install --production
```

### Issue: CORS Error

**Solution**:
```javascript
// server.js - Update origin array
app.use(cors({
  origin: 'https://your-actual-frontend-url.com',  // Exact match
  credentials: true
}));
```

### Issue: MongoDB Connection Fails

**Solution**:
1. Check connection string in environment variables
2. Verify IP whitelist in MongoDB Atlas
3. Create new database user if password forgotten
4. Test connection locally first

### Issue: "Port 3002 Already in Use"

**Solution** (for local):
```bash
# Kill existing process
lsof -i :3002
kill -9 <PID>

# Or specify different port
PORT=3003 npm start
```

### Issue: WebSocket Connection Fails

**Solution**:
1. Check CORS configuration
2. Ensure transports: ['websocket', 'polling']
3. Check firewall allowing WebSocket
4. Verify Socket.IO version matches frontend/backend

### Issue: Frontend Shows Blank Page

**Solution**:
1. Check browser console for errors (F12 → Console)
2. Verify API endpoint in env variables
3. Check network requests (F12 → Network tab)
4. Ensure backend is running and accessible

---

## Deployment Comparison Table

| Factor | Vercel + Heroku | Railway | AWS | Docker |
|--------|-----------------|---------|-----|--------|
| **Setup Time** | 15 min | 10 min | 1 hour | 30 min |
| **Monthly Cost** | $5-20 | $5-15 | $15-75 | $5-50 |
| **Scaling** | Automatic | Automatic | Manual | Manual |
| **Learning Curve** | ⭐ Easy | ⭐ Easy | ⭐⭐⭐ Hard | ⭐⭐ Medium |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Free Tier** | ✅ Yes | ✅ Limited | ❌ No | ❌ No |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Monitoring** | ✅ Basic | ✅ Good | ✅ Excellent | ❌ Manual |
| **Support** | ✅ Good | ✅ Good | ✅ Excellent | ❌ Community |

---

## Recommended Deployment Path

### For Beginners
1. **Frontend**: Vercel (easiest, free)
2. **Backend**: Heroku or Railway (simple, affordable)
3. **Database**: MongoDB Atlas (free tier)
4. **Domain**: Get free domain from Vercel, or buy cheap .com

**Total Cost**: $0-15/month
**Time to deploy**: 30 minutes

### For Small Teams
1. **Frontend**: Vercel with custom domain
2. **Backend**: Railway or AWS Lambda
3. **Database**: MongoDB Atlas paid tier
4. **Monitoring**: Sentry or LogRocket

**Total Cost**: $20-50/month
**Features**: Auto-scaling, error tracking, analytics

### For Large Scale
1. **Frontend**: AWS CloudFront + S3
2. **Backend**: AWS ECS + Fargate
3. **Database**: AWS RDS or DynamoDB
4. **Monitoring**: CloudWatch, DataDog

**Total Cost**: $100-500/month
**Features**: Enterprise SLAs, global CDN, auto-scaling

---

## Quick Start Command Summary

### Deploy to Heroku + Vercel (Fastest)

```bash
# 1. Push to GitHub (if not done)
cd c:\Users\suhan\applyo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/realtime-poll.git
git push -u origin main

# 2. Deploy backend to Heroku
cd realtime-poll-backend
heroku create realtime-poll-backend
heroku config:set MONGODB_URI=<your-mongodb-uri>
git push heroku main

# 3. Update frontend config
# Edit src/pages/PollPage.js:
#   - Change localhost:3002 to https://realtime-poll-backend.herokuapp.com

# 4. Deploy frontend to Vercel
cd ../realtime-poll-frontend
npm install -g vercel
vercel --prod

# Done! ✅
# Frontend: https://realtime-poll-frontend.vercel.app
# Backend: https://realtime-poll-backend.herokuapp.com
```

---

## Next Steps

1. **Choose a deployment platform** (Vercel + Heroku recommended)
2. **Prepare environment variables** (MONGODB_URI, API_URL)
3. **Push code to GitHub**
4. **Deploy following platform's guide**
5. **Test production app thoroughly**
6. **Monitor for errors and performance**
7. **Set up backups and monitoring**
8. **Share with users!** 🎉

Questions? Check the troubleshooting section above.
