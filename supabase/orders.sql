-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  items JSONB NOT NULL,
  agreement_accepted_at TIMESTAMP WITH TIME ZONE,
  user_agent TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view own orders'
    ) THEN
        CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Policy: Service role (and authenticated users via Server Action) can insert orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Enable insert for all users'
    ) THEN
        CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT TO public WITH CHECK (true);
    END IF;
END
$$;
