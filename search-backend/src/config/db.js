const mongoose = require('mongoose');

// Cache the connection across serverless invocations (critical for Vercel)
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions = {
  maxPoolSize: 10,               // Up to 10 reused connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,         // Fail fast instead of buffering when disconnected
};

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env file.');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then((m) => {
        console.log('[DB] MongoDB connected');
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
