import { getTenantUsage, getTenantPlan } from '../rag/tenantStore.js';

/**
 * Middleware que verifica el límite mensual de preguntas según el plan ('gratis' vs 'pro').
 * Responde con HTTP 429 en caso de superarlo (Fase 2 - Página 7 y Prueba de Aceptación #6).
 */
export async function verificarLimitePreguntas(req, res, next) {
  try {
    const empresaId = req.empresaId;
    const plan = await getTenantPlan(empresaId);
    const usage = await getTenantUsage(empresaId);

    if (usage.usadas >= plan.max_preguntas_mes) {
      return res.status(429).json({
        error: 'Límite mensual del plan alcanzado',
        usadas: usage.usadas,
        max_preguntas_mes: plan.max_preguntas_mes,
        plan: plan.id,
      });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Middleware que verifica el límite de documentos según el plan contratado.
 */
export async function verificarLimiteDocumentos(req, res, next) {
  try {
    const empresaId = req.empresaId;
    const plan = await getTenantPlan(empresaId);
    const usage = await getTenantUsage(empresaId);

    if (usage.documentos >= plan.max_documentos) {
      return res.status(429).json({
        error: 'Límite máximo de documentos del plan alcanzado',
        documentos: usage.documentos,
        max_documentos: plan.max_documentos,
        plan: plan.id,
      });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

