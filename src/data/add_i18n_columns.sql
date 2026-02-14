-- Agregar columnas para descripciones en Inglés y Coreano
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ko TEXT;

-- Actualizar producto "Drama" de aespa con traducciones
UPDATE products
SET
    description_en = 'The fourth mini album by aespa. Includes the hit single "Drama" and showcases a more mature and powerful side of the group.',
    description_ko = 'aespa의 네 번째 미니 앨범. 히트 싱글 "Drama"가 포함되어 있으며 그룹의 더욱 성숙하고 파워풀한 면모를 보여줍니다.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64';

-- Actualizar producto "Get Up" de NewJeans
UPDATE products
SET
    description_en = 'The second EP by NewJeans, "Get Up", features a refreshing mix of pop and R&B. Includes songs "Super Shy", "ETA", and "Cool With You". Package includes photobook and stickers.',
    description_ko = 'NewJeans의 두 번째 EP "Get Up"은 팝과 R&B의 신선한 조화를 선보입니다. "Super Shy", "ETA", "Cool With You" 등의 곡이 수록되어 있습니다. 포토북과 스티커가 포함되어 있습니다.'
WHERE id = 'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d';
