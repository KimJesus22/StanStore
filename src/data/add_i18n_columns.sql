-- Agregar columnas para descripciones en Inglés y Coreano
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ko TEXT;

-- Actualizar producto "Map of the Soul: 7"
UPDATE products
SET
    description_en = 'BTS fourth studio album, "Map of the Soul: 7", is an introspective journey exploring the group''s seven-year career. Includes hits like "ON" and "Black Swan". Random version.',
    description_ko = '방탄소년단의 네 번째 정규 앨범 "Map of the Soul: 7"은 그룹의 7년 경력을 탐구하는 내면적인 여정입니다. "ON", "Black Swan" 같은 히트곡이 포함되어 있습니다. 랜덤 버전.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b5c';

-- Actualizar producto "NewJeans 2nd EP Get Up"
UPDATE products
SET
    description_en = 'NewJeans'' second EP, "Get Up", features a refreshing blend of pop and R&B. Includes "Super Shy", "ETA", and "Cool With You". Package includes photobook and stickers.',
    description_ko = '뉴진스의 두 번째 EP "Get Up"은 팝과 R&B의 신선한 조화를 선보입니다. "Super Shy", "ETA", "Cool With You"가 포함되어 있습니다. 포토북과 스티커가 포함된 패키지입니다.'
WHERE id = 'f1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5d';

-- Actualizar producto "Caratbong V3"
UPDATE products
SET
    description_en = 'The official Seventeen lightstick version 3. Features a sleek design and increased brightness. Syncs with the official app for concerts.',
    description_ko = '세븐틴 공식 응원봉 버전 3. 세련된 디자인과 더 밝아진 밝기를 자랑합니다. 콘서트를 위한 공식 앱과 연동됩니다.'
WHERE id = 'a1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5e';

-- Actualizar producto "BORN PINK World Tour Hoodie"
UPDATE products
SET
    description_en = 'Official BLACKPINK BORN PINK World Tour Hoodie. Made with high-quality cotton, comfortable and stylish. Exclusive tour design.',
    description_ko = '블랙핑크 BORN PINK 월드 투어 공식 후드티. 고품질 면으로 제작되어 편안하고 스타일리시합니다. 독점 투어 디자인.'
WHERE id = 'b1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b5f';

-- Actualizar producto "5-STAR (Limited Ver.)"
UPDATE products
SET
    description_en = 'Limited edition of Stray Kids'' "5-STAR" album. Includes special photocards, poster, and pre-order benefits. A must-have for any Stay.',
    description_ko = '스트레이 키즈 "5-STAR" 앨범 한정판. 스페셜 포토카드, 포스터, 예약 판매 특전이 포함되어 있습니다. 스테이라면 놓칠 수 없는 아이템.'
WHERE id = 'c1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b60';

-- Actualizar producto "CANDYBONG ∞"
UPDATE products
SET
    description_en = 'The new official TWICE lightstick, CANDYBONG Infinity. Improved design with touch panel and new lighting modes. Perfect for lighting up stadiums.',
    description_ko = '트와이스의 새로운 공식 응원봉, 캔디봉 인피니티. 터치 패널과 새로운 조명 모드로 개선된 디자인. 경기장을 밝히기에 완벽합니다.'
WHERE id = 'd1b2c3d4-e5f6-47a8-8b9c-0d1e2f3a4b61';

-- Actualizar producto "The Name Chapter: FREEFALL"
UPDATE products
SET
    description_en = 'TOMORROW X TOGETHER''s third studio album. A conceptual exploration of youth and growth. Includes random photocard.',
    description_ko = '투모로우바이투게더의 세 번째 정규 앨범. 청춘과 성장에 대한 개념적 탐구. 랜덤 포토카드가 포함되어 있습니다.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b62';

-- Actualizar producto "LE SSERAFIM - Unforgiven"
UPDATE products
SET
    description_en = 'LE SSERAFIM''s first studio album. Shows the group''s determination to forge their own path regardless of what others say.',
    description_ko = '르세라핌의 첫 정규 앨범. 남들이 뭐라 하든 자신들만의 길을 개척하겠다는 그룹의 의지를 보여줍니다.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b63';

-- Actualizar producto "Drama - aespa"
UPDATE products
SET
    description_en = 'The fourth mini album by aespa. Includes the hit single "Drama" and showcases a more mature and powerful side of the group.',
    description_ko = 'aespa의 네 번째 미니 앨범. 히트 싱글 "Drama"가 포함되어 있으며 그룹의 더욱 성숙하고 파워풀한 면모를 보여줍니다.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b64';

-- Actualizar producto "ORANGE BLOOD"
UPDATE products
SET
    description_en = 'ENHYPEN''s fifth mini album. A continuation of their BLOOD series, exploring themes of love and sacrifice with a fresh sound.',
    description_ko = '엔하이픈의 다섯 번째 미니 앨범. BLOOD 시리즈의 연장선으로, 신선한 사운드로 사랑과 희생이라는 주제를 탐구합니다.'
WHERE id = 'e0a1c2d3-e4f5-46a7-8b9c-0d1e2f3a4b65';
