// Load env vars FIRST so imports (e.g. the Swagger spec which reads process.env)
// see them at module evaluation time.
import 'dotenv/config';

import express from 'express';
import http from 'http';
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
import { initializeSocket } from './services/socketService.js';
import authRoutes from './routes/authRoutes.js';
import gemstoneRoutes from './routes/gemstoneRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminDashboardRoutes.js';
import { requireAuth } from './controllers/adminDashboardController.js';
import gemstoneAIRoutes from './routes/gemstoneAIRoutes.js';
import customerAuthRoutes from './routes/customerAuthRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupDefaultAdmin, displayStartupInfo } from './utils/setupAdmin.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease check your .env file');
  process.exit(1);
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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
  max: parseInt(process.env.RATE_LIMIT_MAX || '', 10) || (process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true' || process.env.CI ? 100000 : 300),
  skip: () => process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true' || process.env.CI === 'true',
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: process.env.NODE_ENV === 'production'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for admin dashboard
}));

// CORS configuration
const allowedOrigins = [
  'https://kohinoorgemstone.com',
  'https://www.kohinoorgemstone.com',
  'http://kohinoorgemstone.com',
  'http://www.kohinoorgemstone.com',
    process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  process.env.FRONTEND_DEV_URL,
  process.env.FRONTEND_DEV_URL_VITE
].filter(Boolean);

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for admin dashboard
app.use('/admin/assets', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set global template variables
app.use((req, res, next) => {
  res.locals.frontendUrl = process.env.FRONTEND_URL || '';
  next();
});

// Serve frontend static files in production FIRST
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
}

// Admin Dashboard Routes (only /admin paths)
app.use('/', adminRoutes);

// API Rate Limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerAuthRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/gemstones', gemstoneRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
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

// Swagger API documentation - behind admin dashboard session auth.
// Registered before the production SPA catch-all so /admin/api-docs is not
// swallowed by the React router.

// Raw OpenAPI spec JSON (admin only, for tooling / clients)
app.get('/admin/api-docs.json', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI (admin only; unauthenticated users are redirected to /admin/login)
app.use('/admin/api-docs', requireAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Kohinoor Gemstone API Docs',
  customCss: '.swagger-ui .topbar { display: none; }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list'
  }
}));

// Handle React Router - serve index.html for all non-API, non-admin routes
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  
  app.get('*', (req, res, next) => {
    // Skip API and admin routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Handle 404 routes (API only)
app.use((req, res) => {
  // For API routes, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: 'error',
      message: `Route ${req.originalUrl} not found on this server`
    });
  }
  // For other routes in production, this shouldn't be reached
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server - bind to port FIRST (required for Render), then connect DB
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});

// Connect to DB and setup after server is listening
(async () => {
  try {
    await connectDB();
    await setupDefaultAdmin();
    displayStartupInfo();
  } catch (err) {
    console.error('Startup error:', err.message);
  }
})(); 