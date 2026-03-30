-- =============================================================================
-- RLS Policy Fixes
-- =============================================================================
-- Problema 1: orders — "Enable insert for all users" permite inserciones anónimas.
--             Las órdenes solo se crean desde Server Actions (service_role).
--
-- Problema 2: group_orders — No existe política para que el organizador edite
--             sus propios GOs directamente. El user story es:
--             "Solo el creador de un group order puede modificarlo."
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Fix 1: orders — Restringir INSERT a service_role únicamente
-- ---------------------------------------------------------------------------
-- Los pedidos se crean exclusivamente desde la Server Action `createOrder()`
-- que usa el cliente admin (service_role). No es necesario que usuarios anónimos
-- o autenticados inserten directamente desde el cliente.

DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;

CREATE POLICY "Service role inserts orders"
    ON public.orders FOR INSERT
    TO service_role
    WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- Fix 2: group_orders — El organizador puede crear y editar sus propios GOs
-- ---------------------------------------------------------------------------

-- 2a. Cualquier usuario autenticado puede crear un GO (se convierte en organizador)
DO $$ BEGIN
    CREATE POLICY "Authenticated users can create group orders"
        ON public.group_orders FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2b. El organizador puede actualizar su propio GO
--     WITH CHECK (auth.uid() = organizer_id) impide además cambiar el organizer_id
DO $$ BEGIN
    CREATE POLICY "Organizers can update own group orders"
        ON public.group_orders FOR UPDATE
        TO authenticated
        USING  (auth.uid() = organizer_id)
        WITH CHECK (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTA: No se agrega DELETE para authenticated.
-- Los GOs con participantes pagados no deben borrarse directamente desde el cliente.
-- El borrado sigue siendo exclusivo de service_role (Server Action).
