import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
if (!global.__mongooseCache) global.__mongooseCache = cache;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment');
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
