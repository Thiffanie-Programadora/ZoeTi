import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Pool de conexiones a PostgreSQL para ZoeTi Personal Shopper.
 * Lee DATABASE_URL desde las variables de entorno.
 */
export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/zoeti_db',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Ejecuta una consulta parametrizada en PostgreSQL.
 * @param {string} text Consulta SQL con placeholders ($1, $2, ...)
 * @param {Array} params Parámetros de la consulta
 */
export const query = (text, params) => pool.query(text, params);

