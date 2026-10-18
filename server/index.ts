import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Love Sketchbook Backend running at http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error('[Server] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
