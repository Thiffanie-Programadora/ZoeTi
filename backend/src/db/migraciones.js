import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lee el esquema SQL multiempresa con pgvector (001_esquema.sql).
 */
export function obtenerSqlMigracionInicial() {
  const sqlPath = path.join(__dirname, '001_esquema.sql');
  return fs.readFileSync(sqlPath, 'utf8');
}

