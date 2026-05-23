const express = require('express');
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoute');
const taskRoute = require('./routes/taskRoute');
const adminRoute = require('./routes/adminRoute');


// Load environment variables if dotenv is installed, otherwise fallback gracefully
try {
  require('dotenv').config();
} catch (error) {
  // Graceful fallback when dotenv is not installed
}

const app = express();

// Connect to Database
connectDB();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manual CORS Middleware (no external 'cors' package needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Avidus Interactive API' });
});

// Authentication Routes
app.use('/api/auth', authRoute);

// User Task Routes
app.use('/api/tasks', taskRoute);

// Admin Routes
app.use('/api/admin', adminRoute);


// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
