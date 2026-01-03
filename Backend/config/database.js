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
      // MongoDB connection options
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('⚠️  Server will continue running, but database features will not work.');
    // Don't exit process - allow server to run without DB for now
    // process.exit(1);
  }
};

export default connectDB;

