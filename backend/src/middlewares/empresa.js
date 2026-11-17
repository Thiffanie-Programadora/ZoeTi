/**
 * Middleware de validación de contexto de empresa (garantiza que req.empresaId exista
 * y que jamás se utilice req.body.empresa_id).
 */
export function validarContextoEmpresa(req, res, next) {
  if (req.body && 'empresa_id' in req.body) {
    delete req.body.empresa_id;
  }
  if (!req.empresaId) {
    return res.status(401).json({ error: 'Contexto de empresa no identificado en el token.' });
  }
  return next();
}

