import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMemoryServer = false;
let memoryServerInstance: any = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  // Try connecting to provided URI if available and not explicitly test/memory mode
  if (uri && process.env.USE_MEMORY_DB !== 'true') {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[Database] Connected to external MongoDB at ${uri.replace(/\/\/.*@/, '//***@')}`);
      return;
    } catch (err: any) {
      console.warn(`[Database] Could not connect to external MongoDB: ${err.message}. Falling back to embedded MongoMemoryServer.`);
    }
  }

  // Fallback to MongoMemoryServer for development / testing
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();
    await mongoose.connect(memUri);
    isMemoryServer = true;
    console.log(`[Database] Connected to embedded in-memory MongoDB at ${memUri}`);
  } catch (err: any) {
    console.error('[Database] Failed to initialize database connection:', err.message);
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (err: any) {
    console.error('[Database] Error disconnecting:', err.message);
  }
};

export const isUsingMemoryDB = (): boolean => isMemoryServer;
