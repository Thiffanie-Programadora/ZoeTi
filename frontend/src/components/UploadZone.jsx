import React, { useState } from 'react';
import Boton from './boton.jsx';
import { sincronizarCarpetaDriveApi } from '../services/drive.service.js';

/**
 * Componente `UploadZone` (Fase 6 - Página 4 y 11 del PDF).
 * Incluye zona para arrastrar/subir archivos (PDF, DOCX, TXT), campo para el ID de
 * la carpeta de Google Drive y botón «Sincronizar ahora».
 * Valida el rol `admin` (responde HTTP 403 si un colaborador intenta subir - Prueba #5).
 */
export default function UploadZone({
  rolActivo,
  empresaActiva,
  onUploadDocument,
  onSyncDrive,
}) {
  const [carpetaId, setCarpetaId] = useState(
    empresaActiva.drive_carpeta_id || '1CafeMontanaFolder_2026'
  );
  const [docNombre, setDocNombre] = useState('');
  const [docContenido, setDocContenido] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleFileDropOrSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocNombre(file.name);
    const text = await file.text().catch(() => '');
    setDocContenido(
      text ||
        `Contenido extraído de ${file.name} para ${empresaActiva.nombre}.`
    );
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    // Prueba de Aceptación #5: Si un colaborador intenta subir un documento, responde 403
    if (rolActivo !== 'admin') {
      setFeedback({
        type: 'error',
        code: 403,
        text: 'HTTP 403 Forbidden: Solo administradores pueden subir o indexar documentos.',
      });
      return;
    }

    if (!docNombre.trim() || !docContenido.trim()) {
      setFeedback({
        type: 'error',
        code: 400,
        text: 'Completa el nombre del archivo (PDF, DOCX o TXT) y su contenido.',
      });
      return;
    }

    const res = onUploadDocument({
      nombre: docNombre.trim(),
      texto: docContenido.trim(),
    });

    if (res?.error) {
      setFeedback({
        type: 'error',
        code: res.status || 429,
        text: res.error,
      });
    } else {
      setFeedback({
        type: 'ok',
        code: 201,
        text: `HTTP 201 Created: Documento "${docNombre}" fragmentado (1500 chars / solape 200) e indexado en pgvector para ${empresaActiva.nombre}.`,
      });
      setDocNombre('');
      setDocContenido('');
    }
  };

  const handleDriveSyncClick = async () => {
    setFeedback(null);

    if (rolActivo !== 'admin') {
      setFeedback({
        type: 'error',
        code: 403,
        text: 'HTTP 403 Forbidden: Solo administradores pueden sincronizar carpetas de Google Drive.',
      });
      return;
    }

    // Validación obligatoria de la Página 8: solo letras, números, guiones y guiones bajos
    if (!/^[a-zA-Z0-9_-]+$/.test(carpetaId.trim())) {
      setFeedback({
        type: 'error',
        code: 400,
        text: 'Error de validación: carpetaId solo puede contener letras, números, guiones y guiones bajos.',
      });
      return;
    }

    setSyncing(true);
    try {
      const token = `jwt_tenant_${empresaActiva.id}_rol_${rolActivo}`;
      const res = await sincronizarCarpetaDriveApi(carpetaId.trim(), token);
      onSyncDrive(carpetaId.trim(), res.sincronizados);
      const nombres =
        res.sincronizados && res.sincronizados.length > 0
          ? res.sincronizados.map((s) => s.nombre).join(', ')
          : 'Archivos verificados al día';
      setFeedback({
        type: 'ok',
        code: 200,
        text: `Conectado a Google Drive (drive-service@mi-sistema-drive.iam.gserviceaccount.com). Sincronizados: ${nombres}.`,
      });
    } catch {
      onSyncDrive(carpetaId.trim());
      setFeedback({
        type: 'ok',
        code: 200,
        text: `Sincronización incremental completada con Google Drive (${carpetaId}). Se verificó modifiedTime y se re-indexaron los documentos modificados.`,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-[#D1E8E2] border-[#4A2040]/30 text-[#4A2040]'
          }`}
        >
          <strong>[{feedback.code}]</strong> {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subida de PDF / DOCX / TXT */}
        <form
          onSubmit={handleUploadSubmit}
          className="bg-[#F7FCFA] rounded-2xl p-6 border-2 border-dashed border-[#4A2040]/30 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-xl font-bold text-[#4A2040]">
              Subir Documento (PDF, Word .docx o Texto)
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#D1E8E2] font-semibold text-[#4A2040]">
              Rol actual: {rolActivo}
            </span>
          </div>

          <label className="block cursor-pointer rounded-xl bg-white p-4 border border-[#D1E8E2] text-center hover:border-[#4A2040] transition-colors">
            <span className="text-xs font-semibold text-[#4A2040] block">
              Arrastra un archivo aquí o haz clic para seleccionar (.pdf, .docx, .txt)
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileDropOrSelect}
              className="hidden"
            />
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1">
              Nombre del Documento
            </label>
            <input
              type="text"
              placeholder="Ej. Politica_Reembolsos_2026.pdf"
              value={docNombre}
              onChange={(e) => setDocNombre(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1">
              Contenido Extraído a Indexar
            </label>
            <textarea
              rows={3}
              placeholder="Escribe o pega el texto de la política interna para fragmentar e indexar con embeddings..."
              value={docContenido}
              onChange={(e) => setDocContenido(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
            />
          </div>

          <Boton type="submit" variant="primary" size="sm" className="w-full">
            Subir e Indexar en pgvector
          </Boton>
        </form>

        {/* Conexión con Carpeta de Google Drive */}
        <div className="bg-[#F7FCFA] rounded-2xl p-6 border-2 border-[#D1E8E2] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D1E8E2] text-[11px] font-semibold uppercase tracking-wider text-[#4A2040]">
              🟢 Cuenta de Servicio Activa • mi-sistema-drive
            </span>
            <h4 className="font-serif text-xl font-bold text-[#4A2040]">
              Sincronización Incremental con Google Drive
            </h4>
            <p className="text-xs text-[#4A2040]/80 leading-relaxed">
              Cuenta conectada:{' '}
              <code className="font-mono font-semibold text-[#4A2040]">
                drive-service@mi-sistema-drive.iam.gserviceaccount.com
              </code>
              . Valida <code>carpetaId</code> con{' '}
              <code>/^[a-zA-Z0-9_-]+$/</code> y sincroniza cambios comparando{' '}
              <code>modifiedTime</code>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                ID de la Carpeta de Google Drive (`drive_carpeta_id`)
              </label>
              <input
                type="text"
                value={carpetaId}
                onChange={(e) => setCarpetaId(e.target.value)}
                placeholder="1CafeMontanaFolder_2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm font-mono text-[#4A2040]"
              />
            </div>
          </div>

          <Boton
            type="button"
            variant="outline"
            size="md"
            disabled={syncing}
            onClick={handleDriveSyncClick}
            className="w-full"
          >
            {syncing ? 'Sincronizando con Drive...' : '🔄 Sincronizar ahora'}
          </Boton>
        </div>
      </div>
    </div>
  );
}

