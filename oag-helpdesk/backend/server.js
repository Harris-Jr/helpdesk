// TODO: migrate uploads to object storage (S3/Cloudinary) before production.
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import entityRoutes from './routes/entityRoutes.js';
import functionRoutes from './routes/functionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { optionalAuth } from './middleware/auth.js';
import { applyAccessContext } from './middleware/accessControl.js';
import { realtimeRoute } from './utils/socket.js';
import { healthCheck } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:6173')
  .split(',')
  .map((origin) => origin.trim());

app.use(morgan('dev'));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(optionalAuth);
app.use(applyAccessContext);

app.get('/api/health', async (_req, res, next) => {
  try {
    res.json(await healthCheck());
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/uploads', uploadRoutes);
app.get('/api/realtime/:entity', realtimeRoute);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error'
  });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`OAG Helpdesk backend listening on http://localhost:${port}`);
});
