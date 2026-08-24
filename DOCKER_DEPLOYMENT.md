# Kohinoor Gemstone - Docker Deployment Guide

## 🐳 Docker Setup

This project is Docker-ready for deployment on Heroku or any Docker-compatible platform.

### Files Created:
- `Dockerfile` - Multi-stage build (frontend + backend)
- `heroku.yml` - Heroku Docker deployment config
- `docker-compose.yml` - Local Docker testing
- `.dockerignore` - Excludes unnecessary files

---

## 🚀 Deploy to Heroku

### Step 1: Create Heroku App
```bash
heroku create your-app-name
```

### Step 2: Set Stack to Container
```bash
heroku stack:set container -a your-app-name
```

### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set PORT=3001 -a your-app-name
heroku config:set MONGODB_URI=your_mongodb_connection_string -a your-app-name
heroku config:set JWT_SECRET=your_jwt_secret -a your-app-name
heroku config:set BASE_URL=https://your-app-name.herokuapp.com -a your-app-name
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com -a your-app-name
heroku config:set GEMINI_API_KEY=your_gemini_api_key -a your-app-name

# Optional: Cloudinary
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name -a your-app-name
heroku config:set CLOUDINARY_API_KEY=your_api_key -a your-app-name
heroku config:set CLOUDINARY_API_SECRET=your_api_secret -a your-app-name

# Optional: Email (Nodemailer)
heroku config:set SMTP_HOST=smtp.gmail.com -a your-app-name
heroku config:set SMTP_USER=your_email -a your-app-name
heroku config:set SMTP_PASS=your_app_password -a your-app-name
```

### Step 4: Deploy from GitHub
1. Go to Heroku Dashboard → Your App → Deploy
2. Connect your GitHub repository
3. Enable Automatic Deploys (optional)
4. Click "Deploy Branch"

Or deploy via CLI:
```bash
git push heroku main
```

---

## 🧪 Local Docker Testing

### Build and Run:
```bash
# Using docker-compose
docker-compose up --build

# Or manually
docker build -t kohinoor .
docker run -p 3001:3001 --env-file ./backend/.env kohinoor
```

### Access:
- App: http://localhost:3001
- API: http://localhost:3001/api
- Admin: http://localhost:3001/admin

---

## 📋 Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production) | ✅ |
| `PORT` | Server port (3001) | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `BASE_URL` | Backend URL | ✅ |
| `FRONTEND_URL` | Frontend URL (same as BASE_URL for Docker) | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `SMTP_HOST` | Email SMTP host | Optional |
| `SMTP_USER` | Email username | Optional |
| `SMTP_PASS` | Email password | Optional |
| `ADMIN_EMAIL` | Default admin email | Optional |
| `ADMIN_PASSWORD` | Default admin password | Optional |

---

## 🏗️ Build Architecture

```
┌─────────────────────────────────────┐
│           Docker Container          │
├─────────────────────────────────────┤
│  Node.js Server (Express)           │
│  ├── /api/* → Backend API           │
│  ├── /admin/* → Admin Dashboard     │
│  └── /* → Frontend (React)          │
├─────────────────────────────────────┤
│  /app/public/ (Built React App)     │
│  /app/src/ (Backend Source)         │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (requires 20+)
- Ensure all dependencies are in package.json

### App Crashes on Heroku
- Check logs: `heroku logs --tail -a your-app-name`
- Verify all environment variables are set
- Ensure MongoDB is accessible from Heroku

### Static Files Not Loading
- Check if `public/` folder exists after build
- Verify `NODE_ENV=production` is set

---

## 📝 Notes

- Frontend is built and served from the backend in production
- API routes start with `/api/`
- Admin routes start with `/admin/`
- All other routes serve the React app (SPA routing)
