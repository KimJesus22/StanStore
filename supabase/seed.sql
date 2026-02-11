-- Insert initial data based on mockData.ts
INSERT INTO public.products (name, price, image_url, category, artist, is_new, description)
VALUES
  (
    'Map of the Soul: 7',
    29.99,
    '/images/mots7.jpg',
    'album',
    'BTS',
    FALSE,
    'El cuarto álbum de estudio de BTS, "Map of the Soul: 7", es un viaje introspectivo que explora los siete años de carrera del grupo. Incluye éxitos como "ON" y "Black Swan". Versión aleatoria.'
  ),
  (
    'NewJeans 2nd EP "Get Up"',
    24.50,
    '/images/getup.jpg',
    'album',
    'NewJeans',
    TRUE,
    'El segundo EP de NewJeans, "Get Up", presenta una mezcla refrescante de pop y R&B. Incluye las canciones "Super Shy", "ETA" y "Cool With You". El paquete incluye photobook y stickers.'
  ),
  (
    'Caratbong V3',
    55.00,
    '/images/caratbong.jpg',
    'lightstick',
    'Seventeen',
    TRUE,
    'La versión 3 del lightstick oficial de Seventeen. Cuenta con un diseño elegante y mayor brillo. Sincronizable con la app oficial para conciertos.'
  ),
  (
    'BORN PINK World Tour Hoodie',
    65.00,
    '/images/bp-hoodie.jpg',
    'merch',
    'BLACKPINK',
    FALSE,
    'Hoodie oficial del tour mundial BORN PINK de BLACKPINK. Fabricado con algodón de alta calidad, cómodo y estiloso. Diseño exclusivo del tour.'
  ),
  (
    '5-STAR (Limited Ver.)',
    32.00,
    '/images/5-star.jpg',
    'album',
    'Stray Kids',
    FALSE,
    'Edición limitada del álbum "5-STAR" de Stray Kids. Incluye photocards especiales, póster y beneficios de preventa. Un must-have para cualquier Stay.'
  ),
  (
    'CANDYBONG ∞',
    58.00,
    '/images/candybong.jpg',
    'lightstick',
    'TWICE',
    TRUE,
    'El nuevo lightstick oficial de TWICE, CANDYBONG Infinity. Diseño mejorado con panel táctil y nuevos modos de iluminación. Perfecto para iluminar los estadios.'
  );
