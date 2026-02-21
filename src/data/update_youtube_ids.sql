-- ==========================================
-- Actualización de IDs de YouTube Verificados
-- Usa IDs de producto específicos para evitar ambigüedades
-- ==========================================

-- 1. Asegurar que la columna 'youtube_video_id' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'youtube_video_id') THEN
        ALTER TABLE products ADD COLUMN youtube_video_id TEXT;
    END IF;
END $$;

-- 2. Actualizar por ID de producto (sin ambigüedades)
UPDATE products SET youtube_video_id = 'mPVDGOVjRQ0' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c'; -- BTS: Map of the Soul: 7
UPDATE products SET youtube_video_id = 'ArmDp-zijuc' WHERE id = 'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d'; -- NewJeans: Get Up
UPDATE products SET youtube_video_id = '-GQg25oP0S4' WHERE id = 'a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e'; -- Seventeen: Caratbong V3
UPDATE products SET youtube_video_id = 'POe9SOEKotk' WHERE id = 'b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f'; -- BLACKPINK: BORN PINK Hoodie
UPDATE products SET youtube_video_id = 'JsOOis4bBFg' WHERE id = 'c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60'; -- Stray Kids: 5-STAR
UPDATE products SET youtube_video_id = 'w4cTYnOPdNk' WHERE id = 'd1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61'; -- TWICE: CANDYBONG
UPDATE products SET youtube_video_id = 'ISnyONG1dEc' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62'; -- TXT: The Name Chapter
UPDATE products SET youtube_video_id = 'UBURTj20HXI' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63'; -- LE SSERAFIM: Unforgiven
UPDATE products SET youtube_video_id = 'D8VEhcPeSlc' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64'; -- aespa: Drama
UPDATE products SET youtube_video_id = 'XBwYJiEOmPo' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b65'; -- ENHYPEN: Orange Blood
UPDATE products SET youtube_video_id = 'dyRsYk0LyA8' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b66'; -- BLACKPINK: THE ALBUM
UPDATE products SET youtube_video_id = 'Amq-qlqbjYA' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b67'; -- ATEEZ: THE WORLD EP.FIN
UPDATE products SET youtube_video_id = 'pBvJT6AQpGM' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b68'; -- ITZY: KILL MY DOUBT
UPDATE products SET youtube_video_id = 'TQTlCHxyCv8' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b69'; -- Stray Kids: SKZOO Wolf Chan
UPDATE products SET youtube_video_id = 'N0UT6010aZk' WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b70'; -- IVE: MINE
UPDATE products SET youtube_video_id = 'mvpjZnig9Hw' WHERE id = 'a6c7d8e9-f0a1-42b3-8c4d-5e6f7a8b9c01'; -- IVE: I've IVE
UPDATE products SET youtube_video_id = 't9WRhA4Cq4M' WHERE id = 'b7d8e9f0-a1b2-43c4-8d5e-6f7a8b9c0d12'; -- BTS: Proof
UPDATE products SET youtube_video_id = 'nF7yRPisPiE' WHERE id = 'c8e9f0a1-b2c3-44d5-8e6f-7a8b9c0d1e23'; -- TWICE: BETWEEN 1&2
UPDATE products SET youtube_video_id = '3Bl1VQRaxG8' WHERE id = 'd9f0a1b2-c3d4-45e6-8f7a-8b9c0d1e2f34'; -- NCT 127: Ay-Yo
UPDATE products SET youtube_video_id = 'BV_pDej0LFI' WHERE id = 'e0a1b2c3-d4e5-46f7-8a8b-9c0d1e2f3a45'; -- BTS: Army Bomb Ver. 4

-- 3. Verificar resultado
SELECT id, name, artist,
  CASE WHEN youtube_video_id IS NOT NULL THEN '✓ ' || youtube_video_id ELSE '✗ NULL' END AS youtube_status
FROM products
ORDER BY artist, name;
