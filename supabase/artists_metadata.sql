-- ============================================================
-- artists_metadata.sql
-- Añade metadatos de artistas: género musical, popularidad y
-- fecha de debut. Permite filtrar y ordenar la página /artists.
-- ============================================================

-- 1. Añadir columnas (idempotente)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS genre            TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS popularity_score INTEGER CHECK (popularity_score BETWEEN 0 AND 100);
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS debut_date       DATE;

-- 2. Índices para filtrado y ordenación eficientes
CREATE INDEX IF NOT EXISTS idx_artists_genre      ON public.artists (genre);
CREATE INDEX IF NOT EXISTS idx_artists_popularity ON public.artists (popularity_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_artists_debut      ON public.artists (debut_date DESC NULLS LAST);

-- 3. Rellenar datos de artistas existentes
UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 99,
    debut_date       = '2013-06-13'
WHERE name = 'BTS';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 95,
    debut_date       = '2022-07-22'
WHERE name = 'NewJeans';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 97,
    debut_date       = '2016-08-08'
WHERE name = 'BLACKPINK';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 90,
    debut_date       = '2015-05-26'
WHERE name = 'Seventeen';

UPDATE public.artists SET
    genre            = 'K-Hip-Hop',
    popularity_score = 88,
    debut_date       = '2017-03-25'
WHERE name = 'Stray Kids';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 92,
    debut_date       = '2015-10-20'
WHERE name = 'TWICE';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 85,
    debut_date       = '2019-03-04'
WHERE name = 'TOMORROW X TOGETHER';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 87,
    debut_date       = '2022-05-02'
WHERE name = 'LE SSERAFIM';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 89,
    debut_date       = '2020-11-30'
WHERE name = 'aespa';

UPDATE public.artists SET
    genre            = 'K-Pop',
    popularity_score = 83,
    debut_date       = '2020-11-30'
WHERE name = 'ENHYPEN';
