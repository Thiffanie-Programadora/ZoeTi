import React from 'react';
import Boton from './boton.jsx';
import { getWhatsAppUrl } from '../config/brand.js';

const STEPS = [
  {
    number: '01',
    title: 'Envía tu link',
    subtitle: 'Elige en tu tienda favorita',
    description:
      'Explora tus marcas preferidas de México, Colombia, Perú o Panamá y envíanos por WhatsApp el enlace del producto indicando talla, color y cantidad.',
    badge: 'Paso 1 • Rápido y sin registros',
  },
  {
    number: '02',
    title: 'Damos precio final con ganancia incluida',
    subtitle: 'Transparencia total desde el día uno',
    description:
      'Te entregamos una cotización cerrada que ya incluye el valor del artículo, transporte internacional, gestión aduanal y nuestra comisión de personal shopper.',
    badge: 'Paso 2 • Sin cobros sorpresa',
  },
  {
    number: '03',
    title: 'Recibe en casa',
    subtitle: 'Entrega segura en toda Costa Rica',
    description:
      'Realizamos la compra oficial, verificamos tu pedido en origen y lo llevamos directo hasta la puerta de tu hogar u oficina en cualquier provincia del país.',
    badge: 'Paso 3 • Seguimiento personalizado',
  },
];

/**
 * Sección explicativa de "Cómo Funciona" en 3 pasos sencillos.
 */
export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-20 bg-[#F7FCFA] border-b border-[#D1E8E2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-[#D1E8E2] text-xs font-semibold uppercase tracking-widest text-[#4A2040] mb-3">
            Experiencia Simple & Elegante
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A2040]">
            ¿Cómo funciona comprar con ZoeTi?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#4A2040]/80">
            Olvídate de trámites aduanales, tarjetas rechazadas en el extranjero
            o tarifas ocultas por peso. Nosotros nos encargamos de principio a
            fin en 3 pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white rounded-3xl p-8 border-2 border-[#D1E8E2] hover:border-[#4A2040] transition-all duration-300 shadow-zoeti flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D1E8E2] text-[#4A2040] font-serif text-2xl font-bold border border-[#4A2040]/20 group-hover:bg-[#4A2040] group-hover:text-[#F7FCFA] transition-colors">
                    {step.number}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E5F3EF] text-[#4A2040]">
                    {step.badge}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#68325B] mb-4">
                  {step.subtitle}
                </p>
                <p className="text-sm sm:text-base text-[#4A2040]/80 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D1E8E2] flex items-center justify-between text-xs font-semibold text-[#4A2040]">
                <span>ZoeTi Personal Shopper</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Boton
            href={getWhatsAppUrl(
              '¡Hola ZoeTi! Quiero enviar el link de un producto para que me brinden el precio final todo incluido.'
            )}
            target="_blank"
            variant="primary"
            size="lg"
          >
            <span>Enviar mi primer link por WhatsApp</span>
          </Boton>
        </div>
      </div>
    </section>
  );
}

