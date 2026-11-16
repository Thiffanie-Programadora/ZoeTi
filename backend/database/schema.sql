-- ============================================================================
-- ZOETI PERSONAL SHOPPER - ESQUEMA RELACIONAL POSTGRESQL
-- Rutas de Importación: México, Colombia, Perú, Panamá -> Costa Rica
-- ============================================================================

-- Extensión opcional para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PEDIDOS DE IMPORTACIÓN (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    tracking_code VARCHAR(25) UNIQUE NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(40) NOT NULL,
    client_email VARCHAR(160),
    origin_country VARCHAR(40) NOT NULL CHECK (
        origin_country IN ('México', 'Colombia', 'Perú', 'Panamá')
    ),
    destination_country VARCHAR(40) NOT NULL DEFAULT 'Costa Rica',
    product_url TEXT NOT NULL,
    product_description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    quoted_price_usd NUMERIC(10, 2),
    quoted_price_crc NUMERIC(12, 2),
    status VARCHAR(40) NOT NULL DEFAULT 'Recibido' CHECK (
        status IN (
            'Recibido',
            'Comprado',
            'En tránsito',
            'Listo para entrega',
            'Entregado',
            'Cancelado'
        )
    ),
    admin_notes TEXT,
    updated_by_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas frecuentes en el panel administrativo
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_origin_country ON orders(origin_country);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Función y Triggers para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_admins_updated_at ON admins;
CREATE TRIGGER set_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- Datos semilla de ejemplo para pruebas iniciales de pedidos
INSERT INTO orders (
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
    'Orden pagada en CDMX, esperando recepción en bodega.'
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
)
ON CONFLICT (tracking_code) DO NOTHING;

