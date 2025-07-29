const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const logger = require('./config/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Improved MongoDB connection
const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookhub');
    logger.info('Connected to MongoDB successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1); 
  }
};
connectDB();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

// middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // this is for cookies, authorization headers
}));

app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  logger.info('Health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  
  res.status(200).json({
    status: 'OK',
    message: 'BookHub Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'BookHub API' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    timestamp: new Date().toISOString(),
  });
});

// Server startup
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server started successfully on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });
}

module.exports = app;