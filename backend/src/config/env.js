import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración centralizada de variables de entorno (Paso 1 - Página 4 del PDF).
 */
export const env = {
  PORT: Number(process.env.PORT) || 4000,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgres://policybot:policybot@localhost:5432/policybot',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'zoeti_super_secret_jwt_key_change_in_production_2026',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL || 'gpt-4o',
  VOYAGE_API_KEY: process.env.VOYAGE_API_KEY || '',
  GOOGLE_APPLICATION_CREDENTIALS:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    './credenciales/cuenta-servicio.json',
};

