import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Safely load environment from .env.local or .env
const envLocal = path.resolve(process.cwd(), '.env.local');
const envDefault = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
}
if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

export function getMongoUri(): string {
  // Support both MONGODB_URI and MONGODBURL
  let uri = process.env.MONGODB_URI || process.env.MONGODBURL || '';

  // In case .env.local has "MONGODBURL:..." or similar
  if (!uri && fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('MONGODB_URI=')) uri = trimmed.slice(12).trim();
      else if (trimmed.startsWith('MONGODBURL:')) uri = trimmed.slice(11).trim();
      else if (trimmed.startsWith('MONGODB_URI:')) uri = trimmed.slice(12).trim();
      else if (trimmed.startsWith('MONGODBURL=')) uri = trimmed.slice(11).trim();
    }
  }

  if (!uri) {
    throw new Error(
      'MISSING_MONGODB_URI: MONGODB_URI or MONGODBURL is not defined in environment variables or .env.local.'
    );
  }

  // Ensure default database name if none in URI
  if (uri.endsWith('.mongodb.net/')) {
    uri += 'love_sketchbook?retryWrites=true&w=majority';
  } else if (uri.endsWith('.mongodb.net')) {
    uri += '/love_sketchbook?retryWrites=true&w=majority';
  }

  return uri;
}

let cachedConn: typeof mongoose | null = null;

/**
 * Connect to MongoDB Atlas with connection caching for Serverless & Long-running runtimes
 */
export async function connectDB(): Promise<typeof mongoose> {
  // 1. If connection is already open, reuse it immediately (serverless warm start)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 2. If connection is currently in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
    return mongoose;
  }

  const uri = getMongoUri();
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`[Database] Connecting to MongoDB Atlas (${maskedUri})...`);

  try {
    cachedConn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    console.log(`[Database] Connected successfully to database "${mongoose.connection.name}".`);
    return cachedConn;
  } catch (err: any) {
    console.error('[Database] Fatal: Unable to connect to MongoDB Atlas:', err.message);
    throw err;
  }
}
