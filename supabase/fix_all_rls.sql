-- =============================================================================
-- ADVERTENCIA: Este script fue creado como workaround de depuración.
-- NO ejecutar en producción sin revisar cada sección.
-- Las políticas de órdenes correctas están en rls_policy_fixes.sql.
-- =============================================================================


-- 1. PROFILES — Promotion a admin
-- -----------------------------------------------------------------------------
-- PELIGRO: Promover a TODOS los usuarios a admin rompe el modelo de seguridad.
-- Para promover un usuario específico, usar:
--
--   UPDATE public.profiles SET is_admin = true WHERE id = '<tu-uuid>';
--
-- La versión masiva está intencionalmente deshabilitada:
-- UPDATE public.profiles SET is_admin = true;  -- ← NO descomentar en producción


-- 2. ORDERS — INSERT restringido a service_role
-- -----------------------------------------------------------------------------
-- Las órdenes se crean exclusivamente desde Server Actions con createAdminClient().
-- No se permite inserción desde el cliente (ni anónima, ni autenticada directa).

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Service role inserts orders"  ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders"    ON public.orders;

CREATE POLICY "Service role inserts orders"
    ON public.orders FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);


-- 3. AUDIT LOGS — INSERT restringido a service_role
-- -----------------------------------------------------------------------------
-- logAuditAction() se invoca desde Server Actions (createAdminClient).
-- No se necesita INSERT público.

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users"      ON public.audit_logs;
DROP POLICY IF EXISTS "Service role inserts audit logs"  ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs"       ON public.audit_logs;

CREATE POLICY "Service role inserts audit logs"
    ON public.audit_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );


-- 4. PRODUCTS — Mutaciones solo para admins autenticados
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );


-- 5. GROUP ORDERS — Lectura pública, escritura solo service_role
-- -----------------------------------------------------------------------------
-- Los group orders se crean y editan desde Server Actions (createAdminClient).
-- Cualquier usuario (incluido anónimo) puede leerlos para ver el catálogo de GOs.
-- El borrado y la edición quedan restringidos al backend.

ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read group orders"                ON public.group_orders;
DROP POLICY IF EXISTS "Authenticated users can create group orders" ON public.group_orders;
DROP POLICY IF EXISTS "Organizers can update own group orders"      ON public.group_orders;
DROP POLICY IF EXISTS "Service role manages group orders"           ON public.group_orders;

-- 5a. Lectura pública (catálogo de pedidos grupales)
CREATE POLICY "Anyone can read group orders"
    ON public.group_orders FOR SELECT
    TO public
    USING (true);

-- 5b. INSERT / UPDATE / DELETE solo desde el backend
CREATE POLICY "Service role manages group orders"
    ON public.group_orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 6. GROUP ORDER PARTICIPANTS — Cada participante maneja su propia fila
-- -----------------------------------------------------------------------------
-- Un usuario autenticado puede unirse a un GO (INSERT su fila) y consultar
-- únicamente sus propias participaciones. La actualización y el borrado
-- quedan en manos del backend (service_role) para proteger la integridad
-- de participaciones con pagos procesados.

ALTER TABLE public.group_order_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can insert own row"     ON public.group_order_participants;
DROP POLICY IF EXISTS "Participants can read own rows"      ON public.group_order_participants;
DROP POLICY IF EXISTS "Service role manages participants"   ON public.group_order_participants;

-- 6a. Un usuario autenticado puede unirse a un GO (insertar su fila)
CREATE POLICY "Participants can insert own row"
    ON public.group_order_participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6b. Cada participante solo puede leer sus propias participaciones
CREATE POLICY "Participants can read own rows"
    ON public.group_order_participants FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 6c. UPDATE / DELETE solo desde el backend (protege pagos procesados)
CREATE POLICY "Service role manages participants"
    ON public.group_order_participants FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 7. BLOCKED IPS — Lectura solo admin, escritura solo admin
-- -----------------------------------------------------------------------------
-- ANTES: SELECT público exponía la lista completa de IPs bloqueadas.
-- AHORA: Solo admins autenticados pueden leer la tabla desde el cliente.
-- El middleware (withRateLimit) usa SERVICE_ROLE_KEY que bypasa RLS,
-- así que puede verificar IPs sin necesidad de lectura pública.

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for blocked_ips" ON public.blocked_ips;
DROP POLICY IF EXISTS "Admins can read blocked_ips"        ON public.blocked_ips;
DROP POLICY IF EXISTS "Admins can insert blocked_ips"      ON public.blocked_ips;
DROP POLICY IF EXISTS "Admins can update blocked_ips"      ON public.blocked_ips;
DROP POLICY IF EXISTS "Admins can delete blocked_ips"      ON public.blocked_ips;

-- 7a. Solo admins pueden leer (el middleware usa service_role, bypasa RLS)
CREATE POLICY "Admins can read blocked_ips"
    ON public.blocked_ips FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- 7b. Solo admins pueden insertar
CREATE POLICY "Admins can insert blocked_ips"
    ON public.blocked_ips FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- 7c. Solo admins pueden actualizar
CREATE POLICY "Admins can update blocked_ips"
    ON public.blocked_ips FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- 7d. Solo admins pueden eliminar
CREATE POLICY "Admins can delete blocked_ips"
    ON public.blocked_ips FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );
