-- 1. Asegurar que la columna 'stock' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Insertar/Actualizar TODOS los productos para asegurar stock correcto
INSERT INTO products (id, name, price, image_url, category, artist, is_new, description, stock)
VALUES 
    -- Productos Originales (Restaurando Stock)
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c',
        'Map of the Soul: 7',
        29.99,
        '/images/map-of-the-soul-7.jpg',
        'album',
        'BTS',
        false,
        'El cuarto álbum de estudio de BTS, "Map of the Soul: 7", es un viaje introspectivo que explora los siete años de carrera del grupo. Incluye éxitos como "ON" y "Black Swan". Versión aleatoria.',
        50
    ),
    (
        'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d',
        'NewJeans 2nd EP "Get Up"',
        24.50,
        '/images/newjeans-get-up-haerin.jpg',
        'album',
        'NewJeans',
        true,
        'El segundo EP de NewJeans, "Get Up", presenta una mezcla refrescante de pop y R&B. Incluye las canciones "Super Shy", "ETA" y "Cool With You". El paquete incluye photobook y stickers.',
        20
    ),
    (
        'a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e',
        'Caratbong V3',
        55.00,
        '/images/caratbong-v3.png',
        'lightstick',
        'Seventeen',
        true,
        'La versión 3 del lightstick oficial de Seventeen. Cuenta con un diseño elegante y mayor brillo. Sincronizable con la app oficial para conciertos.',
        5
    ),
    (
        'b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f',
        'BORN PINK World Tour Hoodie',
        65.00,
        '/images/born-pink-hoodie.jpg',
        'merch',
        'BLACKPINK',
        false,
        'Hoodie oficial del tour mundial BORN PINK de BLACKPINK. Fabricado con algodón de alta calidad, cómodo y estiloso. Diseño exclusivo del tour.',
        0
    ),
    (
        'c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60',
        '5-STAR (Limited Ver.)',
        32.00,
        '/images/5-star-limited-ver.jpg',
        'album',
        'Stray Kids',
        false,
        'Edición limitada del álbum "5-STAR" de Stray Kids. Incluye photocards especiales, póster y beneficios de preventa. Un must-have para cualquier Stay.',
        100
    ),
    (
        'd1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61',
        'CANDYBONG ∞',
        58.00,
        '/images/candybong.jpg',
        'lightstick',
        'TWICE',
        true,
        'El nuevo lightstick oficial de TWICE, CANDYBONG Infinity. Diseño mejorado con panel táctil y nuevos modos de iluminación. Perfecto para iluminar los estadios.',
        12
    ),
    
    -- Nuevos Productos (TXT, LE SSERAFIM, aespa, ENHYPEN)
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62',
        'The Name Chapter: FREEFALL',
        35.00,
        '/images/The Name Chapter FREEFALL.png',
        'album',
        'TXT',
        true,
        'El tercer álbum de estudio de TOMORROW X TOGETHER. Una exploración conceptual de la juventud y el crecimiento. Incluye photocard aleatoria.',
        45
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63',
        'LE SSERAFIM - Unforgiven 1st Studio Album',
        28.50,
        '/images/LE SSERAFIM 1st Studio Album UNFORGIVEN.jpg',
        'album',
        'LE SSERAFIM',
        false,
        'El primer álbum de estudio de LE SSERAFIM. Muestra la determinación del grupo de forjar su propio camino sin importar lo que digan los demás.',
        30
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64',
        'Drama - The 4th Mini Album [Scene Ver.]',
        26.00,
        '/images/Drama - The 4th Mini Album [Scene Ver.].jpg',
        'album',
        'aespa',
        true,
        'El cuarto mini álbum de aespa. Incluye el éxito principal "Drama" y muestra una faceta más madura y poderosa del grupo.',
        60
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b65',
        'ORANGE BLOOD',
        32.00,
        'https://placehold.co/600x600/ff8800/FFF?text=ENHYPEN+ORANGE+BLOOD',
        'album',
        'ENHYPEN',
        true,
        'El quinto mini álbum de ENHYPEN. Una continuación de su serie BLOOD, explorando temas de amor y sacrificio con un sonido fresco.',
        55
    )
ON CONFLICT (id) DO UPDATE SET 
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    artist = EXCLUDED.artist;
