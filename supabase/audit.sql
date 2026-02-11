-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can view logs
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

-- 2. Insert allowed for authenticated users (for their own actions)
-- We might need a broader policy if anonymous users (failed login) need to log.
-- For now, we will use Service Role in the Server Action to bypass RLS for insertions, 
-- ensuring we can log even if the user is not logged in or RLS is strict.
-- But if we want to allow direct inserts from client (not recommended for audit), we would add a policy.
-- Recommendation: No INSERT policy for public/auth. Only Service Role (backend) should insert.
