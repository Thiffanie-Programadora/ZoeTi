import { fragmentar } from './fragmentar.js';
import { embed } from '../services/embeddings.service.js';
import { guardarFragmentosStore } from './tenantStore.js';

/**
 * Fase 4 - Indexación de fragmentos y embeddings por lotes de 64 (Página 9 del PDF).
 * Garantiza aislamiento multiempresa con empresaId y documentoId.
 */
export async function indexarDocumento(empresaId, documentoId, texto) {
  const partes = fragmentar(texto);
  const todosLosVectores = [];

  for (let i = 0; i < partes.length; i += 64) {
    // Lotes de 64 fragmentos según especificación de la Página 9
    const lote = partes.slice(i, i + 64);
    const vectores = await embed(lote, 'document');
    todosLosVectores.push(...vectores);
  }

  await guardarFragmentosStore(
    empresaId,
    documentoId,
    partes,
    todosLosVectores
  );
}

