import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Simple in-memory cache for user data (5 minute TTL)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUser = (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  userCache.delete(userId);
  return null;
};

const setCachedUser = (userId, user) => {
  userCache.set(userId, { user, timestamp: Date.now() });
};

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Use token data directly for basic info (fast path - no DB query)
      // This works because we store user info in JWT during login
      if (decoded.id && decoded.role && decoded.name) {
        req.user = {
          id: decoded.id,
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        };
        return next();
      }

      // Fallback: Check cache first
      let user = getCachedUser(decoded.id);
      
      if (!user) {
        // Only query DB if not in cache and token doesn't have full info
        user = await User.findById(decoded.id).select('-password').lean();
        if (user) {
          setCachedUser(decoded.id, user);
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = { ...user, id: user._id.toString() };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

