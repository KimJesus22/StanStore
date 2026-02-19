-- =============================================================================
-- go_updates — Bitácora pública de actualizaciones por pedido grupal (GO)
-- =============================================================================
-- Cada fila representa una entrada visible para los participantes y el público,
-- similar a un feed de noticias del GO (aduana liberada, paquete en camino, etc.)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. ENUM
-- ---------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE go_update_status AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'DELAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 2. TABLA
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.go_updates (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FK al GO padre
    group_order_id   UUID NOT NULL
                         REFERENCES public.group_orders(id) ON DELETE CASCADE,

    -- Contenido de la actualización
    title            TEXT NOT NULL,
    content          TEXT NOT NULL,          -- Soporta Markdown
    image_url        TEXT,                   -- Foto del paquete, aduana, etc. (opcional)

    -- Categoría visual del mensaje
    status_type      go_update_status NOT NULL DEFAULT 'INFO',

    -- Auditoría: quién publicó la actualización
    created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para listar actualizaciones de un GO ordenadas cronológicamente
CREATE INDEX IF NOT EXISTS idx_go_updates_go_id_created
    ON public.go_updates (group_order_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE public.go_updates ENABLE ROW LEVEL SECURITY;

-- Lectura pública — cualquier usuario (incluso anónimo) puede ver las entradas
DO $$ BEGIN
    CREATE POLICY "go_updates: lectura pública"
        ON public.go_updates
        FOR SELECT
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Solo el service_role (admin) puede insertar, actualizar o eliminar
DO $$ BEGIN
    CREATE POLICY "go_updates: solo admin puede escribir"
        ON public.go_updates
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
