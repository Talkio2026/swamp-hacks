import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw at module load - let the connection function handle it
// This prevents Next.js from returning HTML error pages

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // Check for MONGODB_URI here instead of at module load
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined. Please configure your database connection.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[MongoDB] Connected successfully");
      return mongoose;
    }).catch((error) => {
      // Clear the promise on error so we can retry
      cached.promise = null;
      console.error("[MongoDB] Connection error:", error);
      throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
