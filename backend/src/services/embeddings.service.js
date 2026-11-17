const URL = 'https://api.voyageai.com/v1/embeddings';

/**
 * Genera un vector determinístico de 1024 dimensiones basado en frecuencias léxicas
 * cuando VOYAGE_API_KEY no está configurada en .env, permitiendo probar similitud coseno local.
 */
export function generarEmbeddingDeterministico1024(texto) {
  const vec = new Array(1024).fill(0);
  const tokens = String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % 1024;
    vec[idx] += 1;
  }

  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Fase 4 - Servicio de Embeddings con Voyage AI (`voyage-4`, input_type: 'document' | 'query').
 * Página 9 del PDF.
 */
export async function embed(textos, tipo = 'query') {
  if (
    process.env.VOYAGE_API_KEY &&
    !process.env.VOYAGE_API_KEY.startsWith('pa-...')
  ) {
    const r = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: textos,
        model: 'voyage-4',
        input_type: tipo,
      }),
    });
    if (!r.ok) throw new Error(`Voyage ${r.status}`);
    const { data } = await r.json();
    return data.map((d) => d.embedding);
  }

  // Fallback determinístico de 1024 dimensiones para pruebas locales sin API key externa
  return textos.map((t) => generarEmbeddingDeterministico1024(t));
}

