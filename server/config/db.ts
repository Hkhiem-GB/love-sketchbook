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

export async function connectDB(): Promise<void> {
  const uri = getMongoUri();

  // Mask credentials for secure logging
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`[Database] Connecting to MongoDB Atlas (${maskedUri})...`);

  try {
    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB Atlas connected successfully to database "${mongoose.connection.name}".`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true, // Build indexes in development
    });
  } catch (err: any) {
    console.error('[Database] Fatal: Unable to connect to MongoDB Atlas:', err.message);
    throw err;
  }
}
