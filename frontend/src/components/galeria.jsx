import React, { useState } from 'react';
import Boton from './boton.jsx';
import { IMPORT_ROUTES, getWhatsAppUrl } from '../config/brand.js';
import { trackOrderByCodeApi } from '../services/api.js';

/**
 * Galería de Rutas de Importación (México, Colombia, Perú, Panamá -> Costa Rica)
 * y módulo interactivo de rastreo de pedidos para clientes.
 */
export default function GaleriaRutas() {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [loadingTrack, setLoadingTrack] = useState(false);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    setLoadingTrack(true);
    setTrackError('');
    setTrackedOrder(null);
    try {
      const order = await trackOrderByCodeApi(trackingInput);
      setTrackedOrder(order);
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setLoadingTrack(false);
    }
  };

  const statusSteps = [
    'Recibido',
    'Comprado',
    'En tránsito',
    'Listo para entrega',
  ];

  return (
    <>
      {/* SECCIÓN DE PAÍSES DE ORIGEN Y RUTAS DE IMPORTACIÓN */}
      <section
        id="rutas"
        className="py-20 bg-[#D1E8E2]/45 border-b border-[#D1E8E2]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-[#D1E8E2] text-xs font-semibold uppercase tracking-widest text-[#4A2040] mb-3">
              Rutas Activas de Importación
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A2040]">
              De México, Colombia, Perú y Panamá hacia Costa Rica
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#4A2040]/80">
              Conectamos las capitales de la moda, el diseño y el comercio
              latinoamericano con entregas directas en todo el territorio
              costarricense.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {IMPORT_ROUTES.map((route) => (
              <article
                key={route.id}
                className="bg-[#F7FCFA] rounded-3xl p-7 sm:p-8 border-2 border-[#D1E8E2] hover:border-[#4A2040] transition-all duration-300 shadow-zoeti flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-5 mb-5 border-b border-[#D1E8E2]">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040] leading-tight">
                        {route.country}{' '}
                        <span className="text-[#68325B] font-normal">→</span>{' '}
                        {route.destination}
                      </h3>
                      <p className="text-xs font-medium text-[#68325B]">
                        {route.frequency}
                      </p>
                    </div>

                    <span className="px-3.5 py-1 rounded-full bg-[#4A2040] text-[#F7FCFA] text-xs font-semibold">
                      {route.badge}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#4A2040]/85 mb-5 leading-relaxed">
                    {route.highlight}
                  </p>

                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4A2040]/70 mb-2.5">
                      Tiendas y marcas frecuentes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {route.popularStores.map((store) => (
                        <span
                          key={store}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-[#D1E8E2]/80 text-[#4A2040] border border-[#4A2040]/10"
                        >
                          {store}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D1E8E2] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-[#4A2040]/70">
                      Tiempo estimado de llegada:
                    </span>
                    <span className="text-sm font-bold text-[#4A2040]">
                      ⏱️ {route.transitTime}
                    </span>
                  </div>

                  <Boton
                    href={getWhatsAppUrl(
                      `¡Hola ZoeTi! Quiero cotizar un producto desde ${route.country} hacia Costa Rica. Mi link es:`
                    )}
                    target="_blank"
                    variant="outline"
                    size="sm"
                  >
                    Cotizar ruta {route.country}
                  </Boton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE RASTREO DE PEDIDOS EN TIEMPO REAL */}
      <section
        id="rastreo"
        className="py-16 bg-[#F7FCFA] border-b border-[#D1E8E2]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#D1E8E2] shadow-zoeti">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#D1E8E2] text-xs font-semibold uppercase tracking-widest text-[#4A2040] mb-2">
                Seguimiento en Línea
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2040]">
                Consulta el Estado de tu Pedido
              </h2>
              <p className="mt-2 text-sm text-[#4A2040]/75">
                Ingresa tu código de seguimiento ZoeTi (por ejemplo:{' '}
                <button
                  type="button"
                  onClick={() => setTrackingInput('ZT-2026-101')}
                  className="font-mono font-semibold underline text-[#4A2040]"
                >
                  ZT-2026-101
                </button>{' '}
                o{' '}
                <button
                  type="button"
                  onClick={() => setTrackingInput('ZT-2026-103')}
                  className="font-mono font-semibold underline text-[#4A2040]"
                >
                  ZT-2026-103
                </button>
                ) para verificar su etapa actual.
              </p>
            </div>

            <form
              onSubmit={handleTrackSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Ej. ZT-2026-101"
                className="flex-1 px-4 py-3 rounded-full bg-[#F7FCFA] border-2 border-[#D1E8E2] text-sm font-mono uppercase text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
              />
              <Boton type="submit" variant="primary" disabled={loadingTrack}>
                {loadingTrack ? 'Buscando...' : 'Consultar Estado'}
              </Boton>
            </form>

            {trackError && (
              <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-center text-xs sm:text-sm text-red-800">
                {trackError}
              </div>
            )}

            {trackedOrder && (
              <div className="mt-8 p-6 rounded-2xl bg-[#F7FCFA] border border-[#D1E8E2] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D1E8E2] pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#68325B] font-semibold">
                      Código: {trackedOrder.tracking_code}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#4A2040]">
                      Cliente: {trackedOrder.client_name}
                    </h3>
                    <p className="text-xs text-[#4A2040]/75">
                      Ruta: {trackedOrder.origin_country} →{' '}
                      {trackedOrder.destination_country}
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#4A2040] text-[#F7FCFA] text-xs font-semibold">
                    Estado actual: {trackedOrder.status}
                  </span>
                </div>

                <p className="text-sm text-[#4A2040]/85">
                  <strong>Detalle del pedido:</strong>{' '}
                  {trackedOrder.product_description}
                </p>

                {/* Barra de progreso de los 4 estados principales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {statusSteps.map((stepName, index) => {
                    const currentIdx = statusSteps.indexOf(trackedOrder.status);
                    const isCompleted =
                      currentIdx >= index ||
                      trackedOrder.status === 'Entregado';
                    return (
                      <div
                        key={stepName}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                          isCompleted
                            ? 'bg-[#D1E8E2] border-[#4A2040] text-[#4A2040]'
                            : 'bg-white border-[#D1E8E2] text-[#4A2040]/45'
                        }`}
                      >
                        <span className="block font-serif text-base font-bold">
                          0{index + 1}
                        </span>
                        {stepName}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

