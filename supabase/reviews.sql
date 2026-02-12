-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read reviews
CREATE POLICY "Enable read access for all users" 
ON public.reviews FOR SELECT 
TO public 
USING (true);

-- Policy: Authenticated users can insert their own reviews
CREATE POLICY "Enable insert for authenticated users" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Enable delete for users based on user_id" 
ON public.reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
