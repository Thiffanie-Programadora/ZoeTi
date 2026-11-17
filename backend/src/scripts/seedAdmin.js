import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool, initDatabase } from '../config/db.js';

dotenv.config();

/**
 * Script de inicialización para crear las tablas en MySQL (zoeti) y configurar
 * el usuario Administrador único con contraseña cifrada mediante bcrypt.
 */
async function seedAdmin() {
  try {
    await initDatabase();

    const name = process.env.INITIAL_ADMIN_NAME || 'Administradora ZoeTi';
    const email = (
      process.env.INITIAL_ADMIN_EMAIL || 'admin@zoeti.cr'
    ).toLowerCase();
    const plainPassword =
      process.env.INITIAL_ADMIN_PASSWORD || 'ZoeTiAdmin2026!';

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    await pool.execute(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'admin', TRUE)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         is_active = TRUE`,
      [name, email, passwordHash]
    );

    console.log(
      `✅ Administrador configurado en MySQL (zoeti): ${email}`
    );
  } catch (error) {
    console.error('❌ Error al configurar el administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();
