-- ============================================================================
-- ESQUEMA OFICIAL MULTIEMPRESA CON PGVECTOR (Fase 1 - Página 5 y 6 del PDF)
-- Incluye datos de prueba para ZoeTi, Café Montaña S.A. y Logística Pacífico
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS planes (
  id TEXT PRIMARY KEY, -- 'gratis', 'pro'
  max_documentos INT NOT NULL,
  max_preguntas_mes INT NOT NULL
);

CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  plan_id TEXT REFERENCES planes(id) DEFAULT 'gratis',
  drive_carpeta_id TEXT, -- carpeta compartida (opcional)
  creada_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  correo TEXT UNIQUE NOT NULL,
  hash_clave TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'colaborador'))
);

CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  origen TEXT NOT NULL CHECK (origen IN ('carga', 'drive')),
  drive_file_id TEXT,
  drive_modificado TIMESTAMPTZ,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'indexado', 'error')),
  UNIQUE (empresa_id, drive_file_id)
);

CREATE TABLE IF NOT EXISTS fragmentos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  documento_id INT NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  texto TEXT NOT NULL,
  embedding vector(1024) NOT NULL -- dimensión del modelo voyage-4 (1024)
);

CREATE INDEX IF NOT EXISTS idx_fragmentos_embedding_hnsw
  ON fragmentos USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_fragmentos_empresa_id
  ON fragmentos (empresa_id);

CREATE TABLE IF NOT EXISTS mensajes (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  pregunta TEXT NOT NULL,
  respuesta TEXT,
  fuentes JSONB,
  tokens_entrada INT DEFAULT 0,
  tokens_salida INT DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_empresa_mes
  ON mensajes (empresa_id, creado_en);

-- Planes iniciales del modelo SaaS
INSERT INTO planes (id, max_documentos, max_preguntas_mes)
VALUES
  ('gratis', 10, 200),
  ('pro', 500, 10000)
ON CONFLICT (id) DO NOTHING;

-- Empresas de prueba requeridas en la Sección 10 (Validación y Criterios de Aceptación)
INSERT INTO empresas (id, nombre, plan_id, drive_carpeta_id)
VALUES
  (1, 'ZoeTi Personal Shopper', 'pro', '1ZoeTiDriveFolderCR_2026'),
  (2, 'Café Montaña S.A.', 'gratis', '1CafeMontanaFolder_2026'),
  (3, 'Logística Pacífico', 'pro', '1LogisticaPacificoFolder_2026')
ON CONFLICT (id) DO NOTHING;

