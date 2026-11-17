-- ============================================================================
-- ZOETI PERSONAL SHOPPER - ESQUEMA RELACIONAL MYSQL 8.0
-- Conexión: thifanie@localhost:3306 | Base de datos: zoeti
-- ============================================================================

CREATE DATABASE IF NOT EXISTS zoeti
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zoeti;

-- 1. TABLA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA DE PEDIDOS DE IMPORTACIÓN (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_code VARCHAR(25) NOT NULL UNIQUE,
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(40) NOT NULL,
    client_email VARCHAR(160) NULL,
    origin_country ENUM('México', 'Colombia', 'Perú', 'Panamá') NOT NULL,
    destination_country VARCHAR(40) NOT NULL DEFAULT 'Costa Rica',
    product_url TEXT NOT NULL,
    product_description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    quoted_price_usd DECIMAL(10, 2) NULL,
    quoted_price_crc DECIMAL(12, 2) NULL,
    status ENUM(
        'Recibido',
        'Comprado',
        'En tránsito',
        'Listo para entrega',
        'Entregado',
        'Cancelado'
    ) NOT NULL DEFAULT 'Recibido',
    admin_notes TEXT NULL,
    updated_by_admin_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_admin
      FOREIGN KEY (updated_by_admin_id) REFERENCES admins(id)
      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de ejemplo para pedidos
INSERT IGNORE INTO orders (
    tracking_code,
    client_name,
    client_phone,
    client_email,
    origin_country,
    destination_country,
    product_url,
    product_description,
    quantity,
    quoted_price_usd,
    quoted_price_crc,
    status,
    admin_notes
) VALUES
(
    'ZT-2026-101',
    'Valeria Méndez',
    '+506 8845-1920',
    'valeria.mendez@email.cr',
    'Colombia',
    'Costa Rica',
    'https://www.gef.co/vestido-lino-coleccion',
    'Vestido midi de lino beige talla S + set de accesorios artesanales',
    1,
    118.00,
    60500.00,
    'En tránsito',
    'Consolidado en valija Bogotá -> San José. Llega el jueves.'
),
(
    'ZT-2026-102',
    'Mariana Solís',
    '+506 8712-4409',
    'msolis@email.cr',
    'México',
    'Costa Rica',
    'https://www.elpalaciodehierro.com/perfumeria-set',
    'Set de skincare dermatológico y bolso estructurado color vino',
    2,
    165.00,
    84600.00,
    'Comprado',
    'Orden pagada en Ciudad de México, esperando recepción en bodega.'
),
(
    'ZT-2026-103',
    'Andrea Vargas',
    '+506 8390-7711',
    'andrea.v@email.cr',
    'Perú',
    'Costa Rica',
    'https://www.kuna.com.pe/cardigan-baby-alpaca',
    'Cárdigan tejido en Baby Alpaca talla M color crema',
    1,
    195.00,
    99800.00,
    'Listo para entrega',
    'En oficina Escazú. Coordinar envío por mensajería privada.'
),
(
    'ZT-2026-104',
    'Carlos Ramírez',
    '+506 8921-3340',
    'cramirez@email.cr',
    'Panamá',
    'Costa Rica',
    'https://www.felix.com.pa/reloj-automatico-coleccion',
    'Reloj clásico correa de cuero + gafas de sol polarizadas',
    1,
    142.00,
    72800.00,
    'Recibido',
    'Pendiente confirmar talla/color con cliente por WhatsApp.'
);
