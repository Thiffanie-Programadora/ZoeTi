import { Router } from 'express';
import {
  loginAdmin,
  getAdminProfile,
} from '../controllers/auth.controller.js';
import { verifyAdminToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/login - Inicio de sesión administrativo con JWT y bcrypt
router.post('/login', loginAdmin);

// GET /api/auth/me - Verificar sesión activa del administrador
router.get('/me', verifyAdminToken, getAdminProfile);

export default router;

