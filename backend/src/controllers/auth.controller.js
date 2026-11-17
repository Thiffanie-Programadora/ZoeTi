import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  isMySQLConnected,
  query,
  readLocalDb,
  writeLocalDb,
} from '../config/db.js';

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
    let admin = null;

    if (isMySQLConnected) {
      const rows = await query(
        `SELECT id, name, email, password_hash, role, is_active
         FROM admins
         WHERE LOWER(email) = ?
         LIMIT 1`,
        [normalizedEmail]
      );
      admin = rows[0] || null;
    } else {
      const dbData = await readLocalDb();
      admin =
        dbData.admins.find((a) => a.email.toLowerCase() === normalizedEmail) ||
        null;
    }

    if (!admin) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas.',
      });
    }

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

    if (isMySQLConnected) {
      await query(`UPDATE admins SET last_login_at = NOW() WHERE id = ?`, [
        admin.id,
      ]);
    } else {
      const dbData = await readLocalDb();
      const idx = dbData.admins.findIndex((a) => a.id === admin.id);
      if (idx !== -1) {
        dbData.admins[idx].last_login_at = new Date().toISOString();
        writeLocalDb(dbData);
      }
    }

    const secret =
      process.env.JWT_SECRET ||
      'zoeti_super_secret_jwt_key_change_in_production_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '12h';

    const token = jwt.sign(
      {
        sub: admin.id,
        id: admin.id,
        empresaId: 1,
        empresaNombre: 'ZoeTi Personal Shopper',
        email: admin.email,
        name: admin.name,
        rol: admin.role || 'admin',
        role: admin.role || 'admin',
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
        role: admin.role || 'admin',
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
    if (isMySQLConnected) {
      const rows = await query(
        `SELECT id, name, email, role, last_login_at, created_at
         FROM admins
         WHERE id = ?
         LIMIT 1`,
        [req.admin.id]
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ ok: false, message: 'Administrador no encontrado.' });
      }
      return res.status(200).json({ ok: true, admin: rows[0] });
    }

    const dbData = await readLocalDb();
    const admin = dbData.admins.find((a) => a.id === Number(req.admin.id));
    if (!admin) {
      return res
        .status(404)
        .json({ ok: false, message: 'Administrador no encontrado.' });
    }
    return res.status(200).json({ ok: true, admin });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la sesión del administrador.',
    });
  }
};
