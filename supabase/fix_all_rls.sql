-- 1. FIX PROFILES & ADMIN ACCESS ----------------------------------------------------
-- First, make sure the profiles table exists (should be created by trigger)
-- Then promote everyone to Admin for this demo environment
UPDATE public.profiles SET is_admin = true;


-- 2. FIX ORDERS PERMISSIONS (CRITICAL ERROR FIX) -------------------------------------
-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Allow ANYONE (including server actions without service role key) to create an order
CREATE POLICY "Enable insert for all users" 
ON public.orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow authenticated users to see only their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);


-- 3. FIX AUDIT LOGS PERMISSIONS (CRITICAL ERROR FIX) ---------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Allow system to write logs (public insert needed as fallback when Service Role Key is missing)
CREATE POLICY "Enable insert for all users" 
ON public.audit_logs FOR INSERT 
TO public 
WITH CHECK (true);

-- Only Admins can view logs
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

-- 4. FIX PRODUCTS PERMISSIONS (ADMIN) ------------------------------------------------
-- Ensure admins can modify products
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
