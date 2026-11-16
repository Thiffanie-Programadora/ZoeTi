import React, { useState } from 'react';
import logoImg from '../assets/zoeti-logo.jpg';
import Boton from './boton.jsx';
import { getWhatsAppUrl } from '../config/brand.js';
import { createOrderRequestApi } from '../services/api.js';

/**
 * Hero Section principal con propuesta de valor, branding ZoeTi y generador directo de cotización.
 */
export default function Hero() {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    origin_country: 'Colombia',
    product_url: '',
    product_description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const savedOrder = await createOrderRequestApi(formData);
      setCreatedOrder(savedOrder);

      const whatsappMessage = `¡Hola ZoeTi! ✨ Acabo de registrar mi solicitud (${savedOrder.tracking_code}).
• Nombre: ${formData.client_name}
• País de origen: ${formData.origin_country} -> Costa Rica
• Producto: ${formData.product_description}
• Link: ${formData.product_url}
¿Me ayudas con el precio final todo incluido?`;

      window.open(getWhatsAppUrl(whatsappMessage), '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err.message || 'Ocurrió un error al enviar tu solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="inicio"
      className="relative overflow-hidden zoeti-gradient-hero py-14 sm:py-20 lg:py-24 border-b border-[#D1E8E2]"
    >
      {/* Elementos decorativos suaves */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#D1E8E2]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-[#D1E8E2]/50 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Columna Izquierda: Propuesta de Valor y CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#D1E8E2] border border-[#4A2040]/20 text-xs sm:text-sm font-medium text-[#4A2040]">
              <span>✈️ Importaciones Exclusivas</span>
              <span className="text-[#4A2040]/40">•</span>
              <span>🇲🇽 🇨🇴 🇵🇪 🇵🇦 hacia Costa Rica 🇨🇷</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4A2040] leading-[1.08] tracking-tight">
              Tus marcas favoritas de Latinoamérica,{' '}
              <span className="italic font-normal text-[#68325B]">
                directo a tus manos en Costa Rica.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#4A2040]/85 max-w-2xl leading-relaxed">
              En <strong className="font-semibold">ZoeTi personal shopper</strong>{' '}
              compramos por ti en las mejores tiendas de{' '}
              <strong className="font-semibold">
                México, Colombia, Perú y Panamá
              </strong>
              . Sin casilleros complicados ni cargos sorpresa: te damos un{' '}
              <span className="underline decoration-[#4A2040]/40 underline-offset-4 font-medium">
                precio único final todo incluido
              </span>{' '}
              hasta la puerta de tu casa.
            </p>

            {/* Botones de Acción Principal */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Boton
                href={getWhatsAppUrl()}
                target="_blank"
                variant="primary"
                size="lg"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.82 11.82 0 0012.04 0C5.5 0 .17 5.33.17 11.87c0 2.09.55 4.14 1.59 5.95L0 24l6.35-1.66a11.84 11.84 0 005.69 1.45h.01c6.54 0 11.87-5.33 11.87-11.87 0-3.17-1.24-6.15-3.4-8.44zM12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.85 9.85 0 01-1.51-5.27c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
                </svg>
                <span>Cotizar por WhatsApp</span>
              </Boton>

              <Boton
                onClick={() => {
                  const el = document.getElementById('como-funciona');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline"
                size="lg"
              >
                <span>Ver Cómo Funciona</span>
              </Boton>
            </div>

            {/* Indicadores de Confianza */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#4A2040]/15 max-w-xl">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040]">
                  100%
                </p>
                <p className="text-xs sm:text-sm text-[#4A2040]/75">
                  Precio cerrado sin costos ocultos
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040]">
                  4 Rutas
                </p>
                <p className="text-xs sm:text-sm text-[#4A2040]/75">
                  MX • CO • PE • PA → CR
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040]">
                  Puerta a Puerta
                </p>
                <p className="text-xs sm:text-sm text-[#4A2040]/75">
                  Entrega en GAM y todo el país
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Cotización Rápida + Sello Oficial */}
          <div className="lg:col-span-5">
            <div className="bg-[#F7FCFA] rounded-3xl p-6 sm:p-8 border-2 border-[#D1E8E2] shadow-zoeti-lg relative">
              {/* Medallón de Logotipo Oficial */}
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#D1E8E2]">
                <img
                  src={logoImg}
                  alt="Sello Oficial ZoeTi"
                  className="w-16 h-16 rounded-full object-cover zoeti-metallic-ring flex-shrink-0"
                />
                <div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#68325B]">
                    Atención Personalizada
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#4A2040]">
                    Solicita tu Cotización
                  </h2>
                  <p className="text-xs text-[#4A2040]/75">
                    Pega el link de tu prenda o artículo y recibe el monto total en colones o dólares.
                  </p>
                </div>
              </div>

              {createdOrder && (
                <div className="mb-4 p-3.5 rounded-2xl bg-[#D1E8E2]/80 border border-[#4A2040]/20 text-xs text-[#4A2040]">
                  <p className="font-semibold">
                    ✅ Solicitud guardada con código:{' '}
                    <span className="font-mono underline">
                      {createdOrder.tracking_code}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[#4A2040]/80">
                    Puedes consultar su avance en la sección de rastreo o continuar por WhatsApp.
                  </p>
                </div>
              )}

              <form onSubmit={handleQuickQuoteSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                      Tu Nombre *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      required
                      placeholder="Ej. Sofía Castro"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                      WhatsApp (Costa Rica) *
                    </label>
                    <input
                      type="tel"
                      name="client_phone"
                      required
                      placeholder="+506 8888-8888"
                      value={formData.client_phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                    País de Origen de la Tienda *
                  </label>
                  <select
                    name="origin_country"
                    value={formData.origin_country}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                  >
                    <option value="Colombia">🇨🇴 Colombia → Costa Rica</option>
                    <option value="México">🇲🇽 México → Costa Rica</option>
                    <option value="Perú">🇵🇪 Perú → Costa Rica</option>
                    <option value="Panamá">🇵🇦 Panamá → Costa Rica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                    Enlace (Link) del Producto *
                  </label>
                  <input
                    type="url"
                    name="product_url"
                    required
                    placeholder="https://tienda.com/producto..."
                    value={formData.product_url}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                    Talla, Color y Detalles *
                  </label>
                  <textarea
                    name="product_description"
                    rows={2}
                    required
                    placeholder="Ej. Talla M, color verde menta, 1 unidad"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
                  />
                </div>

                <Boton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="w-full mt-2"
                >
                  {submitting
                    ? 'Registrando cotización...'
                    : 'Enviar Link y Cotizar por WhatsApp →'}
                </Boton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

