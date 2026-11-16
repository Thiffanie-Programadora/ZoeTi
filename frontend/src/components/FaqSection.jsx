import React, { useState } from 'react';
import Boton from './boton.jsx';
import { getWhatsAppUrl } from '../config/brand.js';

const FAQS = [
  {
    question:
      '¿El precio cotizado es realmente el precio final o debo pagar impuestos al recibir?',
    answer:
      'El precio que te brindamos por WhatsApp es 100% final y cerrado. Ya incluye el costo del producto, el envío local en el país de origen, flete internacional hacia Costa Rica, impuestos de nacionalización y nuestra comisión de Personal Shopper. No pagarás ni un colón adicional al recibir.',
  },
  {
    question: '¿Cuáles son los métodos de pago disponibles en Costa Rica?',
    answer:
      'Aceptamos pagos mediante SINPE Móvil, transferencia bancaria (BAC Credomatic / Banco Nacional) tanto en colones como en dólares, y link de pago seguro con tarjeta de crédito o débito.',
  },
  {
    question: '¿Cómo se realiza el pago para confirmar mi pedido?',
    answer:
      'Una vez que apruebas tu cotización por WhatsApp, realizas el pago para proceder de inmediato con la compra oficial de tus artículos antes de que se agote tu talla o promoción. Te enviamos el comprobante de compra y tu código de rastreo ZoeTi.',
  },
  {
    question: '¿Cuánto tardan en llegar los pedidos a Costa Rica?',
    answer:
      'Los tiempos promedio desde que la tienda entrega en nuestra dirección de origen son: Panamá (3 a 5 días hábiles), Colombia (4 a 7 días hábiles), México (5 a 8 días hábiles) y Perú (6 a 9 días hábiles).',
  },
  {
    question: '¿Hacen envíos fuera del GAM (a todas las provincias)?',
    answer:
      '¡Sí! Dentro del Gran Área Metropolitana (GAM) entregamos con mensajería privada directo en tu casa u oficina, y para el resto de las provincias de Costa Rica enviamos mediante Correos de Costa Rica EMS o encomienda certificada.',
  },
  {
    question: '¿Qué pasa si quiero comprar en varias tiendas del mismo país?',
    answer:
      'Podemos consolidar tus compras de distintas tiendas (por ejemplo, Zara, Sephora y Palacio de Hierro en México) en un solo paquete hacia Costa Rica para optimizar tu tarifa de importación.',
  },
];

/**
 * Sección de Preguntas Frecuentes (FAQ) enfocada en resolver objeciones de envíos y pagos.
 */
export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-[#F7FCFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-[#D1E8E2] text-xs font-semibold uppercase tracking-widest text-[#4A2040] mb-3">
            Transparencia & Confianza
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A2040]">
            Preguntas Frecuentes sobre Envíos y Pagos
          </h2>
          <p className="mt-3 text-base text-[#4A2040]/80">
            Resolvemos todas tus dudas para que compres en el extranjero con
            total tranquilidad.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="rounded-2xl bg-white border-2 border-[#D1E8E2] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#4A2040]">
                    {item.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ${
                      isOpen
                        ? 'bg-[#4A2040] text-[#F7FCFA]'
                        : 'bg-[#D1E8E2] text-[#4A2040]'
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#4A2040]/85 leading-relaxed border-t border-[#D1E8E2]/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Banner de Cierre hacia WhatsApp */}
        <div className="mt-14 rounded-3xl bg-[#D1E8E2] p-8 sm:p-10 border-2 border-[#4A2040]/20 text-center shadow-zoeti">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2040]">
            ¿Tienes un link listo para cotizar hoy?
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[#4A2040]/85 max-w-xl mx-auto">
            Escríbenos directamente a nuestro WhatsApp de atención en Costa Rica
            y recibe tu cotización personalizada en minutos.
          </p>
          <div className="mt-6">
            <Boton
              href={getWhatsAppUrl()}
              target="_blank"
              variant="primary"
              size="lg"
            >
              Hablar con tu Personal Shopper en WhatsApp
            </Boton>
          </div>
        </div>
      </div>
    </section>
  );
}

