-- Create table for security reports
CREATE TABLE IF NOT EXISTS public.security_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    reproduction_steps TEXT,
    submitter_email TEXT, -- Optional, for contact
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'resolved', 'ignored'))
);

-- Enable RLS
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public reporting)
CREATE POLICY "Anyone can submit reports" ON public.security_reports
    FOR INSERT
    WITH CHECK (true);

-- Only admins/service role can view (Protect sensitive data)
-- For now, we restrict SELECT to service_role (backend) only, or specific authenticated admins if we had roles.
-- Since we don't have a robust admin role system yet, we'll effectively disabling public select.
CREATE POLICY "Only admins can view reports" ON public.security_reports
    FOR SELECT
    USING (auth.role() = 'service_role');
