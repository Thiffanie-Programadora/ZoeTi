import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { query, pool } from '../config/db.js';

dotenv.config();

/**
 * Script de inicialización para crear o actualizar el usuario Administrador único
 * con contraseña cifrada mediante bcrypt (12 salt rounds).
 */
async function seedAdmin() {
  try {
    const name = process.env.INITIAL_ADMIN_NAME || 'Administradora ZoeTi';
    const email = (
      process.env.INITIAL_ADMIN_EMAIL || 'admin@zoeti.cr'
    ).toLowerCase();
    const plainPassword =
      process.env.INITIAL_ADMIN_PASSWORD || 'ZoeTiAdmin2026!';

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const result = await query(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'admin', TRUE)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    console.log('✅ Administrador configurado exitosamente:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();

