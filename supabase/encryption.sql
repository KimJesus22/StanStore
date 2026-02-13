-- Add encrypted columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT,
ADD COLUMN IF NOT EXISTS encrypted_address TEXT;
