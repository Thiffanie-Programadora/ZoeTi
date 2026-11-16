import React, { useState } from 'react';
import './App.css';
import Navbar from './components/navbar.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import GaleriaRutas from './components/galeria.jsx';
import FaqSection from './components/FaqSection.jsx';
import Footer from './components/footer.jsx';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { getStoredAdmin, getAuthToken } from './services/api.js';

/**
 * Aplicación Principal de ZoeTi Personal Shopper.
 * Combina la Interfaz Pública orientada a conversión por WhatsApp y el
 * Módulo Privado de Administración protegido con JWT.
 */
export default function App() {
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'admin'
  const [adminUser, setAdminUser] = useState(() =>
    getAuthToken() ? getStoredAdmin() : null
  );

  const handleLoginSuccess = (adminData) => {
    setAdminUser(adminData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setAdminUser(null);
    setCurrentView('public');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FCFA] text-[#4A2040]">
      <Navbar
        currentView={currentView}
        onNavigateView={setCurrentView}
        isAdminLoggedIn={Boolean(adminUser)}
      />

      <main className="flex-1">
        {currentView === 'public' ? (
          <>
            <Hero />
            <HowItWorks />
            <GaleriaRutas />
            <FaqSection />
          </>
        ) : adminUser ? (
          <AdminDashboard admin={adminUser} onLogout={handleLogout} />
        ) : (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToSite={() => setCurrentView('public')}
          />
        )}
      </main>

      <Footer onNavigateView={setCurrentView} />

      {/* Botón flotante permanente de WhatsApp para cerrar ventas */}
      <WhatsAppFloatingButton />
    </div>
  );
}
