import React from 'react';
import logoImg from '../assets/zoeti-logo.jpg';
import { ZOETI_BRAND, getWhatsAppUrl } from '../config/brand.js';

/**
 * Pie de página corporativo de ZoeTi Personal Shopper.
 */
export default function Footer({ onNavigateView }) {
  return (
    <footer className="bg-[#4A2040] text-[#F7FCFA] border-t-4 border-[#D1E8E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Columna 1: Identidad de Marca */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={logoImg}
                alt="ZoeTi Personal Shopper"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D1E8E2]"
              />
              <div>
                <span className="block font-serif text-3xl font-bold text-[#D1E8E2] leading-none">
                  {ZOETI_BRAND.name}
                </span>
                <span className="block font-serif italic text-sm text-[#D1E8E2]/85">
                  {ZOETI_BRAND.tagline}
                </span>
              </div>
            </div>
            <p className="text-sm text-[#F7FCFA]/80 max-w-md leading-relaxed">
              Servicio especializado de Personal Shopper e importaciones
              internacionales desde México, Colombia, Perú y Panamá hacia toda
              Costa Rica. Transparencia, elegancia y entregas puerta a puerta.
            </p>
          </div>

          {/* Columna 2: Rutas de Importación */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#D1E8E2] mb-3">
              Rutas Oficiales
            </h3>
            <ul className="space-y-2 text-sm text-[#F7FCFA]/85">
              <li>México → Costa Rica</li>
              <li>Colombia → Costa Rica</li>
              <li>Perú → Costa Rica</li>
              <li>Panamá → Costa Rica</li>
            </ul>
          </div>

          {/* Columna 3: Contacto Directo */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#D1E8E2] mb-3">
              Contacto & Gestión
            </h3>
            <ul className="space-y-2 text-sm text-[#F7FCFA]/85">
              <li>📍 {ZOETI_BRAND.location}</li>
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[#D1E8E2]/50 hover:text-[#D1E8E2]"
                >
                  WhatsApp: {ZOETI_BRAND.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${ZOETI_BRAND.email}`}
                  className="hover:text-[#D1E8E2] transition-colors"
                >
                  ✉️ {ZOETI_BRAND.email}
                </a>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateView('admin')}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#D1E8E2]/15 hover:bg-[#D1E8E2]/25 text-[#D1E8E2] border border-[#D1E8E2]/30 transition-colors"
                >
                  🔒 Portal Administrativo
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#D1E8E2]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F7FCFA]/65 gap-2">
          <p>
            © {new Date().getFullYear()} ZoeTi personal shopper. Todos los
            derechos reservados.
          </p>
          <p>Diseñado con la identidad oficial Verde Menta & Vinotinto ZoeTi.</p>
        </div>
      </div>
    </footer>
  );
}

