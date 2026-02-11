-- Create the orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Service role (and authenticated users via Server Action) can insert orders
-- Note: We allow authenticated users to insert their own orders for this MVP simulation
-- In a real app with Webhooks, only service_role would insert.
-- UPDATE: Allowing public insert for Demo purposes (handling anon client in legacy server actions)
CREATE POLICY "Enable insert for all users" 
ON public.orders FOR INSERT 
TO public 
WITH CHECK (true);
