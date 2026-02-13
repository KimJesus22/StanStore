-- 1. Ensure columns exist (Schema Migration)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS spotify_album_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS theme_color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;

-- 2. Insert/Update data
INSERT INTO public.products (id, name, price, image_url, category, artist, is_new, description, spotify_album_id, theme_color, youtube_video_id)
VALUES
  (
    'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c',
    'Map of the Soul: 7 - Ver. 4',
    28.00,
    '/images/map-of-the-soul-7.jpg',
    'Albums',
    'BTS',
    TRUE,
    'El álbum más personal de BTS hasta la fecha.',
    NULL, NULL, NULL
  ),
  (
    'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d',
    'NewJeans 2nd EP "Get Up"',
    24.50,
    '/images/newjeans-get-up-haerin.jpg',
    'album',
    'NewJeans',
    TRUE,
    'El segundo EP de NewJeans, "Get Up", presenta una mezcla refrescante de pop y R&B. Incluye las canciones "Super Shy", "ETA" y "Cool With You". El paquete incluye photobook y stickers.',
    NULL, NULL, NULL
  ),
  (
    'a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e',
    'Caratbong V3',
    55.00,
    '/images/caratbong-v3.png',
    'lightstick',
    'Seventeen',
    TRUE,
    'La versión 3 del lightstick oficial de Seventeen. Cuenta con un diseño elegante y mayor brillo. Sincronizable con la app oficial para conciertos.',
    NULL, NULL, NULL
  ),
  (
    'b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f',
    'BORN PINK World Tour Hoodie',
    65.00,
    '/images/born-pink-hoodie.jpg',
    'merch',
    'BLACKPINK',
    FALSE,
    'Hoodie oficial del tour mundial BORN PINK de BLACKPINK. Fabricado con algodón de alta calidad, cómodo y estiloso. Diseño exclusivo del tour.',
    NULL, NULL, NULL
  ),
  (
    'c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60',
    '5-STAR (Limited Ver.)',
    32.00,
    '/images/5-star-limited-ver.jpg',
    'album',
    'Stray Kids',
    FALSE,
    'Edición limitada del álbum "5-STAR" de Stray Kids. Incluye photocards especiales, póster y beneficios de preventa. Un must-have para cualquier Stay.',
    NULL, NULL, NULL
  ),
  (
    'd1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61',
    'CANDYBONG ∞',
    58.00,
    '/images/candybong.jpg',
    'lightstick',
    'TWICE',
    TRUE,
    'El nuevo lightstick oficial de TWICE, CANDYBONG Infinity. Diseño mejorado con panel táctil y nuevos modos de iluminación. Perfecto para iluminar los estadios.',
    NULL, NULL, NULL
  ),
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'Clancy',
    35.00,
    '/images/clancy-twenty-one-pilots.jpg',
    'album',
    'Twenty One Pilots',
    TRUE,
    'El esperado nuevo álbum de Twenty One Pilots, Clancy. Cierra la narrativa de Dema con un sonido explosivo y visuales inmersivos.',
    '50e50235b2a9d8001e3bd6e4', -- Spotify Album ID (Clancy)
    '#FCE300', -- Yellow/Red Theme
    'UcfZ9s39z40' -- Overcompensate MV
  )
ON CONFLICT (id) DO UPDATE SET 
  spotify_album_id = EXCLUDED.spotify_album_id,
  theme_color = EXCLUDED.theme_color,
  youtube_video_id = EXCLUDED.youtube_video_id;
