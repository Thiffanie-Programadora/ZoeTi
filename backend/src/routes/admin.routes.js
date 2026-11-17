import { Router } from 'express';
import { autenticar, soloAdmin } from '../middlewares/auth.js';
import { getTenantPlan, getTenantUsage } from '../rag/tenantStore.js';

const router = Router();

router.get('/uso', autenticar, soloAdmin, async (req, res) => {
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

