import React from 'react';

/**
 * Componente reutilizable de Botón con el diseño corporativo de ZoeTi.
 * Variantes: 'primary' (Vinotinto #4A2040), 'mint' (Verde Menta #D1E8E2),
 * 'outline' (Borde vinotinto), 'whatsapp' (Acción directa WhatsApp).
 */
export default function Boton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  target,
  rel,
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2.5 font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4A2040]/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-[#4A2040] text-[#F7FCFA] hover:bg-[#32132B] shadow-md hover:shadow-lg hover:-translate-y-0.5',
    mint:
      'bg-[#D1E8E2] text-[#4A2040] border border-[#4A2040]/20 hover:bg-[#B7DAD1] shadow-sm',
    outline:
      'bg-transparent text-[#4A2040] border-2 border-[#4A2040] hover:bg-[#4A2040] hover:text-[#F7FCFA]',
    whatsapp:
      'bg-[#4A2040] text-[#F7FCFA] hover:bg-[#32132B] ring-2 ring-[#D1E8E2] shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs tracking-wide',
    md: 'px-6 py-3 text-sm tracking-wide',
    lg: 'px-8 py-4 text-base tracking-wide font-semibold',
  };

  const combinedClasses = `${baseClasses} ${
    variantClasses[variant] || variantClasses.primary
  } ${sizeClasses[size] || sizeClasses.md} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={combinedClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}

