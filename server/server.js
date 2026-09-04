import 'dotenv/config';
import { app } from './app.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedDatabase } from './seed/seeder.js';
import { connectDB } from './config/db.js';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);

const startServer = async () => {
  try {
    console.log('[Backend] Starting EduPulse standalone Express server...');
    // Connect to MongoDB Atlas
    await connectDB();
    
    // Seed initial data if empty
    await seedDatabase();

    // Serve static files in production if dist exists
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    app.get('/{*splat}', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'), (err) => {
        if (err) {
          next();
        }
      });
    });

    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`[Backend] Express Server running at http://localhost:${PORT}`);
      console.log(`[Backend] API endpoints live at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('[Backend] Failed to start server:', error);
  }
};

startServer();
