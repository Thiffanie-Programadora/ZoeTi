import { embed } from '../services/embeddings.service.js';
import { fragmentar } from './fragmentar.js';

/**
 * Almacén Multi-Tenant con soporte vectorial (similitud coseno <=> de 1024 dimensiones)
 * Precargado con ZoeTi Personal Shopper (empresa 1), Café Montaña S.A. (empresa 2)
 * y Logística Pacífico (empresa 3) según la Sección 10 del PDF.
 */
const PLANES = {
  gratis: { id: 'gratis', max_documentos: 10, max_preguntas_mes: 200 },
  pro: { id: 'pro', max_documentos: 500, max_preguntas_mes: 10000 },
};

const EMPRESAS = [
  {
    id: 1,
    nombre: 'ZoeTi Personal Shopper',
    plan_id: 'pro',
    drive_carpeta_id: '1ZoeTiDriveFolderCR_2026',
    creada_en: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: 'Café Montaña S.A.',
    plan_id: 'gratis',
    drive_carpeta_id: '1CafeMontanaFolder_2026',
    creada_en: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: 'Logística Pacífico',
    plan_id: 'pro',
    drive_carpeta_id: '1LogisticaPacificoFolder_2026',
    creada_en: new Date().toISOString(),
  },
];

const DOCUMENTOS_INICIALES = [
  // Empresa 1: ZoeTi Personal Shopper
  {
    id: 101,
    empresa_id: 1,
    nombre: 'Politica_Importaciones_y_Rutas_ZoeTi.pdf',
    origen: 'carga',
    drive_file_id: null,
    drive_modificado: null,
    estado: 'indexado',
    contenido:
      'Política Oficial de Importaciones ZoeTi Personal Shopper: Realizamos importaciones desde México (5 a 8 días hábiles), Colombia (4 a 7 días hábiles), Perú (6 a 9 días hábiles) y Panamá (3 a 5 días hábiles) hacia toda Costa Rica. El precio cotizado por WhatsApp (+506 6381-1395) es 100% final e incluye producto, transporte internacional, impuestos aduanales y ganancia de personal shopper.',
  },
  {
    id: 102,
    empresa_id: 1,
    nombre: 'Manual_Pagos_y_Entregas_GAM_Provincias.docx',
    origen: 'carga',
    drive_file_id: null,
    drive_modificado: null,
    estado: 'indexado',
    contenido:
      'Reglamento de Pagos y Entregas ZoeTi: Aceptamos SINPE Móvil, transferencia bancaria en colones o dólares y tarjeta. Entregamos con mensajería privada en el GAM y mediante Correos de Costa Rica EMS en las 7 provincias. Correo oficial: administracionzoeTi@gmail.com.',
  },
  // Empresa 2: Café Montaña S.A. (Datos de prueba Página 12)
  {
    id: 201,
    empresa_id: 2,
    nombre: 'Politica_Vacaciones_Cafe_Montana.pdf',
    origen: 'carga',
    drive_file_id: null,
    drive_modificado: null,
    estado: 'indexado',
    contenido:
      'Política de Vacaciones de Café Montaña S.A.: Todo colaborador de Café Montaña S.A. tiene derecho a 15 días hábiles de vacaciones remuneradas por cada año trabajado, más 2 días adicionales durante la época de cosecha de café.',
  },
  {
    id: 202,
    empresa_id: 2,
    nombre: 'Reglamento_Teletrabajo_y_Viaticos_Cafe_Montana.docx',
    origen: 'carga',
    drive_file_id: null,
    drive_modificado: null,
    estado: 'indexado',
    contenido:
      'Reglamento de Teletrabajo y Reembolso de Gastos de Café Montaña S.A.: Se permiten 2 días de teletrabajo por semana (martes y jueves). El monto máximo de viáticos de alimentación en giras a fincas cafetaleras es de $35 USD diarios.',
  },
  // Empresa 3: Logística Pacífico (Datos de prueba Página 12 - aislados de Café Montaña)
  {
    id: 301,
    empresa_id: 3,
    nombre: 'Politica_Vacaciones_y_Bono_Portuario_Logistica_Pacifico.pdf',
    origen: 'carga',
    drive_file_id: null,
    drive_modificado: null,
    estado: 'indexado',
    contenido:
      'Política Exclusiva de Logística Pacífico: Los colaboradores de Logística Pacífico cuentan con 22 días hábiles de vacaciones anuales y un Bono de Operación Portuaria Nocturna en Caldera de $450 USD semestrales. El reembolso de viáticos internacionales es de $80 USD por día.',
  },
];

let documentosStore = [];
let fragmentosStore = [];
let mensajesStore = [];
let initialized = false;

export async function ensureTenantStoreInitialized() {
  if (initialized) return;
  initialized = true;

  for (const doc of DOCUMENTOS_INICIALES) {
    documentosStore.push({
      id: doc.id,
      empresa_id: doc.empresa_id,
      nombre: doc.nombre,
      origen: doc.origen,
      drive_file_id: doc.drive_file_id,
      drive_modificado: doc.drive_modificado,
      estado: doc.estado,
    });

    const partes = fragmentar(doc.contenido);
    const vectores = await embed(partes, 'document');
    partes.forEach((texto, idx) => {
      fragmentosStore.push({
        id: fragmentosStore.length + 1,
        empresa_id: doc.empresa_id,
        documento_id: doc.id,
        orden: idx,
        texto,
        embedding: vectores[idx],
      });
    });
  }
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / ((Math.sqrt(normA) || 1) * (Math.sqrt(normB) || 1));
}

export async function getTenantPlan(empresaId) {
  await ensureTenantStoreInitialized();
  const emp = EMPRESAS.find((e) => e.id === Number(empresaId)) || EMPRESAS[0];
  return PLANES[emp.plan_id] || PLANES.gratis;
}

export async function getTenantUsage(empresaId) {
  await ensureTenantStoreInitialized();
  const id = Number(empresaId);
  const usadas = mensajesStore.filter((m) => m.empresa_id === id).length;
  const documentos = documentosStore.filter((d) => d.empresa_id === id).length;
  return { usadas, documentos };
}

export async function listarDocumentosPorEmpresa(empresaId) {
  await ensureTenantStoreInitialized();
  // Aislamiento estricto WHERE empresa_id = $1
  return documentosStore.filter((d) => d.empresa_id === Number(empresaId));
}

export async function crearDocumentoStore(
  empresaId,
  nombre,
  origen = 'carga',
  driveFileId = null
) {
  await ensureTenantStoreInitialized();
  const nuevo = {
    id: Date.now(),
    empresa_id: Number(empresaId),
    nombre,
    origen,
    drive_file_id: driveFileId,
    drive_modificado: null,
    estado: 'pendiente',
  };
  documentosStore.unshift(nuevo);
  return nuevo;
}

export async function upsertDocumentoDriveStore(empresaId, file) {
  await ensureTenantStoreInitialized();
  const id = Number(empresaId);
  let existente = documentosStore.find(
    (d) => d.empresa_id === id && d.drive_file_id === file.id
  );
  if (!existente) {
    existente = await crearDocumentoStore(id, file.name, 'drive', file.id);
  } else {
    existente.nombre = file.name;
  }
  return existente;
}

export async function marcarDocumentoModificadoStore(
  empresaId,
  documentoId,
  modifiedTime
) {
  await ensureTenantStoreInitialized();
  const doc = documentosStore.find(
    (d) => d.id === Number(documentoId) && d.empresa_id === Number(empresaId)
  );
  if (doc) {
    doc.drive_modificado = new Date(modifiedTime);
    doc.estado = 'indexado';
  }
}

export async function guardarFragmentosStore(
  empresaId,
  documentoId,
  partes,
  vectores
) {
  await ensureTenantStoreInitialized();
  const empId = Number(empresaId);
  const docId = Number(documentoId);

  // DELETE FROM fragmentos WHERE documento_id = $1 AND empresa_id = $2
  fragmentosStore = fragmentosStore.filter(
    (f) => !(f.documento_id === docId && f.empresa_id === empId)
  );

  partes.forEach((texto, idx) => {
    fragmentosStore.push({
      id: Date.now() + idx,
      empresa_id: empId,
      documento_id: docId,
      orden: idx,
      texto,
      embedding: vectores[idx],
    });
  });

  const doc = documentosStore.find(
    (d) => d.id === docId && d.empresa_id === empId
  );
  if (doc) doc.estado = 'indexado';
}

export async function buscarFragmentosSimilaresPorEmpresa(
  empresaId,
  queryVector,
  limit = 6
) {
  await ensureTenantStoreInitialized();
  const empId = Number(empresaId);

  // Aislamiento estricto: WHERE f.empresa_id = $1
  const candidatos = fragmentosStore.filter((f) => f.empresa_id === empId);

  return candidatos
    .map((f) => {
      const doc = documentosStore.find(
        (d) => d.id === f.documento_id && d.empresa_id === empId
      );
      return {
        texto: f.texto,
        nombre: doc ? doc.nombre : 'Documento.pdf',
        score: cosineSimilarity(f.embedding, queryVector),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function registrarMensajeStore({
  empresaId,
  usuarioId,
  pregunta,
  respuesta,
  fuentes,
  tokensEntrada,
  tokensSalida,
}) {
  await ensureTenantStoreInitialized();
  const registro = {
    id: Date.now(),
    empresa_id: Number(empresaId),
    usuario_id: usuarioId,
    pregunta,
    respuesta,
    fuentes,
    tokens_entrada: tokensEntrada,
    tokens_salida: tokensSalida,
    creado_en: new Date().toISOString(),
  };
  mensajesStore.push(registro);
  return registro;
}

export async function obtenerEmpresasStore() {
  await ensureTenantStoreInitialized();
  return EMPRESAS;
}

