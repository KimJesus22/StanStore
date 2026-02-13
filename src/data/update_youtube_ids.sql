-- ==========================================
-- Actualización de IDs de YouTube Verificados
-- ==========================================

-- 1. Asegurar que la columna 'youtube_video_id' existe (por si acaso)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'youtube_video_id') THEN
        ALTER TABLE products ADD COLUMN youtube_video_id TEXT;
    END IF;
END $$;

-- 2. Actualizar IDs específicos para asegurar disponibilidad
UPDATE products SET youtube_video_id = 'mPVDGOVjRQ0' WHERE artist = 'BTS' AND name LIKE '%Map of the Soul%';
UPDATE products SET youtube_video_id = 'ArmDp-zijuc' WHERE artist = 'NewJeans';
UPDATE products SET youtube_video_id = '-GQg25oP0S4' WHERE artist = 'Seventeen';
UPDATE products SET youtube_video_id = 'POe9SOEKotk' WHERE artist = 'BLACKPINK';
UPDATE products SET youtube_video_id = 'JsOOis4bBFg' WHERE artist = 'Stray Kids';
UPDATE products SET youtube_video_id = 'w4cTYnOPdNk' WHERE artist = 'TWICE';
UPDATE products SET youtube_video_id = 'ISnyONG1dEc' WHERE artist = 'TXT';
UPDATE products SET youtube_video_id = 'UBURTj20HXI' WHERE artist = 'LE SSERAFIM';
UPDATE products SET youtube_video_id = 'D8VEhcPeSlc' WHERE artist = 'aespa';
UPDATE products SET youtube_video_id = 'XBwYJiEOmPo' WHERE artist = 'ENHYPEN';

-- 3. Resincronizar otros campos si es necesario (opcional)
-- ...
