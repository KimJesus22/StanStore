-- ==========================================
-- Búsqueda Vectorial AI con pgvector
-- Ejecutar en el SQL Editor de Supabase
-- ==========================================

-- 1. Activar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Agregar columna de embedding a products
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Crear índice HNSW para búsqueda rápida por similitud coseno
CREATE INDEX IF NOT EXISTS products_embedding_idx 
ON products USING hnsw (embedding vector_cosine_ops);

-- 4. Función de búsqueda de productos similares
CREATE OR REPLACE FUNCTION match_products(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 4,
    exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    price decimal,
    image_url text,
    category text,
    artist text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        p.category::text,
        p.artist::text,
        (1 - (p.embedding <=> query_embedding))::float as similarity
    FROM products p
    WHERE p.embedding IS NOT NULL
      AND (exclude_id IS NULL OR p.id != exclude_id)
      AND (1 - (p.embedding <=> query_embedding))::float > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
