import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';

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
app.use(express.json({ limit: '1mb' }));

// Endpoint de salud del servidor
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'ZoeTi Personal Shopper API',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);

// Manejador de rutas no encontradas (404)
app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta de API no encontrada.',
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 ZoeTi Personal Shopper API ejecutándose en http://localhost:${PORT}`
  );
});

