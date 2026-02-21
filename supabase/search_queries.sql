-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: search_queries
-- Registra cada término buscado y su popularidad acumulada.
-- Usada para sugerencias de autocompletado ordenadas por frecuencia.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.search_queries (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  query            TEXT        NOT NULL,
  frequency        INTEGER     NOT NULL DEFAULT 1,
  last_searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Restricción única sobre el texto normalizado (case-insensitive)
  CONSTRAINT search_queries_query_unique UNIQUE (query)
);

-- Índice para autocompletado: búsquedas de prefijo rápidas + orden por popularidad
CREATE INDEX IF NOT EXISTS idx_search_queries_query_prefix
  ON public.search_queries USING btree (query text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_search_queries_frequency
  ON public.search_queries (frequency DESC);

-- RLS: la tabla es de escritura interna, lectura pública para sugerencias
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer sugerencias populares
CREATE POLICY "search_queries_select_public"
  ON public.search_queries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo el rol de servicio (service_role) puede escribir directamente
-- La escritura desde la app se hace a través de la función log_search_query
CREATE POLICY "search_queries_insert_service"
  ON public.search_queries FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "search_queries_update_service"
  ON public.search_queries FOR UPDATE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN: log_search_query(search_term TEXT)
--
-- Lógica UPSERT:
--   • Si el término YA EXISTE  → frequency += 1, last_searched_at = NOW()
--   • Si el término NO EXISTE  → INSERT con frequency = 1
--
-- Se ejecuta con SECURITY DEFINER para que la llamada desde el cliente
-- (con la clave anon) tenga permisos de escritura sin exponer las policies.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.log_search_query(search_term TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Normalizamos: trim de espacios y lowercase para evitar duplicados
  -- como "BTS", "bts" y " BTS " contando como entradas distintas
  normalized TEXT := LOWER(TRIM(search_term));
BEGIN
  -- Ignorar búsquedas vacías o demasiado cortas (ruido)
  IF LENGTH(normalized) < 2 THEN
    RETURN;
  END IF;

  INSERT INTO public.search_queries (query, frequency, last_searched_at)
  VALUES (normalized, 1, NOW())
  ON CONFLICT (query) DO UPDATE
    SET frequency        = search_queries.frequency + 1,
        last_searched_at = NOW();
END;
$$;

-- Revocar ejecución pública y concederla explícitamente a anon y authenticated
-- para que el frontend pueda llamarla vía supabase.rpc()
REVOKE EXECUTE ON FUNCTION public.log_search_query(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.log_search_query(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN AUXILIAR: get_search_suggestions(prefix TEXT, max_results INT)
--
-- Devuelve sugerencias de autocompletado ordenadas por popularidad.
-- Uso desde Next.js: supabase.rpc('get_search_suggestions', { prefix: 'bts', max_results: 8 })
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  prefix      TEXT,
  max_results INT DEFAULT 8
)
RETURNS TABLE (query TEXT, frequency INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sq.query, sq.frequency
  FROM   public.search_queries sq
  WHERE  sq.query LIKE LOWER(TRIM(prefix)) || '%'
  ORDER  BY sq.frequency DESC, sq.last_searched_at DESC
  LIMIT  max_results;
$$;

REVOKE EXECUTE ON FUNCTION public.get_search_suggestions(TEXT, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_search_suggestions(TEXT, INT) TO anon, authenticated;
