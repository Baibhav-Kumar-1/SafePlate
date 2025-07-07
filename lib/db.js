import mongoose from 'mongoose';
import { getModels } from '@/models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export async function getDBModels() {
  try {
    await connectDB();
    const models = getModels();
    
    // Verify each model is properly initialized
    const { User } = models;
    if (!User) {
      throw new Error('Models not properly initialized');
    }
    
    return models;
  } catch (error) {
    console.error('Error getting models:', error);
    throw error;
  }
}

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cached.conn = null;
  cached.promise = null;
});

process.on('SIGINT', async () => {
  if (cached.conn) {
    await cached.conn.close();
  }
  process.exit(0);
});

export default connectDB;