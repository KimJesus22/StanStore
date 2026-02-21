-- Actualizar/insertar todos los productos con image_url correctas
-- Ejecutar en Supabase SQL Editor

INSERT INTO public.products (id, name, price, image_url, category, artist, is_new, description, stock, spotify_album_id, theme_color, youtube_video_id)
VALUES
  -- BTS - Map of the Soul: 7
  ('e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c', 'Map of the Soul: 7', 490, '/images/map-of-the-soul-7.jpg', 'album', 'BTS', false,
   'El cuarto álbum de estudio de BTS. Incluye éxitos como "ON" y "Black Swan". Versión aleatoria.',
   50, NULL, NULL, 'mPVDGOVjRQ0'),

  -- NewJeans - Get Up
  ('f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d', 'NewJeans 2nd EP "Get Up"', 420, '/images/newjeans-get-up-haerin.jpg', 'album', 'NewJeans', true,
   'El segundo EP de NewJeans. Incluye "Super Shy", "ETA" y "Cool With You".',
   20, NULL, NULL, 'ArmDp-zijuc'),

  -- Seventeen - Caratbong V3
  ('a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e', 'Caratbong V3', 1200, '/images/caratbong-v3.png', 'lightstick', 'Seventeen', true,
   'La versión 3 del lightstick oficial de Seventeen. Sincronizable con la app oficial para conciertos.',
   5, NULL, NULL, '-GQg25oP0S4'),

  -- BLACKPINK - Born Pink Hoodie
  ('b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f', 'BORN PINK World Tour Hoodie', 1100, '/images/born-pink-hoodie.jpg', 'merch', 'BLACKPINK', false,
   'Hoodie oficial del tour mundial BORN PINK de BLACKPINK.',
   25, NULL, NULL, 'POe9SOEKotk'),

  -- Stray Kids - 5-STAR
  ('c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60', '5-STAR (Limited Ver.)', 500, '/images/5-star-limited-ver.jpg', 'album', 'Stray Kids', false,
   'Edición limitada del álbum "5-STAR" de Stray Kids. Incluye photocards especiales y póster.',
   100, NULL, NULL, 'JsOOis4bBFg'),

  -- TWICE - CANDYBONG
  ('d1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61', 'CANDYBONG ∞', 950, '/images/candybong.jpg', 'lightstick', 'TWICE', true,
   'El lightstick oficial de TWICE con panel táctil y nuevos modos de iluminación.',
   12, NULL, NULL, 'w4cTYnOPdNk'),

  -- TXT - FREEFALL
  ('e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62', 'The Name Chapter: FREEFALL', 480, '/images/the-name-chapter-freefall.png', 'album', 'TXT', true,
   'El tercer álbum de estudio de TOMORROW X TOGETHER. Incluye photocard aleatoria.',
   45, NULL, NULL, 'ISnyONG1dEc'),

  -- LE SSERAFIM - UNFORGIVEN
  ('e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63', 'UNFORGIVEN (1st Studio Album)', 480, '/images/le-sserafim-unforgiven.jpg', 'album', 'LE SSERAFIM', false,
   'El primer álbum de estudio de LE SSERAFIM.',
   30, NULL, NULL, 'UBURTj20HXI'),

  -- aespa - Drama
  ('e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64', 'Drama - The 4th Mini Album [Scene Ver.]', 400, '/images/drama-the-4th-mini-album-scene-ver.jpg', 'album', 'aespa', true,
   'El cuarto mini álbum de aespa. Incluye el éxito principal "Drama".',
   60, NULL, NULL, 'D8VEhcPeSlc'),

  -- ENHYPEN - Orange Blood
  ('e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b65', 'ORANGE BLOOD', 420, '/images/orange-blood.png', 'album', 'ENHYPEN', true,
   'El quinto mini álbum de ENHYPEN. Continuación de su serie BLOOD.',
   55, NULL, NULL, 'XBwYJiEOmPo'),

  -- BLACKPINK - THE ALBUM
  ('f2b3c4d5-e6f7-48a9-9b0c-1d2e3f4a5b66', 'THE ALBUM', 490, '/images/the-album.webp', 'album', 'BLACKPINK', false,
   'El primer álbum completo de BLACKPINK. Incluye "How You Like That" y "Lovesick Girls".',
   40, NULL, NULL, 'dyRsYk0LyA8'),

  -- Stray Kids - SKZOO Plush
  ('93b4c5d6-e7f8-49a0-0b1c-2d3e4f5a6b77', 'SKZOO Plush (Wolf Chan)', 650, '/images/skzoo-plush-wolf-chan.webp', 'merch', 'Stray Kids', false,
   'Peluche oficial de SKZOO, personaje Wolf Chan (Bang Chan).',
   15, NULL, NULL, 'PokW8Zf_bLg'),

  -- ITZY - Kill My Doubt
  ('c4b5c6d7-e8f9-50a1-1b2c-3d4e5f6a7b88', 'KILL MY DOUBT', 400, '/images/kill-my-doubt.jpeg', 'album', 'ITZY', true,
   'El séptimo mini álbum de ITZY. Incluye la canción principal "CAKE".',
   35, NULL, NULL, 'Ea5Ea1240aQ'),

  -- ATEEZ - THE WORLD
  ('d5b6c7d8-e9f0-51a2-2b3c-4d5e6f7a8b99', 'THE WORLD EP.FIN : WILL', 480, '/images/ateez-the-world-ep-fin-will.webp', 'album', 'ATEEZ', true,
   'El segundo álbum de estudio de ATEEZ, concluyendo la serie THE WORLD.',
   50, NULL, NULL, 'Lp787qBbeVg'),

  -- BTS - Proof (imagen corregida: bts-proof.webp)
  ('b7d8e9f0-a1b2-43c4-8d5e-6f7a8b9c0d12', 'Proof', 550, '/images/bts-proof.webp', 'album', 'BTS', false,
   'El álbum antología de BTS que celebra 9 años de carrera. Edición de 3 CDs con fotolibro exclusivo.',
   60, NULL, NULL, 't9WRhA4Cq4M'),

  -- IVE - I'VE MINE (nuevo producto)
  ('f1a2b3c4-d5e6-47f8-9a0b-1c2d3e4f5a67', 'I''VE MINE (1st EP)', 420, '/images/ive-mine.jpg', 'album', 'IVE', true,
   'El primer EP de IVE. Incluye el exitoso sencillo "After LIKE".',
   45, NULL, NULL, 'F0BNFnJjDiw')

ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  price      = EXCLUDED.price,
  image_url  = EXCLUDED.image_url,
  category   = EXCLUDED.category,
  artist     = EXCLUDED.artist,
  is_new     = EXCLUDED.is_new,
  description = EXCLUDED.description,
  stock      = EXCLUDED.stock,
  youtube_video_id = EXCLUDED.youtube_video_id;
