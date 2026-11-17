import React, { useState } from 'react';
import logoImg from '../assets/zoeti-logo.jpg';
import Boton from '../components/boton.jsx';
import { loginAdminApi } from '../services/api.js';

/**
 * Vista de inicio de sesión seguro (JWT + bcrypt) para el Panel Administrativo de ZoeTi.
 */
export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState('admin@zoeti.cr');
  const [password, setPassword] = useState('ZoeTiAdmin2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginAdminApi(email, password);
      onLoginSuccess(response.admin, response.mode);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] zoeti-gradient-hero flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-md bg-[#F7FCFA] rounded-3xl p-8 sm:p-10 border-2 border-[#D1E8E2] shadow-zoeti-lg">
        <div className="text-center mb-8">
          <img
            src={logoImg}
            alt="ZoeTi Admin"
            className="w-20 h-20 rounded-full mx-auto object-cover zoeti-metallic-ring mb-4"
          />
          <span className="inline-block px-3 py-1 rounded-full bg-[#D1E8E2] text-[11px] font-semibold uppercase tracking-widest text-[#4A2040]">
            Acceso Administrativo
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#4A2040] mt-2">
            Panel Administrativo
          </h1>
          <p className="text-xs sm:text-sm text-[#4A2040]/75 mt-1">
            Gestión exclusiva de pedidos e importaciones ZoeTi
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1.5">
              Correo Electrónico Administrativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zoeti.cr"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
            />
          </div>

          <Boton
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Verificando credenciales...' : 'Ingresar al Panel'}
          </Boton>
        </form>

        <div className="mt-6 p-3.5 rounded-2xl bg-[#D1E8E2]/65 border border-[#4A2040]/15 text-xs text-[#4A2040]/90">
          <p className="font-semibold mb-1">🔑 Credenciales configuradas:</p>
          <p className="font-mono">Usuario: admin@zoeti.cr</p>
          <p className="font-mono">Clave: ZoeTiAdmin2026!</p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToSite}
            className="text-xs font-semibold text-[#68325B] hover:text-[#4A2040] underline"
          >
            ← Volver a la página pública de ZoeTi
          </button>
        </div>
      </div>
    </section>
  );
}

