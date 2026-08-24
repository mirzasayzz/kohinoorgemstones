# 💎 Kohinoor Gemstone - Complete Project Documentation

> **A Modern E-Commerce Platform for Authentic Gemstones**  
> Family-owned business serving customers for 2+ generations from Bareilly, UP, India

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture Diagram](#-architecture-diagram)
4. [Project Structure](#-project-structure)
5. [Backend Documentation](#-backend-documentation)
6. [Frontend Documentation](#-frontend-documentation)
7. [Database Models](#-database-models)
8. [API Endpoints](#-api-endpoints)
9. [Features](#-features)
10. [Authentication Flow](#-authentication-flow)
11. [Setup & Installation](#-setup--installation)
12. [Environment Variables](#-environment-variables)
13. [Deployment](#-deployment)

---

## 🎯 Project Overview

**Kohinoor Gemstone** is a full-stack e-commerce web application for selling authentic, certified gemstones. The platform features:

- 💎 Beautiful gemstone catalog with filtering & search
- 🤖 AI-powered gemstone recommendations (Kohinoor AI)
- 🛒 Shopping cart & wishlist functionality
- 💬 Real-time customer chat with admin
- 📱 Mobile-first responsive design
- 🌙 Dark/Light mode toggle
- 👤 Customer authentication with email verification
- 📊 Admin dashboard for managing products

### Business Information
- **Name:** Kohinoor Gemstone
- **Location:** Shahabad Deewan Khana, Bareilly, UP, India
- **Heritage:** 2+ Generations, 10000+ Happy Customers
- **Speciality:** Certified Natural Gemstones

---

## 🛠 Technology Stack

### Frontend
```
┌─────────────────────────────────────────────────────┐
│  React 18        │  Modern UI framework             │
│  Vite            │  Fast build tool                 │
│  TailwindCSS     │  Utility-first CSS               │
│  Framer Motion   │  Smooth animations               │
│  Lucide React    │  Beautiful icons                 │
│  React Router    │  Client-side routing             │
│  Axios           │  HTTP client                     │
└─────────────────────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────────────────────┐
│  Node.js         │  JavaScript runtime              │
│  Express.js      │  Web framework                   │
│  MongoDB         │  NoSQL database                  │
│  Mongoose        │  MongoDB ODM                     │
│  JWT             │  Authentication tokens           │
│  Cloudinary      │  Image storage                   │
│  Socket.io       │  Real-time communication         │
│  Nodemailer      │  Email service                   │
│  Google Gemini   │  AI recommendations              │
└─────────────────────────────────────────────────────┘
```

### Deployment
```
┌─────────────────────────────────────────────────────┐
│  Frontend        │  Vercel                          │
│  Backend         │  Render                          │
│  Database        │  MongoDB Atlas                   │
│  Images          │  Cloudinary                      │
└─────────────────────────────────────────────────────┘
```

---

## 🏗 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend (Vercel)                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │  Pages   │ │Components│ │ Context  │ │    Services      │   │   │
│  │  │  - Home  │ │- Header  │ │- Auth    │ │  - API calls     │   │   │
│  │  │  - Shop  │ │- Footer  │ │- Cart    │ │  - WebSocket     │   │   │
│  │  │  - Detail│ │- Cards   │ │- Wishlist│ │                  │   │   │
│  │  │  - Cart  │ │- Drawers │ │- Toast   │ │                  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/WSS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER (Render)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Express.js Application                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                      Middleware                           │   │   │
│  │  │  - CORS  - Auth  - Error Handler  - Rate Limiting        │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │  Routes  │ │Controllers│ │ Models  │ │    Services      │   │   │
│  │  │- /api/   │ │- Gemstone│ │- User   │ │  - Email         │   │   │
│  │  │  gemstone│ │- Auth    │ │- Gemstone│ │  - Socket        │   │   │
│  │  │  auth    │ │- Business│ │- Customer│ │  - Cloudinary    │   │   │
│  │  │  upload  │ │- Admin   │ │- Message │ │                  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   MongoDB    │ │  Cloudinary  │ │ Google Gemini│
            │   Atlas      │ │  (Images)    │ │    (AI)      │
            └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📁 Project Structure

```
kohinoor/
├── 📁 backend/                    # Node.js/Express Backend
│   ├── 📁 src/
│   │   ├── 📁 config/             # Database configuration
│   │   │   └── db.js              # MongoDB connection
│   │   │
│   │   ├── 📁 controllers/        # Business logic
│   │   │   ├── adminDashboardController.js
│   │   │   ├── authController.js
│   │   │   ├── businessController.js
│   │   │   └── gemstoneController.js
│   │   │
│   │   ├── 📁 middleware/         # Express middleware
│   │   │   ├── auth.js            # JWT authentication
│   │   │   └── errorHandler.js    # Global error handling
│   │   │
│   │   ├── 📁 models/             # Mongoose schemas
│   │   │   ├── BusinessInfo.js    # Shop settings
│   │   │   ├── Category.js        # Gemstone categories
│   │   │   ├── Customer.js        # Customer accounts
│   │   │   ├── Gemstone.js        # Product model
│   │   │   ├── Message.js         # Chat messages
│   │   │   └── User.js            # Admin users
│   │   │
│   │   ├── 📁 routes/             # API endpoints
│   │   │   ├── adminDashboardRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── businessRoutes.js
│   │   │   ├── customerAuthRoutes.js
│   │   │   ├── gemstoneAIRoutes.js
│   │   │   ├── gemstoneRoutes.js
│   │   │   └── uploadRoutes.js
│   │   │
│   │   ├── 📁 services/           # External services
│   │   │   ├── emailService.js    # Nodemailer
│   │   │   └── socketService.js   # Socket.io
│   │   │
│   │   ├── 📁 views/              # EJS templates (Admin)
│   │   │   └── admin/             # Admin dashboard views
│   │   │
│   │   └── server.js              # Entry point
│   │
│   ├── package.json
│   └── .env                       # Environment variables
│
├── 📁 frontend/                   # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 assets/             # Static assets
│   │   │
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📁 auth/           # Authentication
│   │   │   │   ├── AuthModal.jsx
│   │   │   │   └── UserMenu.jsx
│   │   │   │
│   │   │   ├── 📁 common/         # Shared components
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── CustomerChat.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── GemstoneAI.jsx
│   │   │   │   ├── LazyImage.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── MenuPanel.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── SEOHead.jsx
│   │   │   │   ├── SlidePanel.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── WhatsAppButton.jsx
│   │   │   │   └── WishlistDrawer.jsx
│   │   │   │
│   │   │   ├── 📁 gemstone/       # Gemstone-specific
│   │   │   │   └── GemstoneCard.jsx
│   │   │   │
│   │   │   └── 📁 layout/         # Layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Layout.jsx
│   │   │
│   │   ├── 📁 context/            # React Context (State)
│   │   │   ├── AuthContext.jsx    # User authentication
│   │   │   ├── BusinessContext.jsx# Shop info & WhatsApp
│   │   │   ├── CartContext.jsx    # Shopping cart
│   │   │   ├── SocketContext.jsx  # WebSocket connection
│   │   │   ├── ToastContext.jsx   # Notifications
│   │   │   └── WishlistContext.jsx# User wishlist
│   │   │
│   │   ├── 📁 pages/              # Route pages
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── AllGemstones.jsx   # Product listing
│   │   │   ├── GemstoneDetail.jsx # Product detail
│   │   │   ├── About.jsx          # About us
│   │   │   ├── Contact.jsx        # Contact form
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── SignIn.jsx         # Login page
│   │   │   ├── SignUp.jsx         # Register page
│   │   │   └── Wishlist.jsx       # Wishlist page
│   │   │
│   │   ├── 📁 services/           # API services
│   │   │   └── api.js             # Axios instance
│   │   │
│   │   ├── 📁 config/             # Configuration
│   │   │   └── config.js          # API URLs, constants
│   │   │
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                       # Environment variables
│
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose
└── README.md                      # Project readme
```

---

## 🗄 Database Models

### 1. Gemstone Model
```javascript
Gemstone {
  name: {
    english: String,       // "Ruby"
    urdu: String           // "یاقوت (Yaqoot)"
  },
  slug: String,            // "ruby-natural-certified"
  category: Enum [         // Gemstone type
    'Diamond', 'Emerald', 'Ruby', 'Sapphire', 
    'Topaz', 'Pearl', 'Coral', 'Turquoise',
    'Onyx', 'Aqeeq', 'Moonstone', 'Zircon',
    'Opal', 'Tourmaline', 'Garnet', 'Other'
  ],
  purpose: [Enum],         // ['Love', 'Health', 'Wealth', ...]
  color: String,           // "Deep Red"
  summary: String,         // Brief description
  description: String,     // Full description
  origin: String,          // "Burma"
  astrologyBenefits: String,
  uses: String,
  images: [{
    url: String,           // Cloudinary URL
    publicId: String,      // Cloudinary ID
    alt: String
  }],
  trending: Boolean,
  featured: Boolean,
  weight: {
    value: Number,
    unit: Enum ['carats', 'grams', 'ratti']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: Enum ['mm', 'cm']
  },
  certification: {
    certified: Boolean,
    certificateNumber: String,
    certifyingBody: String,
    certificationImage: { url, publicId }
  },
  priceRange: {
    min: Number,
    max: Number,
    currency: Enum ['INR', 'USD', 'EUR']
  },
  availability: Enum ['In Stock', 'Out of Stock', 'Made to Order'],
  discount: {
    percentage: Number,
    message: String,
    isActive: Boolean
  },
  ratti: Number,           // Weight in Ratti
  letter: String,          // A-Z for search
  viewCount: Number,
  tags: [String],
  seoMeta: {
    title: String,
    description: String,
    keywords: [String]
  },
  isActive: Boolean,
  addedBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Customer Model
```javascript
Customer {
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  avatar: String,          // Cloudinary URL
  isVerified: Boolean,
  isActive: Boolean,
  verificationOTP: String,
  verificationExpiry: Date,
  resetPasswordOTP: String,
  resetPasswordExpiry: Date,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  dateOfBirth: Date,
  preferences: {
    favoriteCategories: [String],
    newsletter: Boolean
  },
  lastLogin: Date,
  createdAt: Date
}
```

### 3. User Model (Admin)
```javascript
User {
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'superadmin'],
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### 4. Message Model (Chat)
```javascript
Message {
  customer: ObjectId (Customer),
  sender: Enum ['customer', 'admin'],
  content: String,
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

### 5. BusinessInfo Model
```javascript
BusinessInfo {
  shopName: String,
  tagline: String,
  description: String,
  logo: { url, publicId },
  contact: {
    phone: String,
    alternatePhone: String,
    whatsappNumber: String,
    email: String
  },
  address: {
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  heritage: {
    foundedYear: Number,
    generation: Number,
    story: String
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
    upiId: String
  },
  isActive: Boolean
}
```

---

## 🔌 API Endpoints

### Authentication - Customer (`/api/customer`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new customer |
| POST | `/verify-email` | Verify email with OTP |
| POST | `/resend-otp` | Resend verification OTP |
| POST | `/signin` | Customer login |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset with OTP |
| GET | `/me` | Get current customer |
| PUT | `/profile` | Update profile |
| POST | `/avatar` | Upload profile picture |
| POST | `/logout` | Logout |

### Authentication - Admin (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login |
| GET | `/me` | Get current admin |
| POST | `/logout` | Admin logout |

### Gemstones (`/api/gemstones`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all gemstones (with filters) |
| GET | `/predefined` | Get predefined gemstone names |
| GET | `/trending` | Get trending gemstones |
| GET | `/new-arrivals` | Get new arrivals |
| GET | `/search/:query` | Search gemstones |
| GET | `/:identifier` | Get single gemstone |
| POST | `/` | Create gemstone (Admin) |
| PUT | `/:id` | Update gemstone (Admin) |
| DELETE | `/:id` | Delete gemstone (Admin) |

### Gemstone AI (`/api/gemstone-ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Chat with AI assistant |
| GET | `/suggestions` | Get AI suggestions |

### Customer Chat (`/api/customer/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | Get chat messages |
| POST | `/send` | Send message |
| POST | `/read` | Mark as read |
| GET | `/unread` | Get unread count |

### Business Info (`/api/business`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/info` | Get shop information |
| PUT | `/info` | Update shop info (Admin) |

### Upload (`/api/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/image` | Upload single image |
| POST | `/images` | Upload multiple images |
| DELETE | `/image/:publicId` | Delete image |

---

## ✨ Features

### Customer Features
```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 BROWSE & SEARCH                                             │
│  ├── Browse all gemstones with pagination                       │
│  ├── Filter by category, purpose, color                         │
│  ├── Search by name (English/Urdu)                              │
│  ├── Sort by newest, trending, price                            │
│  └── View gemstone details with images                          │
├─────────────────────────────────────────────────────────────────┤
│  🛒 SHOPPING                                                    │
│  ├── Add to cart                                                │
│  ├── Add to wishlist                                            │
│  ├── Buy via WhatsApp                                           │
│  ├── Share gemstones                                            │
│  └── View cart total                                            │
├─────────────────────────────────────────────────────────────────┤
│  👤 ACCOUNT                                                     │
│  ├── Sign up with email verification                            │
│  ├── Sign in                                                    │
│  ├── Password reset via OTP                                     │
│  ├── Profile management                                         │
│  └── Upload profile picture                                     │
├─────────────────────────────────────────────────────────────────┤
│  💬 COMMUNICATION                                               │
│  ├── Real-time chat with admin                                  │
│  ├── AI-powered gemstone recommendations                        │
│  ├── WhatsApp integration                                       │
│  └── Contact form                                               │
├─────────────────────────────────────────────────────────────────┤
│  🎨 UI/UX                                                       │
│  ├── Dark/Light mode toggle                                     │
│  ├── Mobile-first responsive design                             │
│  ├── Smooth animations                                          │
│  ├── Toast notifications                                        │
│  └── Glassmorphic design                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Features
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD                                                   │
│  ├── Overview statistics                                        │
│  ├── Recent orders                                              │
│  └── Activity logs                                              │
├─────────────────────────────────────────────────────────────────┤
│  💎 GEMSTONE MANAGEMENT                                         │
│  ├── Add new gemstone                                           │
│  ├── Edit gemstone details                                      │
│  ├── Upload/manage images                                       │
│  ├── Set pricing & discounts                                    │
│  ├── Mark trending/featured                                     │
│  └── Delete gemstones                                           │
├─────────────────────────────────────────────────────────────────┤
│  👥 USER MANAGEMENT                                             │
│  ├── View all customers                                         │
│  ├── Manage admin users                                         │
│  └── View customer details                                      │
├─────────────────────────────────────────────────────────────────┤
│  💬 CHAT MANAGEMENT                                             │
│  ├── View all conversations                                     │
│  ├── Reply to customers                                         │
│  └── Real-time notifications                                    │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ SETTINGS                                                    │
│  ├── Shop information                                           │
│  ├── Contact details                                            │
│  └── Bank details                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Customer Registration
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Sign Up │───▶│  Verify  │───▶│  OTP     │───▶│  Success │
│  Form    │    │  Email   │    │  Entry   │    │  Login   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                │               │              │
     │  name, email   │  6-digit OTP  │  verify OTP  │ JWT Token
     │  phone, pass   │  sent to email│              │ stored
     ▼                ▼               ▼              ▼
```

### Customer Login
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│  Verify  │───▶│  Success │
│  Form    │    │  Creds   │    │  Dashboard│
└──────────┘    └──────────┘    └──────────┘
     │                │               │
     │  email, pass   │  check DB     │ JWT Token
     │                │               │ stored in
     ▼                ▼               │ localStorage
                                      ▼
```

### JWT Token Storage
```javascript
// Token stored as:
localStorage.setItem('kohinoor_token', token);
localStorage.setItem('kohinoor_user', JSON.stringify(user));

// Sent with each request:
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Google Gemini API key (for AI)

### 1. Clone Repository
```bash
git clone https://github.com/mirzasayzz/kohinoor.git
cd kohinoor
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin: http://localhost:5000/admin

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kohinoor

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Kohinoor Gemstone <your-email@gmail.com>

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Environment Variables on Vercel:**
- `VITE_API_BASE_URL` = https://your-backend.onrender.com/api
- `VITE_SOCKET_URL` = https://your-backend.onrender.com

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variables

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IPs (0.0.0.0/0 for all)
4. Get connection string
5. Add to backend .env

---

## 📱 Responsive Design Breakpoints

```css
/* Mobile First Approach */
sm:  640px   /* Small devices */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (laptops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X extra large devices */
```

---

## 🎨 Color Palette

```css
/* Luxury Theme */
--luxury-gold:      #d4af37  /* Primary gold */
--luxury-pearl:     #f5f5f5  /* Light background */
--luxury-charcoal:  #1a1a1a  /* Dark background */
--luxury-ruby:      #9b111e  /* Accent red */
--luxury-sapphire:  #0f52ba  /* Accent blue */
--luxury-emerald:   #50c878  /* Accent green */

/* Dark Mode */
--dark-bg:          #0f172a
--dark-card:        #1e293b
--dark-border:      #334155
```

---

## 📞 Support & Contact

**Business Contact:**
- 📱 WhatsApp: +91 XXXXXXXXXX
- 📧 Email: contact@kohinoorgemstone.com
- 📍 Location: Shahabad Deewan Khana, Bareilly, UP, India

**Developer Contact:**
- GitHub: [mirzasayzz](https://github.com/mirzasayzz)

---

## 📄 License

This project is proprietary software owned by Kohinoor Gemstone.

---

*Documentation last updated: December 2024*
