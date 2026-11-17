import { Router } from 'express';
import { autenticar, soloAdmin } from '../middlewares/auth.js';
import { verificarLimiteDocumentos } from '../middlewares/limites.js';
import { extraerTexto } from '../services/extraccion.service.js';
import { indexarDocumento } from '../rag/indexar.js';
import {
  listarDocumentosPorEmpresa,
  crearDocumentoStore,
  getTenantPlan,
  getTenantUsage,
} from '../rag/tenantStore.js';
import { sincronizarCarpetaEmpresa } from '../jobs/sincronizar-drive.js';

const router = Router();

/**
 * GET /api/documentos
 * Devuelve exclusivamente los documentos de la empresa del token JWT (req.empresaId).
 */
router.get('/documentos', autenticar, async (req, res) => {
  const docs = await listarDocumentosPorEmpresa(req.empresaId);
  res.json({ ok: true, empresaId: req.empresaId, documentos: docs });
});

/**
 * POST /api/documentos
 * Protegido con `autenticar`, `soloAdmin` (devuelve 403 si es colaborador - Prueba #5)
 * y `verificarLimiteDocumentos` (devuelve 429 si excede el plan).
 */
router.post(
  '/documentos',
  autenticar,
  soloAdmin,
  verificarLimiteDocumentos,
  async (req, res) => {
    try {
      const { nombre, contenido, mimetype = 'text/plain' } = req.body;
      if (!nombre || !contenido) {
        return res
          .status(400)
          .json({ error: 'Se requiere nombre y contenido del documento' });
      }

      const buffer = Buffer.from(String(contenido), 'utf8');
      const texto = await extraerTexto(buffer, mimetype);

      // Nunca se usa req.body.empresa_id; se usa exclusivamente req.empresaId del JWT
      const doc = await crearDocumentoStore(req.empresaId, nombre, 'carga');
      await indexarDocumento(req.empresaId, doc.id, texto);

      return res.status(201).json({
        id: doc.id,
        nombre: doc.nombre,
        estado: 'indexado',
        empresaId: req.empresaId,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/drive/sincronizar
 * Botón «Sincronizar ahora» del panel de administración (Página 10 y Prueba #3).
 */
router.post('/drive/sincronizar', autenticar, soloAdmin, async (req, res) => {
  try {
    const carpetaId = req.body.carpetaId || '1ZoeTiDriveFolderCR_2026';
    const sincronizados = await sincronizarCarpetaEmpresa(
      req.empresaId,
      carpetaId
    );
    return res.status(200).json({
      ok: true,
      sincronizados,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/uso
 * Devuelve el consumo mensual de preguntas y documentos frente al plan contratado.
 */
router.get('/uso', autenticar, async (req, res) => {
  const plan = await getTenantPlan(req.empresaId);
  const usage = await getTenantUsage(req.empresaId);
  res.json({
    ok: true,
    empresaId: req.empresaId,
    empresaNombre: req.empresaNombre,
    plan,
    usage,
  });
});

export default router;

