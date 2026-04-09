const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Validate critical secrets before startup
const validateEnv = require('./utils/envValidator');
validateEnv();

// Require Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const analysisRoutes = require('./routes/analysis.routes');
const scanRoutes = require('./routes/scan.routes');
const adminRoutes = require('./routes/admin.routes');
const certificationRoutes = require('./routes/certification.routes');
const exposureRoutes = require('./routes/exposure.routes'); // Public tracking & reporting

// Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet());

// Configure CORS for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body Parser
app.use(express.json());

// Trust proxy for accurate rate limiting (Render/Vercel)
app.set('trust proxy', 1);

// Logger
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// GLOBAL Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Balanced for SPA usage
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// STRICT Rate Limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, // Strict: 20 attempts per 15 mins
  message: 'Security Alert: Excessive requests to sensitive endpoints. Please wait 15 minutes.'
});

// Protect Auth & Public Submissions
app.use('/api/auth/', strictLimiter);
app.use('/api/public/reports', strictLimiter);
app.use('/api/public/reviews', strictLimiter);
app.use('/api/certification/apply', strictLimiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/public', exposureRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'VERDICT Engine is running' });
});

// Fallback for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

// Vercel Serverless Export
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

module.exports = app;
