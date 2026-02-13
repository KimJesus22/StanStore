-- Insertar nuevos productos (TXT, LE SSERAFIM, aespa)
-- Ejecutar en SQL Editor de Supabase: https://supabase.com/dashboard/project/jgwaooxpszriuregytvu/sql

INSERT INTO products (id, name, price, image_url, category, artist, is_new, description, stock)
VALUES 
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62',
        'The Name Chapter: FREEFALL',
        35.00,
        'https://placehold.co/600x600/333/FFF?text=TXT+FREEFALL',
        'album',
        'TXT',
        true,
        'El tercer álbum de estudio de TOMORROW X TOGETHER. Una exploración conceptual de la juventud y el crecimiento. Incluye photocard aleatoria.',
        45
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63',
        'UNFORGIVEN (3rd Mini Album)',
        28.50,
        'https://placehold.co/600x600/800000/FFF?text=LE+SSERAFIM',
        'album',
        'LE SSERAFIM',
        false,
        'El primer álbum de estudio de LE SSERAFIM. Muestra la determinación del grupo de forjar su propio camino sin importar lo que digan los demás.',
        30
    ),
    (
        'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64',
        'Drama (The 4th Mini Album)',
        26.00,
        'https://placehold.co/600x600/aa00ff/FFF?text=aespa+Drama',
        'album',
        'aespa',
        true,
        'El cuarto mini álbum de aespa. Incluye el éxito principal "Drama" y muestra una faceta más madura y poderosa del grupo.',
        60
    )
ON CONFLICT (id) DO NOTHING;
