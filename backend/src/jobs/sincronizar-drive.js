import {
  listarCarpeta,
  leerArchivo,
} from '../services/drive.service.js';
import {
  obtenerEmpresasStore,
  upsertDocumentoDriveStore,
  marcarDocumentoModificadoStore,
} from '../rag/tenantStore.js';
import { indexarDocumento } from '../rag/indexar.js';

/**
 * Sincroniza la carpeta de Google Drive de una sola empresa (usado por el botón «Sincronizar ahora»
 * y por el cron job periódico de cada hora - Página 10 del PDF).
 */
export async function sincronizarCarpetaEmpresa(empresaId, driveCarpetaId) {
  const archivos = await listarCarpeta(driveCarpetaId);
  const sincronizados = [];

  for (const f of archivos) {
    const doc = await upsertDocumentoDriveStore(empresaId, f);
    if (doc.drive_modificado?.toISOString() === f.modifiedTime) {
      continue;
    }
    const texto = await leerArchivo(f);
    await indexarDocumento(empresaId, doc.id, texto);
    await marcarDocumentoModificadoStore(empresaId, doc.id, f.modifiedTime);
    sincronizados.push({ id: doc.id, nombre: f.name, modifiedTime: f.modifiedTime });
  }

  return sincronizados;
}

/**
 * Inicializa el job periódico (cada hora: "0 * * * *") si node-cron está disponible.
 */
export async function iniciarJobSincronizacionDrive() {
  try {
    const cron = await import('node-cron');
    cron.default.schedule('0 * * * *', async () => {
      const empresas = await obtenerEmpresasStore();
      for (const e of empresas) {
        if (!e.drive_carpeta_id) continue;
        await sincronizarCarpetaEmpresa(e.id, e.drive_carpeta_id);
      }
    });
  } catch {
    // Continúa sin bloquear si node-cron no está instalado
  }
}

