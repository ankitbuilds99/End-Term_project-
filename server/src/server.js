import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 8008;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[SunteRaho Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[SunteRaho Server] API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('[SunteRaho Server] Startup error:', error.message);
    process.exit(1);
  }
};

startServer();
