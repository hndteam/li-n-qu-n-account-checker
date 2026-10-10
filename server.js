import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './backend/db/connection.js';
import { authRouter } from './backend/routes/auth.js';
import { accountRouter } from './backend/routes/accounts.js';
import { historyRouter } from './backend/routes/history.js';
import { adminRouter } from './backend/routes/admin.js';
import { exportRouter } from './backend/routes/export.js';
import { authMiddleware } from './backend/middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'Liên Quân Account Checker v2',
    timestamp: new Date().toISOString(),
    db: process.env.DB_TYPE || 'mongo'
  });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/accounts', authMiddleware, accountRouter);
app.use('/api/history', authMiddleware, historyRouter);
app.use('/api/export', authMiddleware, exportRouter);
app.use('/api/admin', authMiddleware, adminRouter);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(port, () => {
      console.log(`✓ Liên Quân Account Checker running on http://localhost:${port}`);
      console.log(`✓ Database: ${process.env.DB_TYPE || 'mongo'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
