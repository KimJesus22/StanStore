-- 1. Habilitar extensión pg_net (necesaria para webhooks/edge functions)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- 2. Asegurar que la columna 'stock' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Asegurar que la columna 'youtube_video_id' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'youtube_video_id') THEN
        ALTER TABLE products ADD COLUMN youtube_video_id TEXT;
    END IF;
END $$;

-- 3. Insertar/Actualizar TODOS los productos (precios en MXN)
INSERT INTO products (id, name, price, image_url, category, artist, is_new, description, stock, youtube_video_id)
VALUES
    -- Productos Originales
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c',
        'Map of the Soul: 7',
        490,
        '/images/map-of-the-soul-7.jpg',
        'album',
        'BTS',
        false,
        'El cuarto álbum de estudio de BTS, "Map of the Soul: 7", es un viaje introspectivo que explora los siete años de carrera del grupo. Incluye éxitos como "ON" y "Black Swan". Versión aleatoria.',
        50,
        'mPVDGOVjRQ0'
    ),
    (
        'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d',
        'NewJeans 2nd EP "Get Up"',
        420,
        '/images/newjeans-get-up-haerin.jpg',
        'album',
        'NewJeans',
        true,
        'El segundo EP de NewJeans, "Get Up", presenta una mezcla refrescante de pop y R&B. Incluye las canciones "Super Shy", "ETA" y "Cool With You". El paquete incluye photobook y stickers.',
        20,
        'ArmDp-zijuc'
    ),
    (
        'a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e',
        'Caratbong V3',
        1200,
        '/images/caratbong-v3.png',
        'lightstick',
        'Seventeen',
        true,
        'La versión 3 del lightstick oficial de Seventeen. Cuenta con un diseño elegante y mayor brillo. Sincronizable con la app oficial para conciertos.',
        5,
        '-GQg25oP0S4'
    ),
    (
        'b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f',
        'BORN PINK World Tour Hoodie',
        1100,
        '/images/born-pink-hoodie.jpg',
        'merch',
        'BLACKPINK',
        false,
        'Hoodie oficial del tour mundial BORN PINK de BLACKPINK. Fabricado con algodón de alta calidad, cómodo y estiloso. Diseño exclusivo del tour.',
        25,
        'POe9SOEKotk'
    ),
    (
        'c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60',
        '5-STAR (Limited Ver.)',
        500,
        '/images/5-star-limited-ver.jpg',
        'album',
        'Stray Kids',
        false,
        'Edición limitada del álbum "5-STAR" de Stray Kids. Incluye photocards especiales, póster y beneficios de preventa. Un must-have para cualquier Stay.',
        100,
        'JsOOis4bBFg'
    ),
    (
        'd1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61',
        'CANDYBONG ∞',
        950,
        '/images/candybong.jpg',
        'lightstick',
        'TWICE',
        true,
        'El nuevo lightstick oficial de TWICE, CANDYBONG Infinity. Diseño mejorado con panel táctil y nuevos modos de iluminación. Perfecto para iluminar los estadios.',
        12,
        'w4cTYnOPdNk'
    ),

    -- Nuevos Productos (TXT, LE SSERAFIM, aespa, ENHYPEN)
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62',
        'The Name Chapter: FREEFALL',
        480,
        '/images/the-name-chapter-freefall.png',
        'album',
        'TXT',
        true,
        'El tercer álbum de estudio de TOMORROW X TOGETHER. Una exploración conceptual de la juventud y el crecimiento. Incluye photocard aleatoria.',
        45,
        'ISnyONG1dEc'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63',
        'LE SSERAFIM - Unforgiven 1st Studio Album',
        480,
        '/images/le-sserafim-unforgiven.jpg',
        'album',
        'LE SSERAFIM',
        false,
        'El primer álbum de estudio de LE SSERAFIM. Muestra la determinación del grupo de forjar su propio camino sin importar lo que digan los demás.',
        30,
        'UBURTj20HXI'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64',
        'Drama - The 4th Mini Album [Scene Ver.]',
        400,
        '/images/drama-the-4th-mini-album-scene-ver.jpg',
        'album',
        'aespa',
        true,
        'El cuarto mini álbum de aespa. Incluye el éxito principal "Drama" y muestra una faceta más madura y poderosa del grupo.',
        60,
        'D8VEhcPeSlc'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b65',
        'ORANGE BLOOD',
        420,
        '/images/orange-blood.png',
        'album',
        'ENHYPEN',
        true,
        'El quinto mini álbum de ENHYPEN. Una continuación de su serie BLOOD, explorando temas de amor y sacrificio con un sonido fresco.',
        55,
        'XBwYJiEOmPo'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b66',
        'THE ALBUM',
        490,
        '/images/the-album.webp',
        'album',
        'BLACKPINK',
        true,
        'El primer álbum de estudio completo de BLACKPINK. Incluye éxitos como "Lovesick Girls", "How You Like That" y colaboraciones con Selena Gomez y Cardi B.',
        80,
        'dyRsYk0LyA8'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b67',
        'THE WORLD EP.FIN : WILL',
        480,
        '/images/ateez-the-world-ep-fin-will.webp',
        'album',
        'ATEEZ',
        true,
        'El segundo álbum de estudio de ATEEZ, concluyendo la serie THE WORLD. Muestra su energía explosiva y versatilidad musical.',
        40,
        'Amq-qlqbjYA'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b68',
        'KILL MY DOUBT',
        400,
        '/images/kill-my-doubt.jpeg',
        'album',
        'ITZY',
        false,
        'El séptimo mini álbum de ITZY. Con el tema principal "CAKE", el álbum muestra la confianza y carisma característicos del grupo.',
        35,
        'pBvJT6AQpGM'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b69',
        'SKZOO Plush (Wolf Chan)',
        650,
        '/images/skzoo-plush-wolf-chan.webp',
        'merch',
        'Stray Kids',
        false,
        'Peluche oficial de SKZOO, personaje Wolf Chan (Bang Chan). Suave, adorable y perfecto para cualquier colección de STAY.',
        15,
        'TQTlCHxyCv8'
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b70',
        'I''VE MINE',
        450,
        '/images/ive-mine.jpg',
        'album',
        'IVE',
        true,
        'El primer EP de IVE. Explora la identidad y confianza con tres canciones principales: "Either Way", "Off The Record" y "Baddie".',
        50,
        'N0UT6010aZk'
    ),
    (
        'a6c7d8e9-f0a1-42b3-8c4d-5e6f7a8b9c01',
        'I''ve IVE',
        480,
        '/images/IVE-I´VE.webp',
        'album',
        'IVE',
        false,
        'El primer álbum de estudio completo de IVE. Incluye "Baddie", "Off The Record" y "Either Way". Un álbum que consolida la identidad artística del grupo con un sonido maduro y confiado.',
        45,
        'mvpjZnig9Hw'
    ),
    (
        'b7d8e9f0-a1b2-43c4-8d5e-6f7a8b9c0d12',
        'Proof',
        550,
        '/images/bts-proof.webp',
        'album',
        'BTS',
        false,
        'El álbum antología de BTS que celebra 9 años de carrera. Incluye "Yet To Come (The Most Beautiful Moment)" junto a éxitos clásicos. Edición de 3 CDs con fotolibro exclusivo.',
        60,
        't9WRhA4Cq4M'
    ),
    (
        'c8e9f0a1-b2c3-44d5-8e6f-7a8b9c0d1e23',
        'BETWEEN 1&2',
        420,
        '/images/BETWEEN 1&2.webp',
        'album',
        'TWICE',
        false,
        'El noveno mini álbum de TWICE. Con el tema principal "Talk that Talk", muestra la evolución musical del grupo con un sonido más maduro y sofisticado.',
        35,
        'nF7yRPisPiE'
    ),
    (
        'd9f0a1b2-c3d4-45e6-8f7a-8b9c0d1e2f34',
        'Ay-Yo (4th Album Repackage)',
        490,
        '/images/Ay-Yo (4th Album Repackage).jpg',
        'album',
        'NCT 127',
        false,
        'La reedición del cuarto álbum de estudio de NCT 127. Incluye la nueva canción "Ay-Yo" además de todos los temas de "2 Baddies". Muestra el estilo único y experimental del grupo.',
        40,
        '3Bl1VQRaxG8'
    ),
    (
        'e0a1b2c3-d4e5-46f7-8a8b-9c0d1e2f3a45',
        'Army Bomb Special Edition (Ver. 4)',
        1300,
        '/images/ARMY BOMB Ver 4 BTS Official Light Stick.webp',
        'lightstick',
        'BTS',
        true,
        'La versión 4 edición especial del Army Bomb, el lightstick oficial de BTS. Tecnología Bluetooth mejorada para sincronización en conciertos. Una pieza esencial para cualquier ARMY.',
        8,
        'BV_pDej0LFI'
    )
ON CONFLICT (id) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    artist = EXCLUDED.artist,
    youtube_video_id = EXCLUDED.youtube_video_id;
