import { embed } from '../services/embeddings.service.js';
import { buscarFragmentosSimilaresPorEmpresa } from './tenantStore.js';

/**
 * Fase 5 - Recuperación vectorial y armado de bloque XML <documentos> para la empresa del token.
 */
export async function recuperarContextoRag(empresaId, pregunta, limit = 6) {
  const [vq] = await embed([pregunta], 'query');
  const fragmentos = await buscarFragmentosSimilaresPorEmpresa(
    empresaId,
    vq,
    limit
  );

  const contextoXml = fragmentos
    .map(
      (f, i) =>
        `<doc id="${i + 1}" fuente="${f.nombre}">${f.texto.replace(/<\/?(documentos|doc)\b[^>]*>/gi, '')}</doc>`
    )
    .join('\n');

  const fuentes = fragmentos.map((f, i) => ({
    id: i + 1,
    nombre: f.nombre,
  }));

  return { fragmentos, contextoXml, fuentes };
}

