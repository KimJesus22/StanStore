import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = 'https://stan-store.com';
const LOCALES = ['es', 'en', 'ko'] as const;

// Páginas estáticas públicas con su prioridad y frecuencia de cambio
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}[] = [
  { path: '',         priority: 1.0, changeFrequency: 'daily'   },
  { path: '/artists', priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/proof',   priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/terms',   priority: 0.3, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Páginas estáticas (todas las locales) ──────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );

  // ── Páginas dinámicas de productos ─────────────────────────────────────────
  let productEntries: MetadataRoute.Sitemap = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .gt('stock', 0); // solo productos con stock activo

    if (products) {
      productEntries = LOCALES.flatMap((locale) =>
        products.map((product) => ({
          url: `${BASE_URL}/${locale}/product/${product.id}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        }))
      );
    }
  }

  return [...staticEntries, ...productEntries];
}
