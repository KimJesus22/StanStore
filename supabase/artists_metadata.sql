-- ============================================================
-- artists_metadata.sql
-- Crea la tabla artists con todos sus metadatos: bio localizada
-- (JSONB), género musical, popularidad y fecha de debut.
-- Incluye RLS, índices y datos seed para los artistas principales.
-- ============================================================

-- 1. Crear tabla artists (idempotente)
CREATE TABLE IF NOT EXISTS public.artists (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name             TEXT        NOT NULL,
    bio              JSONB,      -- { "es": "...", "en": "...", "ko": "..." }
    image_url        TEXT,
    genre            TEXT,
    popularity_score INTEGER     CHECK (popularity_score BETWEEN 0 AND 100),
    debut_date       DATE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

-- 2. Row Level Security
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY no soporta IF NOT EXISTS — usamos DO para hacerlo idempotente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'artists'
          AND policyname = 'Lectura pública de artistas'
    ) THEN
        CREATE POLICY "Lectura pública de artistas"
            ON public.artists FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;
END
$$;

-- 3. Índices para filtrado y ordenación eficientes
CREATE INDEX IF NOT EXISTS idx_artists_genre      ON public.artists (genre);
CREATE INDEX IF NOT EXISTS idx_artists_popularity ON public.artists (popularity_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_artists_debut      ON public.artists (debut_date DESC NULLS LAST);

-- 4. Datos seed — artistas principales
INSERT INTO public.artists (id, name, bio, image_url, genre, popularity_score, debut_date)
VALUES
    (
        'a0000001-0000-0000-0000-000000000001',
        'BTS',
        '{"es": "Grupo de K-Pop surcoreano formado en 2013 bajo Big Hit Entertainment. Conocidos por su música poderosa y mensaje de amor propio.", "en": "South Korean K-Pop group formed in 2013 under Big Hit Entertainment. Known for their powerful music and self-love message.", "ko": "2013년 빅히트 엔터테인먼트 소속으로 결성된 대한민국 K-Pop 그룹. 강렬한 음악과 자기애 메시지로 유명합니다."}',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/BTS_at_the_2019_Melon_Music_Awards_from_D-icon.jpg/640px-BTS_at_the_2019_Melon_Music_Awards_from_D-icon.jpg',
        'K-Pop',
        99,
        '2013-06-13'
    ),
    (
        'a0000001-0000-0000-0000-000000000002',
        'BLACKPINK',
        '{"es": "Grupo femenino de K-Pop formado en 2016 bajo YG Entertainment. Una de las artistas coreanas más influyentes a nivel mundial.", "en": "South Korean girl group formed in 2016 under YG Entertainment. One of the most influential Korean artists worldwide.", "ko": "2016년 YG 엔터테인먼트 소속으로 결성된 대한민국 걸그룹. 전 세계에서 가장 영향력 있는 한국 아티스트 중 하나입니다."}',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Blackpink_logo.svg/640px-Blackpink_logo.svg.png',
        'K-Pop',
        97,
        '2016-08-08'
    ),
    (
        'a0000001-0000-0000-0000-000000000003',
        'NewJeans',
        '{"es": "Grupo femenino de K-Pop debutado en 2022 bajo ADOR. Conocidas por su sonido Y2K y su estética fresca y juvenil.", "en": "South Korean girl group that debuted in 2022 under ADOR. Known for their Y2K sound and fresh, youthful aesthetic.", "ko": "2022년 ADOR 소속으로 데뷔한 대한민국 걸그룹. Y2K 사운드와 신선하고 청량한 미학으로 유명합니다."}',
        NULL,
        'K-Pop',
        95,
        '2022-07-22'
    ),
    (
        'a0000001-0000-0000-0000-000000000004',
        'TWICE',
        '{"es": "Grupo femenino de K-Pop formado en 2015 bajo JYP Entertainment. Famosas por sus canciones pegadizas y coreografías sincronizadas.", "en": "South Korean girl group formed in 2015 under JYP Entertainment. Famous for their catchy songs and synchronized choreography.", "ko": "2015년 JYP 엔터테인먼트 소속으로 결성된 대한민국 걸그룹. 중독성 있는 노래와 칼군무로 유명합니다."}',
        NULL,
        'K-Pop',
        92,
        '2015-10-20'
    ),
    (
        'a0000001-0000-0000-0000-000000000005',
        'Seventeen',
        '{"es": "Grupo masculino de K-Pop formado en 2015 bajo Pledis Entertainment. Conocidos por producir y coreografiar su propia música.", "en": "South Korean boy group formed in 2015 under Pledis Entertainment. Known for producing and choreographing their own music.", "ko": "2015년 플레디스 엔터테인먼트 소속으로 결성된 대한민국 보이그룹. 자체 제작 및 안무로 유명합니다."}',
        NULL,
        'K-Pop',
        90,
        '2015-05-26'
    ),
    (
        'a0000001-0000-0000-0000-000000000006',
        'Stray Kids',
        '{"es": "Grupo masculino de K-Pop formado en 2018 bajo JYP Entertainment. Destacan por su enfoque en el hip-hop y su identidad artística propia.", "en": "South Korean boy group formed in 2018 under JYP Entertainment. Known for their hip-hop focus and distinct artistic identity.", "ko": "2018년 JYP 엔터테인먼트 소속으로 결성된 대한민국 보이그룹. 힙합 중심 음악과 독자적인 아티스트 정체성으로 주목받습니다."}',
        NULL,
        'K-Hip-Hop',
        88,
        '2017-03-25'
    ),
    (
        'a0000001-0000-0000-0000-000000000007',
        'aespa',
        '{"es": "Grupo femenino de K-Pop formado en 2020 bajo SM Entertainment. Pioneras del concepto de universo virtual con sus avatares digitales ''æ''.", "en": "South Korean girl group formed in 2020 under SM Entertainment. Pioneers of a virtual universe concept with their digital avatars ''æ''.", "ko": "2020년 SM 엔터테인먼트 소속으로 결성된 대한민국 걸그룹. 디지털 아바타 ''æ''를 통한 가상 세계관의 선구자입니다."}',
        NULL,
        'K-Pop',
        89,
        '2020-11-30'
    ),
    (
        'a0000001-0000-0000-0000-000000000008',
        'LE SSERAFIM',
        '{"es": "Grupo femenino de K-Pop debutado en 2022 bajo HYBE. Conocidas por su concepto poderoso y su mensaje de autosuperación.", "en": "South Korean girl group that debuted in 2022 under HYBE. Known for their powerful concept and message of self-empowerment.", "ko": "2022년 HYBE 소속으로 데뷔한 대한민국 걸그룹. 강렬한 콘셉트와 자기 극복의 메시지로 알려져 있습니다."}',
        NULL,
        'K-Pop',
        87,
        '2022-05-02'
    ),
    (
        'a0000001-0000-0000-0000-000000000009',
        'TOMORROW X TOGETHER',
        '{"es": "Grupo masculino de K-Pop formado en 2019 bajo HYBE. Exploran temas de adolescencia, crecimiento y universos narrativos únicos.", "en": "South Korean boy group formed in 2019 under HYBE. They explore themes of adolescence, growth, and unique narrative universes.", "ko": "2019년 HYBE 소속으로 결성된 대한민국 보이그룹. 청소년기, 성장, 독특한 세계관을 주제로 탐구합니다."}',
        NULL,
        'K-Pop',
        85,
        '2019-03-04'
    ),
    (
        'a0000001-0000-0000-0000-000000000010',
        'ENHYPEN',
        '{"es": "Grupo masculino de K-Pop formado en 2020 bajo BELIFT LAB. Surgidos del reality show ''I-Land'', exploran temáticas oscuras y vampíricas.", "en": "South Korean boy group formed in 2020 under BELIFT LAB. Born from the reality show ''I-Land'', they explore dark and vampiric themes.", "ko": "2020년 빌리프랩 소속으로 결성된 대한민국 보이그룹. 오디션 프로그램 ''I-Land'' 출신으로 어둡고 뱀파이어 같은 테마를 탐구합니다."}',
        NULL,
        'K-Pop',
        83,
        '2020-11-30'
    )
ON CONFLICT (id) DO UPDATE SET
    genre            = EXCLUDED.genre,
    popularity_score = EXCLUDED.popularity_score,
    debut_date       = EXCLUDED.debut_date,
    bio              = EXCLUDED.bio;
