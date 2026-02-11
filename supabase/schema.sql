-- Create the products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  artist TEXT NOT NULL,
  is_new BOOLEAN DEFAULT FALSE,
  description TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
-- This allows anyone (including unauthenticated users) to view products
CREATE POLICY "Enable read access for all users" 
ON public.products FOR SELECT 
TO anon 
USING (true);

-- Optional: Policy for authenticated users to insert/update (if you implement admin later)
-- CREATE POLICY "Enable insert for authenticated users only" 
-- ON public.products FOR INSERT 
-- TO authenticated 
-- WITH CHECK (true);
