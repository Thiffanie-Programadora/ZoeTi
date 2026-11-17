import React from 'react';
import Fuentes from './Fuentes.jsx';

/**
 * Componente `Mensaje` (Fase 6 - Página 4 y 11 del PDF).
 * Renderiza cada mensaje del historial, indicador de escritura en streaming,
 * fuentes citadas y conteo de tokens (input_tokens / output_tokens).
 */
export default function Mensaje({ mensaje, isLastStreaming }) {
  const esUsuario = mensaje.rol === 'usuario';

  return (
    <div
      className={`flex ${esUsuario ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-2xl rounded-2xl px-5 py-4 border ${
          esUsuario
            ? 'bg-[#4A2040] text-[#F7FCFA] border-[#4A2040]'
            : 'bg-white text-[#4A2040] border-[#D1E8E2] shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-1">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              esUsuario ? 'text-[#D1E8E2]' : 'text-[#68325B]'
            }`}
          >
            {esUsuario ? 'Administradora / Usuario' : 'Asistente IA ZoeTi'}
          </span>
        </div>

        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {mensaje.texto}
          {isLastStreaming && !esUsuario && (
            <span className="inline-block ml-1.5 w-2 h-4 bg-[#4A2040] animate-pulse align-middle" />
          )}
        </p>

        {!esUsuario && <Fuentes fuentes={mensaje.fuentes} />}
      </div>
    </div>
  );
}

