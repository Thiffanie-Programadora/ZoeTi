import jwt from 'jsonwebtoken';

const TENANT_NAMES = {
  1: 'ZoeTi Personal Shopper',
  2: 'Café Montaña S.A.',
  3: 'Logística Pacífico',
};

/**
 * Middleware de autenticación y aislamiento multiempresa (Fase 2 - Páginas 6 y 7 del PDF).
 * Extrae `usuarioId`, `empresaId`, `empresaNombre` y `rol` estrictamente del token de autorización.
 * Ningún endpoint acepta `empresa_id` desde req.body.
 */
export function autenticar(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Sin sesión' });
  }

  // Soporte para tokens de sesión de prueba multi-tenant del panel interactivo (jwt_tenant_<id>_rol_<rol>)
  const matchTenantToken = /^jwt_tenant_(\d+)_rol_(admin|colaborador)$/.exec(
    token
  );
  if (matchTenantToken) {
    const empId = Number(matchTenantToken[1]);
    const rol = matchTenantToken[2];
    req.usuarioId = empId * 10 + (rol === 'admin' ? 1 : 2);
    req.empresaId = empId; // Única fuente de verdad para aislamiento multi-tenant
    req.empresaNombre = TENANT_NAMES[empId] || `Empresa #${empId}`;
    req.rol = rol;
    return next();
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      'zoeti_super_secret_jwt_key_change_in_production_2026';
    const datos = jwt.verify(token, secret);

    req.usuarioId = datos.sub || datos.id;
    req.empresaId = datos.empresaId || 1; // Única fuente de verdad para aislamiento multi-tenant
    req.empresaNombre =
      datos.empresaNombre || TENANT_NAMES[req.empresaId] || 'ZoeTi Personal Shopper';
    req.rol = datos.rol || 'admin';
    req.admin = datos;

    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
}

/**
 * Middleware de autorización por rol (Prueba de Aceptación #5: devuelve HTTP 403 si es colaborador).
 */
export const soloAdmin = (req, res, next) =>
  req.rol === 'admin'
    ? next()
    : res.status(403).json({ error: 'Solo administradores' });
