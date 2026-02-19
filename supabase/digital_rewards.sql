-- =============================================================================
-- Digital Rewards
-- =============================================================================
-- Tier-gated downloadable rewards (wallpapers, ringtones, PDFs, etc.)
-- Stored in a private Supabase Storage bucket, served via Signed URLs.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Table: digital_rewards
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.digital_rewards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Display info
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT NOT NULL DEFAULT 'wallpaper',  -- wallpaper, ringtone, pdf, etc.
    preview_url     TEXT,                                -- Public thumbnail/preview (optional)

    -- Private file in Supabase Storage bucket "rewards"
    -- Path inside the bucket, e.g. "wallpapers/aespa-4k.jpg"
    file_path       TEXT NOT NULL,

    -- Minimum tier required to download
    required_tier   loyalty_tier NOT NULL DEFAULT 'SILVER',

    -- Metadata
    file_size_bytes BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.digital_rewards ENABLE ROW LEVEL SECURITY;

-- Anyone can see reward metadata (title, required_tier, preview)
-- but the actual file is served through the API, not directly
DO $$ BEGIN
    CREATE POLICY "Anyone can view digital rewards"
        ON public.digital_rewards FOR SELECT
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only service role can manage rewards
DO $$ BEGIN
    CREATE POLICY "Service role manages digital rewards"
        ON public.digital_rewards FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 3. SEED: Example rewards (the file_path references a private bucket)
-- ---------------------------------------------------------------------------
-- You must create the bucket "rewards" in Supabase Storage first.
-- Run in Supabase Dashboard > Storage > New Bucket:
--   Name: rewards
--   Public: OFF (private)

INSERT INTO public.digital_rewards (title, description, category, file_path, required_tier)
VALUES
    ('Wallpaper K-Pop Stars 4K', 'Fondo de pantalla exclusivo en ultra alta definición.', 'wallpaper', 'wallpapers/kpop-stars-4k.jpg', 'SILVER'),
    ('Ringtone Album Preview', 'Tono de llamada con preview del último álbum.', 'ringtone', 'ringtones/album-preview.mp3', 'SILVER'),
    ('Guía Exclusiva del Collector', 'PDF con tips para coleccionistas Gold.', 'pdf', 'pdfs/collector-guide.pdf', 'GOLD')
ON CONFLICT DO NOTHING;
