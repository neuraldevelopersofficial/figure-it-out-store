const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Database connection
const { connectToDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'https://figureitoutstore.in',
      'https://www.figureitoutstore.in',
      'https://figureitout.in',
      'https://www.figureitout.in',
      'https://api.figureitoutstore.in'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Credentials'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
};

app.use(cors(corsOptions));

// Add additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Note: Rate limiting is now handled per-route in middleware/rateLimiter.js
// This prevents double rate limiting and allows more granular control

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const razorpayRoutes = require('./routes/razorpay');
const carouselRoutes = require('./routes/carousels');
const pincodeRouter = require('./routes/pincode');
const uploadRoutes = require('./routes/upload');
const cloudinaryRoutes = require('./routes/cloudinary');
const userRoutes = require('./routes/user');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/carousels', carouselRoutes);
app.use('/api/pincode', pincodeRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/user', userRoutes);

// Serve static files from public folder
app.use(express.static('public'));

// Serve uploaded files
app.use('/uploads', express.static('public/uploads'));

// Serve static files from the frontend build directory
app.use(express.static('../dist'));

// Serve the React app for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path === '/health' || req.path.startsWith('/uploads/')) {
    return next();
  }
  
  // Serve the index.html from the frontend build directory
  res.sendFile('index.html', { root: '../dist' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔐 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@figureitout.in'}`);
  
  // Connect to database
  try {
    await connectToDatabase();
    
    // Initialize stores
    const carouselStore = require('./store/carouselStore');
    await carouselStore.init();
    
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.log('⚠️  Server will continue with in-memory stores for development');
  }
});
