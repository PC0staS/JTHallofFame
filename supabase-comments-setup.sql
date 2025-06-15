-- Script SQL para añadir la tabla de comentarios en Supabase (PostgreSQL)

-- Crear tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_photo FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

-- Añadir user_id a la tabla photos si no existe
ALTER TABLE photos ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Habilitar RLS (Row Level Security) para la tabla de comentarios
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Política para que cualquier usuario autenticado pueda leer comentarios
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);

-- Política para que los usuarios puedan insertar sus propios comentarios
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan editar sus propios comentarios
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (true);

-- Política para que los usuarios puedan eliminar sus propios comentarios
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (true);
