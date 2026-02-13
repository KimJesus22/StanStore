-- Add immersive columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spotify_album_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS theme_color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
