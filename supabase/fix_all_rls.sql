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
