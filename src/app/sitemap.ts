import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stanstore.com';
    const locales = ['es', 'en', 'ko'];

    // Obtener todos los productos de Supabase
    const { data: products } = await supabase
        .from('products')
        .select('id, updated_at');

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Home Page for each locale
    locales.forEach(locale => {
        sitemapEntries.push({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        });
    });

    // Product pages for each locale
    (products || []).forEach((product) => {
        locales.forEach(locale => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/product/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });
    });

    return sitemapEntries;
}
