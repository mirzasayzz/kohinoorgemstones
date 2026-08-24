# 🚀 Heroku Deployment Guide - Kohinoor Gemstone

> Complete guide to deploy Kohinoor Gemstone to Heroku using GitHub

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option 1: Docker Deployment (Recommended)](#option-1-docker-deployment-recommended)
4. [Option 2: Manual Deployment (Without Docker)](#option-2-manual-deployment-without-docker)
5. [Environment Variables](#environment-variables)
6. [Connect GitHub to Heroku](#connect-github-to-heroku)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **GitHub Repository**: Your code pushed to GitHub
3. **MongoDB Atlas**: Database ready (Heroku doesn't have free MongoDB)
4. **Cloudinary**: For image hosting

---

## Deployment Options

| Method | Files Needed | Best For |
|--------|-------------|----------|
| **Docker** | `Dockerfile`, `heroku.yml` | Full control, production-ready |
| **Manual** | `Procfile`, `package.json` in root | Simple setup |

---

## Option 1: Docker Deployment (Recommended)

### ✅ Files Already Present

You already have these files:

```
kohinoor/
├── Dockerfile        ✅ (Multi-stage build)
├── heroku.yml        ✅ (Heroku Docker config)
└── .dockerignore     ✅ (Ignore unnecessary files)
```

### Step 1: Set Heroku Stack to Container

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login

# Create app (if not exists)
heroku create kohinoor-gemstone

# Set stack to container (Docker)
heroku stack:set container -a kohinoor-gemstone
```

### Step 2: Connect GitHub

1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Select your app → **Deploy** tab
3. Choose **GitHub** as deployment method
4. Search and connect `mirzasayzz/kohinoor`
5. Enable **Automatic Deploys** from `main` branch

### Step 3: Add Environment Variables

Go to **Settings** → **Config Vars** → Add each variable:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xxx
EMAIL_PASS=xxx
GEMINI_API_KEY=xxx
FRONTEND_URL=https://kohinoor-gemstone.herokuapp.com
```

### Step 4: Deploy

```bash
# Push to GitHub (auto-deploys if enabled)
git push origin main

# Or manual deploy from Heroku dashboard
# Deploy tab → Manual Deploy → Deploy Branch
```

---

## Option 2: Manual Deployment (Without Docker)

### Files Needed

Create these files in the **root** directory:

### 1. `Procfile` (already exists or create)

```procfile
web: npm start --prefix backend
```

### 2. Root `package.json` (Create if not exists)

```json
{
  "name": "kohinoor-gemstone",
  "version": "1.0.0",
  "description": "Kohinoor Gemstone E-commerce Platform",
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  },
  "scripts": {
    "start": "node backend/src/server.js",
    "build": "cd frontend && npm install && npm run build",
    "postinstall": "npm run build",
    "heroku-postbuild": "cd frontend && npm install && npm run build && cp -r dist ../backend/public"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### 3. Update `backend/src/server.js`

Add static file serving for frontend:

```javascript
// Serve static files from frontend build
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});
```

### 4. Deployment Steps

```bash
# Create Heroku app
heroku create kohinoor-gemstone

# Add buildpacks
heroku buildpacks:set heroku/nodejs -a kohinoor-gemstone

# Connect to GitHub from dashboard
# Settings → Deploy → GitHub → Connect

# Add environment variables
heroku config:set NODE_ENV=production -a kohinoor-gemstone
heroku config:set MONGODB_URI="your-mongodb-uri" -a kohinoor-gemstone
# ... add all other env vars

# Deploy
git push heroku main
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Heroku) | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `JWT_EXPIRE` | Token expiry | `30d` |

### Cloudinary (Images)

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | API key |
| `CLOUDINARY_API_SECRET` | API secret |

### Email (Nodemailer)

| Variable | Description |
|----------|-------------|
| `EMAIL_HOST` | SMTP host (`smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (`587`) |
| `EMAIL_USER` | Your email |
| `EMAIL_PASS` | App password (not regular password!) |
| `EMAIL_FROM` | From address |

### AI (Google Gemini)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |

### Frontend URL

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Your Heroku app URL |

---

## Connect GitHub to Heroku

### Via Heroku Dashboard (Recommended)

1. **Login** to [Heroku Dashboard](https://dashboard.heroku.com)

2. **Select your app** or create new one

3. Go to **Deploy** tab

4. Under **Deployment method**, click **GitHub**

5. Click **Connect to GitHub** and authorize

6. Search for `kohinoor` repository

7. Click **Connect**

8. **Enable Automatic Deploys**:
   - Select `main` branch
   - Check "Wait for CI to pass" (optional)
   - Click **Enable Automatic Deploys**

9. **Manual Deploy** (first time):
   - Click **Deploy Branch**

### Via CLI

```bash
# Add Heroku remote
heroku git:remote -a kohinoor-gemstone

# Push to Heroku
git push heroku main

# View logs
heroku logs --tail -a kohinoor-gemstone

# Open app
heroku open -a kohinoor-gemstone
```

---

## Project Structure for Heroku

```
kohinoor/
├── backend/
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   └── ...
│   ├── package.json           # Backend dependencies
│   └── public/                # Frontend build (auto-copied)
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── dist/                  # Build output
│
├── Dockerfile                 # Docker build config
├── heroku.yml                 # Heroku Docker config
├── Procfile                   # Heroku process file
├── package.json               # Root package (for manual deploy)
└── .dockerignore
```

---

## Heroku CLI Commands Cheatsheet

```bash
# Login
heroku login

# Create app
heroku create APP_NAME

# Set config var
heroku config:set KEY=VALUE -a APP_NAME

# View config vars
heroku config -a APP_NAME

# View logs
heroku logs --tail -a APP_NAME

# Restart app
heroku restart -a APP_NAME

# Run bash in dyno
heroku run bash -a APP_NAME

# Scale dynos
heroku ps:scale web=1 -a APP_NAME

# Open app in browser
heroku open -a APP_NAME

# Check app status
heroku ps -a APP_NAME
```

---

## Troubleshooting

### Common Issues

#### 1. "Application Error" on launch
```bash
# Check logs
heroku logs --tail -a APP_NAME

# Common causes:
# - Missing environment variables
# - Wrong start command
# - Port binding issue (use process.env.PORT)
```

#### 2. Build Fails
```bash
# Clear build cache
heroku plugins:install heroku-repo
heroku repo:purge_cache -a APP_NAME
git push heroku main
```

#### 3. MongoDB Connection Fails
- Ensure `MONGODB_URI` is set correctly
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

#### 4. Static Files Not Serving
- Check frontend build is copied to `backend/public`
- Verify static middleware in server.js

#### 5. Memory Issues
```bash
# Check memory usage
heroku ps -a APP_NAME

# Upgrade dyno if needed
heroku ps:resize web=standard-1x -a APP_NAME
```

---

## Quick Deploy Checklist

- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] App created on Heroku
- [ ] Stack set to `container` (for Docker) or `heroku-22`
- [ ] GitHub connected
- [ ] All environment variables added
- [ ] MongoDB Atlas IP whitelist: `0.0.0.0/0`
- [ ] Cloudinary configured
- [ ] Deploy triggered
- [ ] Logs checked for errors
- [ ] App accessible in browser

---

## Deployment URLs

After deployment, your app will be available at:

```
https://kohinoor-gemstone.herokuapp.com
```

Admin panel:
```
https://kohinoor-gemstone.herokuapp.com/admin
```

---

*Guide created: December 2024*
