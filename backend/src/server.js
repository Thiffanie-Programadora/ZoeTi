import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import documentosRoutes from './routes/documentos.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { iniciarJobSincronizacionDrive } from './jobs/sincronizar-drive.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales de seguridad y parseo
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));

// Endpoint de salud del servidor
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'ZoeTi Personal Shopper & PolicyBot RAG API',
    database: process.env.DB_NAME || 'zoeti',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', documentosRoutes);
app.use('/api', chatRoutes);

// Manejador de rutas no encontradas (404)
app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta de API no encontrada.',
  });
});

// Inicializar base de datos, cron de Google Drive y levantar el servidor
iniciarJobSincronizacionDrive();
initDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀 ZoeTi & PolicyBot RAG API ejecutándose en http://localhost:${PORT}`
    );
  });
});
