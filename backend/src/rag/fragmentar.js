/**
 * Fase 4 - Fragmentación de documentos con solapamiento (Página 9 del PDF).
 * Divide el texto limpio en bloques de 1500 caracteres con solape de 200 caracteres
 * para que ninguna idea que cruce el corte se pierda.
 */
export function fragmentar(texto, tam = 1500, solape = 200) {
  const limpio = String(texto || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) return [];

  const partes = [];
  for (let i = 0; i < limpio.length; i += tam - solape) {
    partes.push(limpio.slice(i, i + tam));
    if (i + tam >= limpio.length) break;
  }
  return partes;
}

