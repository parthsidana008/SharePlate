import dotenv from 'dotenv';

// Load environment variables as early as possible so imported modules
// that read `process.env` at import time get the values.
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { initializeSocket } from './socket/socketServer.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import { socketAuth } from './socket/middleware/socketAuth.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import donationRoutes from './routes/donation.routes.js';
import requestRoutes from './routes/request.routes.js';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SharePlate API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Apply authentication middleware to Socket.IO
io.use(socketAuth);

// Setup socket handlers
setupSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server initialized`);
});

