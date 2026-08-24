# 🧪 Comprehensive Testing Plan - Kohinoor Gemstone

## 📋 **Testing Strategy**

### **Phase 1: Backend API Testing (Render)**
- ✅ Health checks
- ✅ Authentication flow  
- ✅ CRUD operations
- ✅ File uploads
- ✅ Admin dashboard
- ✅ Business info management

### **Phase 2: Frontend Testing (Vercel)**
- ✅ Site accessibility
- ✅ API connectivity
- ✅ CORS validation
- ✅ Image loading
- ✅ User interactions

### **Phase 3: Integration Testing**
- ✅ Frontend ↔ Backend communication
- ✅ Authentication flow
- ✅ Data consistency
- ✅ Error handling

---

## 🎯 **Test Execution Plan**

### **PHASE 1: Backend API Testing**

#### **1.1 Health & Configuration**
```bash
# Test 1: Health check
curl https://kohinoor-w94f.onrender.com/api/health

# Test 2: Environment validation
npm run check-env

# Test 3: Frontend URL configuration
npm run test-frontend-config
```

#### **1.2 Authentication Testing**
```bash
# Test 4: Admin login with new credentials
curl -X POST https://kohinoor-w94f.onrender.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "tubamirza822@gmail.com", "password": "Tuba@6283"}' \
-c cookies.txt -v

# Test 5: Get user profile
curl -X GET https://kohinoor-w94f.onrender.com/api/auth/me \
-b cookies.txt

# Test 6: Update profile
curl -X PUT https://kohinoor-w94f.onrender.com/api/auth/profile \
-H "Content-Type: application/json" \
-b cookies.txt \
-d '{"name": "Updated Admin Name"}'

# Test 7: Logout
curl -X POST https://kohinoor-w94f.onrender.com/api/auth/logout \
-b cookies.txt
```

#### **1.3 Gemstone API Testing**
```bash
# Test 8: Get all gemstones (public)
curl https://kohinoor-w94f.onrender.com/api/gemstones

# Test 9: Get trending gemstones
curl https://kohinoor-w94f.onrender.com/api/gemstones/trending

# Test 10: Get new arrivals
curl https://kohinoor-w94f.onrender.com/api/gemstones/new-arrivals

# Test 11: Search gemstones
curl https://kohinoor-w94f.onrender.com/api/gemstones/search/ruby

# Test 12: Get predefined gemstones
curl https://kohinoor-w94f.onrender.com/api/gemstones/predefined

# Test 13: Get single gemstone
curl https://kohinoor-w94f.onrender.com/api/gemstones/68c0599ac25fc0a9ab0d9c8c

# Test 14: Admin statistics (requires auth)
curl -X GET https://kohinoor-w94f.onrender.com/api/gemstones/stats/overview \
-b cookies.txt
```

#### **1.4 Business Info Testing**
```bash
# Test 15: Get business info (public)
curl https://kohinoor-w94f.onrender.com/api/business/info

# Test 16: Get contact info (public)
curl https://kohinoor-w94f.onrender.com/api/business/contact

# Test 17: Get complete contact info (public)
curl https://kohinoor-w94f.onrender.com/api/business/contact-complete
```

#### **1.5 File Upload Testing**
```bash
# Test 18: Upload base64 image (requires auth)
curl -X POST https://kohinoor-w94f.onrender.com/api/upload/base64 \
-H "Content-Type: application/json" \
-b cookies.txt \
-d '{"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

#### **1.6 CRUD Operations Testing**
```bash
# Test 19: Create gemstone (requires auth)
curl -X POST https://kohinoor-w94f.onrender.com/api/gemstones \
-H "Content-Type: application/json" \
-b cookies.txt \
-d '{
  "name": {"english": "Test Gemstone", "urdu": "ٹیسٹ جیم"},
  "category": "Diamond",
  "color": "Clear",
  "summary": "Test gemstone for API validation",
  "description": "This gemstone is created for testing purposes only.",
  "purpose": ["Health", "Wisdom"],
  "origin": "Test Lab",
  "availability": "In Stock"
}'

# Test 20: Update gemstone (requires auth)
# Test 21: Delete gemstone (requires auth)
# Test 22: Toggle trending (requires auth)
```

#### **1.7 Admin Dashboard Testing**
```bash
# Test 23: Admin login page
curl https://kohinoor-w94f.onrender.com/admin/login

# Test 24: Admin dashboard (requires session)
curl https://kohinoor-w94f.onrender.com/admin/dashboard \
-b cookies.txt -L
```

#### **1.8 CORS Testing**
```bash
# Test 25: CORS preflight with Vercel origin
curl -H "Origin: https://kohinoorgemstone.vercel.app" \
-H "Access-Control-Request-Method: GET" \
-H "Access-Control-Request-Headers: Content-Type" \
-X OPTIONS \
https://kohinoor-w94f.onrender.com/api/health

# Test 26: CORS with actual request
curl -H "Origin: https://kohinoorgemstone.vercel.app" \
-H "Content-Type: application/json" \
https://kohinoor-w94f.onrender.com/api/gemstones
```

---

### **PHASE 2: Frontend Testing**

#### **2.1 Site Accessibility**
```bash
# Test 27: Homepage accessibility
curl -I https://kohinoorgemstone.vercel.app/

# Test 28: Gemstones page
curl -I https://kohinoorgemstone.vercel.app/gemstones

# Test 29: Contact page
curl -I https://kohinoorgemstone.vercel.app/contact

# Test 30: About page
curl -I https://kohinoorgemstone.vercel.app/about
```

#### **2.2 API Connectivity from Frontend**
```bash
# Test 31: Frontend calling backend API
curl -H "Origin: https://kohinoorgemstone.vercel.app" \
"https://kohinoor-w94f.onrender.com/api/gemstones"

# Test 32: Frontend getting business info
curl -H "Origin: https://kohinoorgemstone.vercel.app" \
"https://kohinoor-w94f.onrender.com/api/business/info"
```

---

### **PHASE 3: Integration Testing**

#### **3.1 Full Authentication Flow**
```bash
# Test 33: Complete auth flow simulation
# Login → Get Profile → Update → Logout

# Test 34: Protected resource access
# Test 35: Token expiration handling
```

#### **3.2 Data Consistency**
```bash
# Test 36: Create → Read → Update → Delete flow
# Test 37: Image upload → Gemstone creation → Display
```

---

## 📊 **Expected Results**

### **✅ Success Criteria:**
- All health checks pass
- Authentication works with new credentials
- CORS allows Vercel frontend
- All CRUD operations function
- File uploads work to Cloudinary
- Admin dashboard accessible
- Frontend loads and connects to backend

### **❌ Potential Issues to Watch:**
- CORS errors from frontend
- Authentication failures
- Environment variable mismatches
- Database connection issues
- Cloudinary upload failures
- Admin credential problems

---

## 🔍 **Monitoring Points**

1. **Response Times**: < 2 seconds for API calls
2. **Error Rates**: 0% for valid requests
3. **CORS Headers**: Proper headers returned
4. **Authentication**: JWT tokens working
5. **File Uploads**: Images uploaded to Cloudinary
6. **Database**: All CRUD operations successful

---

**📝 Note**: Execute tests in order. If any test fails, document the error and continue. We'll fix all issues at the end based on the logs you provide. 