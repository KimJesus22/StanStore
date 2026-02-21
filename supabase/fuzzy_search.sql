-- ─────────────────────────────────────────────────────────────────────────────
-- BÚSQUEDA FUZZY CON pg_trgm
-- Tolera errores tipográficos: 'Blakpink' → 'Blackpink', 'Trenchh' → 'Trench'
--
-- PASO 1: Habilitar la extensión (ejecutar una sola vez)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ¿Qué hace pg_trgm?
-- Descompone cada string en trigramas de 3 caracteres consecutivos.
--   'Blackpink' → {' Bl','Bla','lac','ack','ckp','kpi','pin','ink','nk '}
--   'Blakpink'  → {' Bl','Bla','lak','akp','kpi','pin','ink','nk '}
-- El grado de similitud = trigramas en común / total de trigramas únicos.
-- 'Blakpink' vs 'Blackpink' ≈ 0.63 → suficientemente similar para aparecer.


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2: Índices GIN para búsquedas en O(log n) en lugar de O(n)
-- GIN (Generalized Inverted Index) indexa los trigramas de cada valor
-- permitiendo que el operador % y <-> usen el índice sin hacer full-scan.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products
  USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_artist_trgm
  ON public.products
  USING GIN (artist gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm
  ON public.products
  USING GIN (description gin_trgm_ops);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3: Ajustar el umbral de similitud (opcional)
-- pg_trgm.similarity_threshold: valor entre 0 y 1.
--   0.3 = permisivo (encuentra más resultados, más falsos positivos)
--   0.6 = estricto  (solo coincidencias muy parecidas)
-- El default es 0.3. Para K-Pop con nombres cortos, 0.25 es bueno.
-- ─────────────────────────────────────────────────────────────────────────────

-- Se aplica a nivel de sesión/función, no globalmente.
-- Lo configuramos dentro de la función RPC para no afectar otras queries.


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4: Función RPC fuzzy_search_products(search_term)
--
-- Operadores usados:
--   similarity(a, b)  → float entre 0 y 1 (cuánto se parecen dos strings)
--   a % b             → true si similarity >= pg_trgm.similarity_threshold
--   a <-> b           → "distancia" = 1 - similarity (para ORDER BY ASC)
--
-- Estrategia: busca por similitud en name, artist y description.
-- Ordena por el mayor score de similitud entre name y artist.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fuzzy_search_products(search_term TEXT)
RETURNS TABLE (
  id           UUID,
  name         TEXT,
  artist       TEXT,
  price        NUMERIC,
  image_url    TEXT,
  category     TEXT,
  stock        INTEGER,
  sim_score    FLOAT   -- score de 0 a 1: cuánto coincide el resultado con el término
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path    = public
SET pg_trgm.similarity_threshold = 0.15  -- permisivo para nombres cortos de K-Pop
AS $$
DECLARE
  normalized TEXT := LOWER(TRIM(search_term));
BEGIN
  -- Rechazar términos muy cortos (generarían demasiado ruido)
  IF LENGTH(normalized) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.artist,
    p.price,
    p.image_url,
    p.category,
    p.stock,
    -- Puntuación compuesta: el máximo entre similitud con nombre y con artista.
    -- Así 'BTS proof' encuentra el álbum aunque el artista sea solo 'BTS'.
    GREATEST(
      similarity(LOWER(p.name),   normalized),
      similarity(LOWER(p.artist), normalized)
    ) AS sim_score

  FROM public.products p

  WHERE
    -- El operador % aprovecha el índice GIN para filtrar antes de calcular similarity()
    LOWER(p.name)        % normalized
    OR LOWER(p.artist)   % normalized
    OR LOWER(p.description) % normalized

  ORDER BY sim_score DESC

  LIMIT 5;
END;
$$;

-- Permisos: disponible para el cliente con clave anon
REVOKE EXECUTE ON FUNCTION public.fuzzy_search_products(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.fuzzy_search_products(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN: prueba la función desde el SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Typo en 'Blackpink'
-- SELECT * FROM fuzzy_search_products('Blakpink');

-- Typo en 'Trench' (álbum de Twenty One Pilots)
-- SELECT * FROM fuzzy_search_products('Trenchh');

-- Artista con acento omitido
-- SELECT * FROM fuzzy_search_products('Ateez');

-- Ver la similitud cruda entre dos strings:
-- SELECT similarity('Blakpink', 'Blackpink');   → ~0.63
-- SELECT similarity('Trenchh',  'Trench');       → ~0.71
-- SELECT similarity('bts',      'BTS Proof');    → ~0.36
