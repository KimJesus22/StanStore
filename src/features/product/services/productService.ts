import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';

// Maps each supported locale to the ordered list of description/name columns
// to try, first-to-last (COALESCE logic in application layer).
// This mirrors what you'd write in SQL as:
//   COALESCE(description_pt, description_en, description) AS description
const DESCRIPTION_FALLBACK: Record<string, Array<keyof Product>> = {
    'es':    ['description'],
    'en':    ['description_en', 'description'],
    'ko':    ['description_ko', 'description_en', 'description'],
    'pt-BR': ['description_pt', 'description_en', 'description'],
    'fr-CA': ['description_fr', 'description_en', 'description'],
};

const NAME_FALLBACK: Record<string, Array<keyof Product>> = {
    'es':    ['name'],
    'en':    ['name'],
    'ko':    ['name'],
    'pt-BR': ['name_pt', 'name'],
    'fr-CA': ['name_fr', 'name'],
};

function resolveField(
    product: Product,
    chain: Array<keyof Product>,
): string {
    for (const col of chain) {
        const val = product[col];
        if (typeof val === 'string' && val.trim() !== '') return val;
    }
    return '';
}

/** Returns a copy of the product with `name` and `description` resolved for the given locale. */
export function localizeProduct(product: Product, locale: string): Product {
    const descChain = DESCRIPTION_FALLBACK[locale] ?? DESCRIPTION_FALLBACK['en'];
    const nameChain = NAME_FALLBACK[locale]        ?? NAME_FALLBACK['en'];

    return {
        ...product,
        name:        resolveField(product, nameChain)        || product.name,
        description: resolveField(product, descChain)        || product.description,
    };
}

export const getProducts = unstable_cache(
    async (): Promise<Product[]> => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Skipping getProducts: Missing Supabase keys');
            return [];
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data as Product[];
    },
    ['getProducts'],
    {
        revalidate: 3600,
        tags: ['products'],
    }
);

export const getProductById = unstable_cache(
    async (id: string): Promise<Product | null> => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Skipping getProductById: Missing Supabase keys');
            return null;
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
        }

        return data as Product;
    },
    ['getProductById'],
    {
        revalidate: 3600,
        tags: ['products'],
    }
);

/**
 * Fetches a product by ID and resolves its localizable fields (name, description)
 * using a COALESCE-style fallback chain for the requested locale.
 *
 * Fallback order:
 *   pt-BR → description_pt → description_en → description
 *   fr-CA → description_fr → description_en → description
 *   ko    → description_ko → description_en → description
 *   en    → description_en → description
 *   es    → description
 */
export async function getProductByIdLocalized(
    id: string,
    locale: string,
): Promise<Product | null> {
    const product = await getProductById(id);
    if (!product) return null;
    return localizeProduct(product, locale);
}
