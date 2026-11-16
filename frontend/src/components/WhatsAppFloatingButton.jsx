import React from 'react';
import { getWhatsAppUrl } from '../config/brand.js';

/**
 * Botón flotante de WhatsApp permanentemente visible para cerrar ventas de forma directa.
 */
export default function WhatsAppFloatingButton() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar ahora por WhatsApp con ZoeTi"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-full bg-[#4A2040] text-[#F7FCFA] border-2 border-[#D1E8E2] shadow-zoeti-lg hover:bg-[#32132B] transition-all duration-300 group"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white whatsapp-pulse">
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.82 11.82 0 0012.04 0C5.5 0 .17 5.33.17 11.87c0 2.09.55 4.14 1.59 5.95L0 24l6.35-1.66a11.84 11.84 0 005.69 1.45h.01c6.54 0 11.87-5.33 11.87-11.87 0-3.17-1.24-6.15-3.4-8.44zM12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.85 9.85 0 01-1.51-5.27c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.44 9.89-9.88 9.89zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
        </svg>
      </span>
      <div className="pr-1 text-left">
        <span className="block text-[10px] uppercase tracking-wider text-[#D1E8E2] leading-none">
          Atención inmediata
        </span>
        <span className="block text-xs sm:text-sm font-semibold leading-tight">
          Cotizar por WhatsApp
        </span>
      </div>
    </a>
  );
}

