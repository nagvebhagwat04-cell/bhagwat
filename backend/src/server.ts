import app from './app.js';
import { connectDB, isUsingMemoryDB } from './config/db.js';
import { seedData } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (isUsingMemoryDB()) {
      console.log('[Server] In-memory database detected. Populating demo data...');
      await seedData(false);
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Personal Finance Adviser Backend running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err: any) {
    console.error('[Server] Fatal startup error:', err.message);
    process.exit(1);
  }
};

startServer();
