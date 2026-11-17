/**
 * Middleware global de manejo de errores para el backend.
 */
export function manejadorErrores(err, _req, res, _next) {
  console.error('[Error API]:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
  });
}

