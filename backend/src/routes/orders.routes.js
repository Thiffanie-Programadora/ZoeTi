import { Router } from 'express';
import {
  createPublicOrderRequest,
  trackOrderByCode,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  deleteOrderAdmin,
} from '../controllers/orders.controller.js';
import { verifyAdminToken } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Rutas Públicas ---
// POST /api/orders - Crear solicitud de cotización / pedido
router.post('/', createPublicOrderRequest);

// GET /api/orders/track/:code - Consultar estado de pedido por código
router.get('/track/:code', trackOrderByCode);

// --- Rutas Privadas (Panel de Administración JWT) ---
// GET /api/orders - Obtener todos los pedidos con filtros
router.get('/', verifyAdminToken, getAllOrdersAdmin);

// PATCH /api/orders/:id/status - Actualizar estado y cotización del pedido
router.patch('/:id/status', verifyAdminToken, updateOrderStatusAdmin);

// DELETE /api/orders/:id - Eliminar pedido
router.delete('/:id', verifyAdminToken, deleteOrderAdmin);

export default router;

