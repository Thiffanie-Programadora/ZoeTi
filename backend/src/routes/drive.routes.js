import { Router } from 'express';
import { autenticar, soloAdmin } from '../middlewares/auth.js';
import { sincronizarCarpetaEmpresa } from '../jobs/sincronizar-drive.js';

const router = Router();

router.post('/sincronizar', autenticar, soloAdmin, async (req, res) => {
  try {
    const carpetaId = req.body.carpetaId || '1ZoeTiDriveFolderCR_2026';
    const sincronizados = await sincronizarCarpetaEmpresa(
      req.empresaId,
      carpetaId
    );
    res.json({ ok: true, sincronizados });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

