import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import gemstoneRoutes from './routes/gemstoneRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminDashboardRoutes.js';
import gemstoneAIRoutes from './routes/gemstoneAIRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupDefaultAdmin, displayStartupInfo } from './utils/setupAdmin.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP detection in production (required for Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting (apply to API only, not admin pages or static assets)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '', 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '', 10) || 300,
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: process.env.NODE_ENV === 'production'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for admin dashboard
}));

// CORS configuration with environment-based frontend URLs
const getFrontendUrls = () => {
  if (process.env.NODE_ENV === 'production') {
    return [
      process.env.FRONTEND_URL || 'https://kohinoorgemstone.vercel.app',
      process.env.BACKEND_URL || 'https://kohinoor-w94f.onrender.com',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
  } else {
    return [
      process.env.FRONTEND_DEV_URL || 'http://localhost:3000',
      process.env.FRONTEND_DEV_URL_VITE || 'http://localhost:5173'
    ].filter(Boolean);
  }
};

app.use(cors({
  origin: getFrontendUrls(),
  credentials: true
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for admin dashboard
app.use('/admin/assets', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Admin Dashboard Routes (before API routes)
app.use('/', adminRoutes);

// API Rate Limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gemstones', gemstoneRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', gemstoneAIRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Kohinoor Gemstone API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found on this server`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  // Setup default admin and business info
  await setupDefaultAdmin();
  
  // Display startup information
  displayStartupInfo();
}); 