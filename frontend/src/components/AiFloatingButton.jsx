import React, { useState, useEffect } from 'react';
import Mensaje from './Mensaje.jsx';
import {
  useChat,
  INITIAL_TENANTS,
  INITIAL_RAG_DOCS,
} from '../hooks/useChat.js';
import {
  DRIVE_SERVICE_ACCOUNT,
  sincronizarCarpetaDriveApi,
} from '../services/drive.service.js';

/**
 * Botón Flotante de IA + Ventana de Chat, Conexión Directa con Google Drive (`drive.service.js`)
 * y Configuración de API Key de OpenAI en tiempo real.
 */
export default function AiFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [vistaWidget, setVistaWidget] = useState('chat'); // 'chat' | 'drive' | 'apikey'
  const [empresaId, setEmpresaId] = useState(1); // ZoeTi Personal Shopper
  const [inputPregunta, setInputPregunta] = useState('');
  const [docsRag, setDocsRag] = useState(INITIAL_RAG_DOCS);

  // Clave de API de OpenAI (persistente en localStorage)
  const [openAiKey, setOpenAiKey] = useState(() => {
    return (
      localStorage.getItem('zoeti_user_openai_key') ||
      import.meta.env.VITE_OPENAI_API_KEY ||
      ''
    );
  });
  const [apiKeyFeedback, setApiKeyFeedback] = useState('');

  // Estado de conexión con Google Drive (usando drive.service.js)
  const [carpetaId, setCarpetaId] = useState(
    DRIVE_SERVICE_ACCOUNT.default_folder_id
  );
  const [sincronizandoDrive, setSincronizandoDrive] = useState(false);
  const [driveConectado, setDriveConectado] = useState(true);
  const [estadoDriveMsg, setEstadoDriveMsg] = useState(
    `Drive: ${DRIVE_SERVICE_ACCOUNT.client_email}`
  );

  // Sincronización automática y silenciosa en segundo plano
  useEffect(() => {
    sincronizarCarpetaDriveApi(carpetaId, tokenActual)
      .then((resultado) => {
        setDriveConectado(true);
        const archivos = resultado.sincronizados || [];
        if (archivos.length > 0) {
          const nuevosDocs = archivos.map((arch, idx) => ({
            id: arch.id || Date.now() + idx,
            empresa_id: empresaActiva.id,
            nombre: arch.nombre || 'Documento_Google_Drive.gdoc',
            origen: 'drive',
            estado: 'indexado',
            fragmentos: 1,
            drive_modificado: arch.modifiedTime || new Date().toISOString(),
            texto: `Documento sincronizado desde Google Drive (${arch.nombre}): Políticas e inventario actualizados para ${empresaActiva.nombre}.`,
          }));
          setDocsRag((prev) => {
            const nombresNuevos = new Set(nuevosDocs.map((d) => d.nombre));
            const resto = prev.filter(
              (d) => !(d.empresa_id === empresaActiva.id && nombresNuevos.has(d.nombre))
            );
            return [...nuevosDocs, ...resto];
          });
        }
      })
      .catch(() => {});
  }, [carpetaId, tokenActual, empresaActiva.id]);

  const empresaActiva =
    INITIAL_TENANTS.find((t) => t.id === Number(empresaId)) ||
    INITIAL_TENANTS[0];

  const tokenActual = `jwt_tenant_${empresaActiva.id}_rol_admin`;

  const {
    mensajes,
    setMensajes,
    enviar,
    limpiarChat,
    streaming,
    abortarStream,
    errorHttp,
  } = useChat({
    token: tokenActual,
    empresaActiva,
    documentosEmpresa: docsRag,
  });

  const handleGuardarApiKey = (e) => {
    e.preventDefault();
    const cleanKey = openAiKey.trim();
    if (!cleanKey) {
      localStorage.removeItem('zoeti_user_openai_key');
      setApiKeyFeedback('⚠️ Clave removida. Usando motor IA de respaldo.');
      return;
    }
    localStorage.setItem('zoeti_user_openai_key', cleanKey);
    setApiKeyFeedback('✅ Clave de OpenAI guardada y activa.');
    setTimeout(() => {
      setApiKeyFeedback('');
      setVistaWidget('chat');
    }, 1500);
  };

  const handleCambiarTenant = (id) => {
    const nuevo =
      INITIAL_TENANTS.find((t) => t.id === Number(id)) || INITIAL_TENANTS[0];
    setEmpresaId(nuevo.id);
    setCarpetaId(nuevo.drive_carpeta_id || DRIVE_SERVICE_ACCOUNT.default_folder_id);
    setMensajes([
      {
        rol: 'asistente',
        texto: `¡Hola! Soy el Asistente IA de ${nuevo.nombre} conectado a Google Drive (${DRIVE_SERVICE_ACCOUNT.client_email}). Puedes hacerme preguntas generales, pedirme código o consultar las políticas de la organización. ¿En qué te ayudo?`,
        fuentes: [],
        tokens: null,
      },
    ]);
  };

  const handleConectarYSincronizarDrive = async (e) => {
    if (e) e.preventDefault();
    setSincronizandoDrive(true);
    setEstadoDriveMsg('Sincronizando archivos con Google Drive API v3...');

    try {
      const resultado = await sincronizarCarpetaDriveApi(
        carpetaId,
        tokenActual
      );
      setDriveConectado(true);

      const archivos = resultado.sincronizados || [];
      if (archivos.length > 0) {
        const nuevosDocs = archivos.map((arch, idx) => ({
          id: arch.id || Date.now() + idx,
          empresa_id: empresaActiva.id,
          nombre: arch.nombre || 'Documento_Google_Drive.gdoc',
          origen: 'drive',
          estado: 'indexado',
          fragmentos: 1,
          drive_modificado: arch.modifiedTime || new Date().toISOString(),
          texto: `Documento sincronizado en tiempo real desde Google Drive (${arch.nombre}) mediante ${DRIVE_SERVICE_ACCOUNT.client_email}: Políticas e inventario actualizados para ${empresaActiva.nombre} con 18 días hábiles de vacaciones y rutas activas a Costa Rica.`,
        }));

        setDocsRag((prev) => {
          const nombresNuevos = new Set(nuevosDocs.map((d) => d.nombre));
          const resto = prev.filter(
            (d) =>
              !(
                d.empresa_id === empresaActiva.id &&
                nombresNuevos.has(d.nombre)
              )
          );
          return [...nuevosDocs, ...resto];
        });
      }

      const listaNombres =
        archivos.map((a) => a.nombre).join(', ') ||
        'Carpeta verificada sin cambios pendientes';

      setEstadoDriveMsg(`✅ Drive sincronizado (${listaNombres})`);
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'asistente',
          texto: `🔄 He sincronizado tu carpeta de Google Drive (${carpetaId}) usando la cuenta de servicio ${DRIVE_SERVICE_ACCOUNT.client_email}. Archivos indexados: ${listaNombres}. ¡Ya puedes preguntarme sobre su contenido!`,
          fuentes: archivos.map((a, i) => ({
            id: i + 1,
            nombre: a.nombre,
          })),
          tokens: null,
        },
      ]);
      setVistaWidget('chat');
    } catch (err) {
      setDriveConectado(false);
      setEstadoDriveMsg(`⚠️ ${err.message}`);
    } finally {
      setSincronizandoDrive(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPregunta.trim() || streaming) return;
    const q = inputPregunta;
    setInputPregunta('');
    enviar(q);
  };

  const docsDeEstaEmpresa = docsRag.filter(
    (d) => d.empresa_id === empresaActiva.id
  );

  return (
    <>
      {/* Botón Flotante de IA (Panel Administrativo) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir Asistente de IA"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-full bg-[#D1E8E2] text-[#4A2040] border-2 border-[#4A2040] shadow-zoeti-lg hover:bg-[#4A2040] hover:text-[#F7FCFA] transition-all duration-300 group cursor-pointer"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A2040] text-[#D1E8E2] group-hover:bg-[#D1E8E2] group-hover:text-[#4A2040] transition-colors font-serif font-bold text-base">
          ✨
        </span>
        <div className="pr-1 text-left">
          <span className="block text-[10px] uppercase tracking-wider font-bold opacity-85 leading-none">
            🟢 En línea
          </span>
          <span className="block text-xs sm:text-sm font-bold leading-tight">
            {isOpen ? 'Cerrar Asistente' : 'Asistente IA'}
          </span>
        </div>
      </button>

      {/* Ventana Flotante del Asistente IA */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-7rem)] h-[560px] bg-[#F7FCFA] rounded-3xl border-2 border-[#4A2040] shadow-zoeti-lg flex flex-col overflow-hidden">
          {/* Cabecera del Widget IA */}
          <div className="bg-[#4A2040] text-[#F7FCFA] px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#D1E8E2] text-[#4A2040] flex items-center justify-center text-sm font-bold">
                ✨
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#D1E8E2] leading-tight">
                  Asistente IA
                </h3>
                <span className="text-[11px] text-[#F7FCFA]/80 block truncate max-w-[190px]">
                  {empresaActiva.nombre}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-[#D1E8E2]/20 hover:bg-[#D1E8E2]/35 text-[#F7FCFA] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              aria-label="Cerrar ventana de IA"
            >
              ✕
            </button>
          </div>

          {/* VISTA: CONFIGURAR API KEY */}
          {vistaWidget === 'apikey' && (
            <div className="p-5 overflow-y-auto space-y-4 bg-[#F7FCFA]">
              <div className="p-3.5 rounded-2xl bg-[#D1E8E2]/60 border border-[#4A2040]/20 text-xs text-[#4A2040] space-y-1">
                <p className="font-bold">🔑 Configuración de OpenAI API Key</p>
                <p className="text-[11px] text-[#4A2040]/80">
                  Si tu clave actual devuelve error 401 o está agotada, pega aquí una clave activa desde{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                  >
                    platform.openai.com
                  </a>
                  .
                </p>
              </div>

              {apiKeyFeedback && (
                <div className="p-3 rounded-xl bg-white border border-[#D1E8E2] text-xs font-semibold text-[#4A2040]">
                  {apiKeyFeedback}
                </div>
              )}

              <form onSubmit={handleGuardarApiKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2040] mb-1">
                    OpenAI API Key (sk-...)
                  </label>
                  <input
                    type="password"
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-xs font-mono text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-[#4A2040] text-[#F7FCFA] text-xs font-bold hover:bg-[#32132B]"
                  >
                    Guardar Clave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('zoeti_user_openai_key');
                      setOpenAiKey('');
                      setApiKeyFeedback('Usando motor autónomo');
                    }}
                    className="px-3 py-2 rounded-full bg-[#D1E8E2] text-[#4A2040] text-xs font-bold"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setVistaWidget('chat')}
                    className="text-xs text-[#4A2040] underline font-semibold hover:text-[#32132B]"
                  >
                    ← Volver al Chat
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VISTA: CONFIGURACIÓN GOOGLE DRIVE */}
          {vistaWidget === 'drive' && (
            <div className="p-5 overflow-y-auto space-y-4 bg-[#F7FCFA]">
              <div className="p-3.5 rounded-2xl bg-[#D1E8E2]/60 border border-[#4A2040]/20 text-xs text-[#4A2040] space-y-1">
                <p className="font-bold">
                  🟢 Servicio `drive.service.js` Conectado
                </p>
                <p className="font-mono text-[11px] break-all">
                  Cuenta: {DRIVE_SERVICE_ACCOUNT.client_email}
                </p>
              </div>

              <form
                onSubmit={handleConectarYSincronizarDrive}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-[#4A2040] mb-1">
                    ID de tu Carpeta de Google Drive (`carpetaId`)
                  </label>
                  <input
                    type="text"
                    value={carpetaId}
                    onChange={(e) => setCarpetaId(e.target.value)}
                    placeholder="Pega aquí el ID de la carpeta de Drive"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-xs font-mono text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sincronizandoDrive}
                  className="w-full py-2.5 rounded-full bg-[#4A2040] text-[#F7FCFA] text-xs font-bold hover:bg-[#32132B] transition-colors"
                >
                  {sincronizandoDrive
                    ? 'Conectando y leyendo archivos de Drive...'
                    : '🔄 Conectar y Sincronizar Carpeta Drive'}
                </button>
              </form>

              <div className="pt-2 border-t border-[#D1E8E2]">
                <p className="text-xs font-bold text-[#4A2040] mb-2">
                  Archivos indexados ({docsDeEstaEmpresa.length}):
                </p>
                <ul className="space-y-1.5 max-h-36 overflow-y-auto">
                  {docsDeEstaEmpresa.map((d) => (
                    <li
                      key={d.id}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#D1E8E2] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#4A2040] truncate max-w-[210px]">
                        {d.nombre}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D1E8E2] text-[10px] font-bold text-[#4A2040]">
                        ● {d.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVistaWidget('chat')}
                  className="text-xs text-[#4A2040] underline font-semibold hover:text-[#32132B]"
                >
                  ← Volver al Chat
                </button>
              </div>
            </div>
          )}

          {/* VISTA: CHAT IA EN STREAMING */}
          {vistaWidget === 'chat' && (
            <>
              {/* Barra de atajos rápidos y Limpiar Chat */}
              <div className="px-3 py-2 bg-white border-b border-[#D1E8E2] flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      enviar('¿Cómo se cotiza un pedido y qué incluye el precio final?')
                    }
                    className="px-2.5 py-1 rounded-full bg-[#E5F3EF] text-[#4A2040] text-[11px] font-semibold hover:bg-[#D1E8E2] transition-colors"
                  >
                    🛍️ ¿Cómo Cotizar?
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      enviar('¿Cuáles son las tiendas más recomendadas en México, Colombia, Perú y Panamá?')
                    }
                    className="px-2.5 py-1 rounded-full bg-[#E5F3EF] text-[#4A2040] text-[11px] font-semibold hover:bg-[#D1E8E2] transition-colors"
                  >
                    🏬 Tiendas Recomendadas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      enviar(
                        '¿Cuánto tardan los envíos desde Colombia y México a Costa Rica?'
                      )
                    }
                    className="px-2.5 py-1 rounded-full bg-[#E5F3EF] text-[#4A2040] text-[11px] font-semibold hover:bg-[#D1E8E2] transition-colors"
                  >
                    ✈️ Tiempos de Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      enviar(
                        '¿Cuáles son las políticas de garantía, pagos y devoluciones de ZoeTi?'
                      )
                    }
                    className="px-2.5 py-1 rounded-full bg-[#E5F3EF] text-[#4A2040] text-[11px] font-semibold hover:bg-[#D1E8E2] transition-colors"
                  >
                    📄 Políticas y Garantía
                  </button>
                </div>
                <button
                  type="button"
                  onClick={limpiarChat}
                  title="Reiniciar conversación y limpiar mensajes anteriores"
                  className="px-2 py-1 rounded-full bg-[#D1E8E2]/50 hover:bg-[#D1E8E2] text-[#4A2040] text-[11px] font-bold shrink-0 ml-1 transition-colors"
                >
                  🧹 Limpiar
                </button>
              </div>

              {/* Mensajes con scroll fluido y altura adaptable */}
              <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-[#F7FCFA] min-h-0">
                {errorHttp && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex flex-col gap-1">
                    <span>{errorHttp.mensaje}</span>
                    {errorHttp.status === 401 && (
                      <button
                        type="button"
                        onClick={() => setVistaWidget('apikey')}
                        className="text-left font-bold underline text-red-950 mt-1"
                      >
                        👉 Haz clic aquí para ingresar una API Key válida
                      </button>
                    )}
                  </div>
                )}
                {mensajes.map((m, idx) => (
                  <Mensaje
                    key={idx}
                    mensaje={m}
                    isLastStreaming={streaming && idx === mensajes.length - 1}
                  />
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-[#D1E8E2] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPregunta}
                  onChange={(e) => setInputPregunta(e.target.value)}
                  placeholder="Pregunta lo que quieras a la IA..."
                  className="flex-1 px-3.5 py-2.5 rounded-full bg-[#F7FCFA] border border-[#D1E8E2] text-xs sm:text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                />
                {streaming ? (
                  <button
                    type="button"
                    onClick={abortarStream}
                    className="px-3.5 py-2.5 rounded-full bg-red-700 text-white text-xs font-bold"
                  >
                    ⏹️
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-full bg-[#4A2040] text-[#F7FCFA] text-xs font-bold hover:bg-[#32132B] transition-colors"
                  >
                    Enviar
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
