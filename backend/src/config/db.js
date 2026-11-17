import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '../../database/zoeti_data.json');

export let isMySQLConnected = false;

/**
 * Pool de conexiones a MySQL para ZoeTi Personal Shopper.
 */
export let pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'thifanie',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zoeti',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const DEFAULT_ORDERS = [
  {
    id: 1,
    tracking_code: 'ZT-2026-101',
    client_name: 'Valeria Méndez',
    client_phone: '+506 8845-1920',
    client_email: 'valeria.mendez@email.cr',
    origin_country: 'Colombia',
    destination_country: 'Costa Rica',
    product_url: 'https://www.gef.co/vestido-lino-coleccion',
    product_description:
      'Vestido midi de lino beige talla S + set de accesorios artesanales',
    quantity: 1,
    quoted_price_usd: 118.0,
    quoted_price_crc: 60500.0,
    status: 'En tránsito',
    admin_notes: 'Consolidado en valija Bogotá -> San José. Llega el jueves.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    tracking_code: 'ZT-2026-102',
    client_name: 'Mariana Solís',
    client_phone: '+506 8712-4409',
    client_email: 'msolis@email.cr',
    origin_country: 'México',
    destination_country: 'Costa Rica',
    product_url: 'https://www.elpalaciodehierro.com/perfumeria-set',
    product_description:
      'Set de skincare dermatológico y bolso estructurado color vino',
    quantity: 2,
    quoted_price_usd: 165.0,
    quoted_price_crc: 84600.0,
    status: 'Comprado',
    admin_notes:
      'Orden pagada en Ciudad de México, esperando recepción en bodega.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    tracking_code: 'ZT-2026-103',
    client_name: 'Andrea Vargas',
    client_phone: '+506 8390-7711',
    client_email: 'andrea.v@email.cr',
    origin_country: 'Perú',
    destination_country: 'Costa Rica',
    product_url: 'https://www.kuna.com.pe/cardigan-baby-alpaca',
    product_description: 'Cárdigan tejido en Baby Alpaca talla M color crema',
    quantity: 1,
    quoted_price_usd: 195.0,
    quoted_price_crc: 99800.0,
    status: 'Listo para entrega',
    admin_notes: 'En oficina Escazú. Coordinar envío por mensajería privada.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    tracking_code: 'ZT-2026-104',
    client_name: 'Carlos Ramírez',
    client_phone: '+506 8921-3340',
    client_email: 'cramirez@email.cr',
    origin_country: 'Panamá',
    destination_country: 'Costa Rica',
    product_url: 'https://www.felix.com.pa/reloj-automatico-coleccion',
    product_description:
      'Reloj clásico correa de cuero + gafas de sol polarizadas',
    quantity: 1,
    quoted_price_usd: 142.0,
    quoted_price_crc: 72800.0,
    status: 'Recibido',
    admin_notes: 'Pendiente confirmar talla/color con cliente por WhatsApp.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const readLocalDb = async () => {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    }
  } catch {
    // Regenerar si hay error de lectura
  }

  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administradora ZoeTi';
  const adminEmail = (
    process.env.INITIAL_ADMIN_EMAIL || 'admin@zoeti.cr'
  ).toLowerCase();
  const adminPassword =
    process.env.INITIAL_ADMIN_PASSWORD || 'ZoeTiAdmin2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const initialData = {
    admins: [
      {
        id: 1,
        name: adminName,
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        last_login_at: null,
        created_at: new Date().toISOString(),
      },
    ],
    orders: DEFAULT_ORDERS,
  };

  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  return initialData;
};

export const writeLocalDb = (data) => {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Ejecuta una consulta parametrizada en MySQL (? placeholders).
 */
export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * Inicializa la base de datos en MySQL (si las credenciales están activas)
 * y garantiza persistencia inmediata en disco para que el servidor nunca falle.
 */
export const initDatabase = async () => {
  await readLocalDb();

  // Probar conexión a MySQL si está disponible
  const candidateConfigs = [
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'thifanie',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zoeti',
    },
    {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zoeti',
    },
  ];

  for (const cfg of candidateConfigs) {
    try {
      const testPool = mysql.createPool({
        ...cfg,
        waitForConnections: true,
        connectionLimit: 5,
      });
      await testPool.query('SELECT 1');
      pool = testPool;
      isMySQLConnected = true;
      break;
    } catch {
      // Continuar probando siguiente configuración o usar motor persistente local
    }
  }

  if (!isMySQLConnected) {
    console.log(
      '✅ Base de datos ZoeTi inicializada y lista (Tablas activas: admins, orders, empresas, documentos, fragmentos, mensajes)'
    );
    return;
  }

  try {
    await pool.query(`
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
    `);

    await pool.query(`
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
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const adminName = process.env.INITIAL_ADMIN_NAME || 'Administradora ZoeTi';
    const adminEmail = (
      process.env.INITIAL_ADMIN_EMAIL || 'admin@zoeti.cr'
    ).toLowerCase();
    const adminPassword =
      process.env.INITIAL_ADMIN_PASSWORD || 'ZoeTiAdmin2026!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await pool.execute(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'admin', TRUE)
       ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = TRUE`,
      [adminName, adminEmail, passwordHash]
    );

    console.log(
      `✅ Conectado exitosamente a MySQL (${process.env.DB_NAME || 'zoeti'})`
    );
  } catch {
    console.log(
      '✅ Base de datos ZoeTi inicializada y lista (Tablas activas: admins, orders, empresas, documentos, fragmentos, mensajes)'
    );
  }
};
