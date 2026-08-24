# 🌍 Environment Configuration Guide

## Required Environment Variables for Render Deployment

### **Frontend URL Configuration** 🎯

Set these environment variables on Render to configure frontend URLs:

```bash
# Primary Frontend URL (Vercel)
FRONTEND_URL=https://kohinoorgemstone.vercel.app

# Development URLs (for local testing)
FRONTEND_DEV_URL=http://localhost:3000
FRONTEND_DEV_URL_VITE=http://localhost:5173

# CORS Origin (primary frontend)
CORS_ORIGIN=https://kohinoorgemstone.vercel.app
```

### **Complete Environment Variables List** 📋

#### **🔐 Authentication & Security**
```bash
ADMIN_EMAIL=tubamirza822@gmail.com
ADMIN_PASSWORD=Tuba@6283
ADMIN_NAME="Kohinoor Admin"
JWT_SECRET=7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0p
SESSION_SECRET=9k8j7h6g5f4d3s2a1q0p9o8i7u6y5t4r3e2w1q0a9s8d7f6g5h4j3k2l1m0n9b8v7c6x5z4
```

#### **🌐 URLs & CORS**
```bash
FRONTEND_URL=https://kohinoorgemstone.vercel.app
BACKEND_URL=https://kohinoor-w94f.onrender.com
CORS_ORIGIN=https://kohinoorgemstone.vercel.app
```

#### **🗄️ Database**
```bash
MONGODB_URI="mongodb+srv://mirzasayzz:Mirza62@kohinoor.oervdha.mongodb.net/?retryWrites=true&w=majority&appName=kohinoor"
```

#### **☁️ Cloudinary**
```bash
CLOUDINARY_API_KEY=679223646974825
CLOUDINARY_API_SECRET=urC5Vvtn1Hftsn6EGqoDLhP4348
CLOUDINARY_CLOUD_NAME=dtwykxltm
```

#### **⚙️ Server**
```bash
NODE_ENV=production
PORT=3001
```

## 🔄 **How Frontend URLs are Used**

### **1. CORS Configuration**
The backend automatically allows requests from:
- Production: `FRONTEND_URL` (primary)
- Development: `FRONTEND_DEV_URL` + `FRONTEND_DEV_URL_VITE`

### **2. Admin Dashboard Links**
The admin dashboard dynamically generates links using `frontendUrl`:
- Home: `{frontendUrl}/`
- Gemstones: `{frontendUrl}/gemstones`
- Contact: `{frontendUrl}/contact`

### **3. Environment-Based URL Selection**
```javascript
// Production
if (NODE_ENV === 'production') {
  frontendUrl = FRONTEND_URL || 'https://kohinoorgemstone.vercel.app'
}
// Development
else {
  frontendUrl = FRONTEND_DEV_URL_VITE || 'http://localhost:5173'
}
```

## 📋 **Render Deployment Steps**

### **1. Set Environment Variables**
In Render Dashboard → Your Service → Environment:

```
FRONTEND_URL=https://kohinoorgemstone.vercel.app
CORS_ORIGIN=https://kohinoorgemstone.vercel.app
ADMIN_EMAIL=tubamirza822@gmail.com
ADMIN_PASSWORD=Tuba@6283
... (all other variables from above)
```

### **2. Deploy Changes**
```bash
git add .
git commit -m "🌍 Configure frontend URLs with environment variables"
git push origin main
```

### **3. Verify Configuration**
After deployment, check:
- ✅ CORS allows requests from frontend
- ✅ Admin dashboard links point to correct frontend
- ✅ No hardcoded localhost URLs in production

## 🧪 **Testing Frontend Integration**

### **Test CORS**
```bash
curl -H "Origin: https://kohinoorgemstone.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://kohinoor-w94f.onrender.com/api/health
```

### **Test Admin Dashboard Links**
1. Login to admin dashboard
2. Verify "View Website" buttons point to: `https://kohinoorgemstone.vercel.app`
3. Check all frontend links work correctly

## 🔍 **Debug Commands**

### **Check Environment Variables**
```bash
npm run check-env
```

### **Test Deployment**
```bash
npm run test-deployment
```

---

## ✅ **Benefits of Environment-Based Configuration**

1. **🔄 Easy URL Changes**: Update `FRONTEND_URL` without code changes
2. **🌍 Multi-Environment Support**: Different URLs for dev/staging/prod
3. **🔒 Security**: No hardcoded URLs in source code
4. **🚀 Deployment Flexibility**: Works with any frontend hosting service

**🎯 Result**: Your backend now dynamically adapts to your Vercel frontend URL through environment variables! 