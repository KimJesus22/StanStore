-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add pt-BR and fr-CA columns to products and artists
-- Run in: Supabase SQL Editor (or via supabase db push)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── products ──────────────────────────────────────────────────────────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_pt        TEXT,   -- Português (Brasil)
  ADD COLUMN IF NOT EXISTS description_pt TEXT,
  ADD COLUMN IF NOT EXISTS name_fr        TEXT,   -- Français (Canada)
  ADD COLUMN IF NOT EXISTS description_fr TEXT;

COMMENT ON COLUMN products.name_pt        IS 'Product name in Brazilian Portuguese (pt-BR)';
COMMENT ON COLUMN products.description_pt IS 'Product description in Brazilian Portuguese (pt-BR)';
COMMENT ON COLUMN products.name_fr        IS 'Product name in Canadian French (fr-CA)';
COMMENT ON COLUMN products.description_fr IS 'Product description in Canadian French (fr-CA)';

-- ── artists ───────────────────────────────────────────────────────────────────
-- The `bio` column is already JSONB keyed by locale (e.g. {"es":"…","en":"…","ko":"…"}).
-- No schema change needed — just add the new locale keys when translating.
-- For reference, the expected JSON shape after adding pt-BR and fr-CA:
--
--   {
--     "es": "Biografía en español",
--     "en": "Bio in English",
--     "ko": "한국어 바이오",
--     "pt-BR": "Biografia em português",
--     "fr-CA": "Biographie en français"
--   }
--
-- Example UPDATE to seed Portuguese bio for an existing artist:
--   UPDATE artists
--   SET bio = bio || '{"pt-BR": "Biografia aqui...", "fr-CA": "Biographie ici..."}'::jsonb
--   WHERE name = 'BTS';

-- ── Useful view: shows translation completeness per product ───────────────────

CREATE OR REPLACE VIEW products_i18n_status AS
SELECT
  id,
  name                                                     AS name_es,
  CASE WHEN description_en  IS NOT NULL THEN '✓' ELSE '✗' END AS en,
  CASE WHEN description_ko  IS NOT NULL THEN '✓' ELSE '✗' END AS ko,
  CASE WHEN description_pt  IS NOT NULL THEN '✓' ELSE '✗' END AS pt_BR,
  CASE WHEN description_fr  IS NOT NULL THEN '✓' ELSE '✗' END AS fr_CA
FROM products
ORDER BY name;

-- ── RLS: new columns inherit existing policies (no action needed) ─────────────
