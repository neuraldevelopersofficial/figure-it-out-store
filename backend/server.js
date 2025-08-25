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
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:8081', // Add this for your current frontend port
    'http://localhost:3000'  // Common alternative port
  ],
  credentials: true
}));

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
app.use('/api/user', userRoutes);

// Serve static files from public folder
app.use(express.static('public'));

// Serve uploaded files
app.use('/uploads', express.static('public/uploads'));

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔐 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@figureitout.in'}`);
  
  // Connect to database
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.log('⚠️  Server will continue with in-memory stores for development');
  }
});
