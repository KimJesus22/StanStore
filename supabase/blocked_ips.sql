-- Create the blocked_ips table for storing blacklisted IP addresses
-- This allows real-time updates to the blacklist without redeploying the application.

CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- Policies
-- 1. Read: Public/Anon/Service
-- 2. Write: Admin/Service Role only
--------------------------------------------------------------------------------

-- Policy 1: Read access
-- Allows public read access so the Middleware (or client-side if needed) can check IPs.
-- Note: Service Role bypasses RLS, so this is mainly for 'anon' or 'authenticated' non-admins.
CREATE POLICY "Public read access for blocked_ips"
  ON public.blocked_ips
  FOR SELECT
  USING (true);

-- Policy 2: Insert access (Admins only)
CREATE POLICY "Admins can insert blocked_ips"
  ON public.blocked_ips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy 3: Update access (Admins only)
CREATE POLICY "Admins can update blocked_ips"
  ON public.blocked_ips
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy 4: Delete access (Admins only)
CREATE POLICY "Admins can delete blocked_ips"
  ON public.blocked_ips
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Comment on table
COMMENT ON TABLE public.blocked_ips IS 'List of IP addresses blocked from accessing the application.';

-- Optional: Seed initial data from previous hardcoded list
INSERT INTO public.blocked_ips (ip_address, reason)
VALUES 
  ('1.2.3.4', 'Legacy Hardcoded Block'),
  ('5.6.7.8', 'Legacy Hardcoded Block')
ON CONFLICT (ip_address) DO NOTHING;
