import React, { useState } from 'react';
import logoImg from '../assets/zoeti-logo.jpg';
import Boton from './boton.jsx';
import { getWhatsAppUrl } from '../config/brand.js';

/**
 * Barra de navegación minimalista y elegante de ZoeTi Personal Shopper.
 */
export default function Navbar({
  currentView,
  onNavigateView,
  isAdminLoggedIn,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (currentView !== 'public') {
      onNavigateView('public');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7FCFA]/95 backdrop-blur-md border-b border-[#D1E8E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Marca & Logotipo Oficial */}
        <button
          type="button"
          onClick={() => handleSectionClick('inicio')}
          className="flex items-center gap-3.5 text-left group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4A2040] shadow-sm flex-shrink-0 bg-[#D1E8E2] transition-transform duration-300 group-hover:scale-105">
            <img
              src={logoImg}
              alt="ZoeTi Personal Shopper Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="block font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#4A2040] leading-none">
              ZoeTi
            </span>
            <span className="block font-serif italic text-xs sm:text-sm text-[#68325B] tracking-wider">
              personal shopper
            </span>
          </div>
        </button>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A2040]/90">
          <button
            type="button"
            onClick={() => handleSectionClick('inicio')}
            className="hover:text-[#4A2040] transition-colors"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('como-funciona')}
            className="hover:text-[#4A2040] transition-colors"
          >
            Cómo Funciona
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('rutas')}
            className="hover:text-[#4A2040] transition-colors"
          >
            Rutas de Importación
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('rastreo')}
            className="hover:text-[#4A2040] transition-colors"
          >
            Rastrear Pedido
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('faq')}
            className="hover:text-[#4A2040] transition-colors"
          >
            Preguntas Frecuentes
          </button>
        </nav>

        {/* Acciones: WhatsApp CTA + Acceso Administrativo */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onNavigateView(currentView === 'public' ? 'admin' : 'public')
            }
            className="px-3.5 py-2 rounded-full text-xs font-medium text-[#4A2040] bg-[#D1E8E2]/60 hover:bg-[#D1E8E2] transition-colors border border-[#4A2040]/15"
          >
            {currentView === 'public'
              ? isAdminLoggedIn
                ? 'Panel Admin'
                : 'Acceso Admin'
              : '← Volver a la Web'}
          </button>

          <Boton
            href={getWhatsAppUrl()}
            target="_blank"
            variant="primary"
            size="sm"
          >
            <span>Cotizar por WhatsApp</span>
          </Boton>
        </div>

        {/* Botón Menú Móvil */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú"
          className="md:hidden p-2.5 rounded-xl bg-[#D1E8E2]/60 text-[#4A2040] hover:bg-[#D1E8E2]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7FCFA] border-b border-[#D1E8E2] px-4 pt-3 pb-6 space-y-3">
          <button
            type="button"
            onClick={() => handleSectionClick('inicio')}
            className="block w-full text-left py-2 text-sm font-medium text-[#4A2040]"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('como-funciona')}
            className="block w-full text-left py-2 text-sm font-medium text-[#4A2040]"
          >
            Cómo Funciona (3 Pasos)
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('rutas')}
            className="block w-full text-left py-2 text-sm font-medium text-[#4A2040]"
          >
            Países y Rutas de Importación
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('rastreo')}
            className="block w-full text-left py-2 text-sm font-medium text-[#4A2040]"
          >
            Rastrear mi Pedido
          </button>
          <button
            type="button"
            onClick={() => handleSectionClick('faq')}
            className="block w-full text-left py-2 text-sm font-medium text-[#4A2040]"
          >
            Preguntas Frecuentes
          </button>
          <div className="pt-2 flex flex-col gap-2.5">
            <Boton
              href={getWhatsAppUrl()}
              target="_blank"
              variant="primary"
              size="md"
              className="w-full"
            >
              Cotizar por WhatsApp
            </Boton>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateView(currentView === 'public' ? 'admin' : 'public');
              }}
              className="w-full py-2.5 text-center rounded-full text-xs font-semibold text-[#4A2040] bg-[#D1E8E2]/70"
            >
              {currentView === 'public'
                ? 'Ir al Panel Administrativo'
                : '← Volver al Sitio Público'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

