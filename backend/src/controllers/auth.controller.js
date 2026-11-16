import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * POST /api/auth/login
 * Autentica al administrador único verificando email y contraseña cifrada con bcrypt.
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Debes ingresar correo electrónico y contraseña.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await query(
      `SELECT id, name, email, password_hash, role, is_active
       FROM admins
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas.',
      });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        ok: false,
        message: 'Esta cuenta administrativa se encuentra desactivada.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas.',
      });
    }

    // Actualizar fecha de último acceso
    await query(
      `UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id]
    );

    const secret =
      process.env.JWT_SECRET ||
      'zoeti_super_secret_jwt_key_change_in_production_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '12h';

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      ok: true,
      message: 'Autenticación exitosa.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AuthController.loginAdmin] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al procesar el inicio de sesión.',
    });
  }
};

/**
 * GET /api/auth/me
 * Devuelve el perfil del administrador autenticado a partir del JWT.
 */
export const getAdminProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, last_login_at, created_at
       FROM admins
       WHERE id = $1
       LIMIT 1`,
      [req.admin.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado.',
      });
    }

    return res.status(200).json({
      ok: true,
      admin: result.rows[0],
    });
  } catch (error) {
    console.error('[AuthController.getAdminProfile] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la sesión del administrador.',
    });
  }
};

