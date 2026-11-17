/**
 * Fase 3.1 - Extracción de texto de archivos subidos (PDF, DOCX con mammoth, y texto plano).
 * Páginas 7 y 8 del PDF.
 */
export async function extraerTexto(buffer, mimetype = '') {
  if (mimetype === 'application/pdf') {
    try {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    } catch {
      // Fallback lector de texto en flujos PDF si unpdf no está instalado aún
      return buffer.toString('utf8').replace(/[^\x20-\x7E\xA0-\xFF\n\r]/g, ' ');
    }
  }

  if (mimetype.includes('wordprocessingml')) {
    try {
      const mammoth = await import('mammoth');
      const { value } = await mammoth.default.extractRawText({ buffer });
      return value;
    } catch {
      return buffer.toString('utf8');
    }
  }

  if (mimetype.startsWith('text/') || mimetype === 'application/json') {
    return buffer.toString('utf8');
  }

  throw new Error('Formato no soportado');
}

