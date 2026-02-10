import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.warn('⚠️  MONGODB_URI not configured. Please set it in your .env file.');
    console.warn('⚠️  Database features will not work until MongoDB is configured.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      // Optimized connection settings for faster responses
      maxPoolSize: 10,           // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,    // Close sockets after 45s of inactivity
      bufferCommands: false,     // Disable buffering for faster error detection
      heartbeatFrequencyMS: 10000, // Check server health every 10s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Log connection events for debugging
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('⚠️  Server will continue running, but database features will not work.');
  }
};

export default connectDB;

