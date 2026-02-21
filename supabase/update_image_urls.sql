-- Actualizar image_url para que coincidan con los archivos reales en public/images/
-- Ejecutar en Supabase SQL Editor

UPDATE products SET image_url = '/images/ARMY BOMB Ver 4 BTS Official Light Stick.webp'
WHERE id = 'e0a1b2c3-d4e5-46f7-8a8b-9c0d1e2f3a45';

UPDATE products SET image_url = '/images/Ay-Yo (4th Album Repackage).jpg'
WHERE id = 'd9f0a1b2-c3d4-45e6-8f7a-8b9c0d1e2f34';

UPDATE products SET image_url = '/images/IVE-I´VE.webp'
WHERE id = 'a6c7d8e9-f0a1-42b3-8c4d-5e6f7a8b9c01';

UPDATE products SET image_url = '/images/BETWEEN 1&2.webp'
WHERE id = 'c8e9f0a1-b2c3-44d5-8e6f-7a8b9c0d1e23';

-- Correcciones adicionales (extensiones reales vs. seed anterior)
UPDATE products SET image_url = '/images/the-album.webp'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b66';

UPDATE products SET image_url = '/images/ateez-the-world-ep-fin-will.webp'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b67';

UPDATE products SET image_url = '/images/bts-proof.webp'
WHERE id = 'b7d8e9f0-a1b2-43c4-8d5e-6f7a8b9c0d12';

UPDATE products SET image_url = '/images/skzoo-plush-wolf-chan.webp'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b69';

UPDATE products SET image_url = '/images/kill-my-doubt.jpeg'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b68';

-- Verificar resultados
SELECT id, name, image_url FROM products ORDER BY name;
