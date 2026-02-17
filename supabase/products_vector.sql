-- 1. Habilitar la extensión pgvector (si no existe)
create extension if not exists vector;

-- 2. Modificar la tabla 'products'
alter table products 
add column if not exists embedding vector(384), -- Dimensiones para all-MiniLM-L6-v2
add column if not exists last_embedding_at timestamp with time zone;

-- 3. Crear índice HNSW para búsquedas rápidas (Approximate Nearest Neighbor)
-- Parámetros:
-- m: Conexiones por nodo (16 es buen balance)
-- ef_construction: Tamaño de la lista de candidatos durante construcción (64 es estándar)
create index on products using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- 4. Función útil para buscar productos similares
create or replace function match_products (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  price float,
  image_url text,
  similarity float
)
language sql stable
as $$
  select
    products.id,
    products.name,
    products.price,
    products.image_url,
    1 - (products.embedding <=> query_embedding) as similarity
  from products
  where 1 - (products.embedding <=> query_embedding) > match_threshold
  order by products.embedding <=> query_embedding
  limit match_count;
$$;
