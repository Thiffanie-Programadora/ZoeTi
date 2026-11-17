import React from 'react';

/**
 * Componente `Fuentes` (Fase 6 - Página 4 y 11 del PDF).
 * Muestra la lista de documentos citados bajo cada respuesta del asistente RAG.
 */
export default function Fuentes({ fuentes = [] }) {
  if (!fuentes || fuentes.length === 0) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-[#4A2040]/15 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#68325B]">
        Fuentes citadas:
      </span>
      {fuentes.map((f) => (
        <span
          key={`${f.id}-${f.nombre}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1E8E2] text-[#4A2040] text-xs font-medium border border-[#4A2040]/20"
        >
          <strong className="font-mono">[{f.id}]</strong>
          <span>{f.nombre}</span>
        </span>
      ))}
    </div>
  );
}

