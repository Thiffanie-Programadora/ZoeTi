import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación JWT para rutas privadas del panel de administración.
 * Espera cabecera: Authorization: Bearer <token>
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: 'Acceso no autorizado. Token de sesión requerido.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret =
      process.env.JWT_SECRET ||
      'zoeti_super_secret_jwt_key_change_in_production_2026';

    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o sesión expirada. Por favor inicia sesión nuevamente.',
    });
  }
};

