'use server';

import { supabase } from '@/lib/supabaseClient';

// ── Tipos de retorno ──────────────────────────────────────────────────────────

export interface SearchSuggestion {
  query: string;
  frequency: number;
}

export interface SearchProduct {
  id: string;
  name: string;
  artist: string;
  image_url: string;
  price: number;
  sim_score: number;
}

export interface SearchSuggestionsResult {
  suggestions: string[];
  products: SearchProduct[];
}

// ── Server Action ─────────────────────────────────────────────────────────────

export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestionsResult> {
  const normalized = query.trim().toLowerCase();

  // Evitar consultas innecesarias para términos muy cortos
  if (normalized.length < 2) {
    return { suggestions: [], products: [] };
  }

  // Consulta A y B en paralelo — no hay dependencia entre ellas
  const [suggestionsResult, productsResult] = await Promise.all([
    // A: Términos populares del historial que coincidan con el prefijo
    supabase
      .from('search_queries')
      .select('query, frequency')
      .ilike('query', `${normalized}%`)   // coincidencia de prefijo (usa índice btree)
      .order('frequency', { ascending: false })
      .limit(3),

    // B: Productos reales con tolerancia a errores tipográficos (pg_trgm)
    supabase
      .rpc('fuzzy_search_products', { search_term: normalized })
      .limit(3),
  ]);

  const suggestions: string[] =
    suggestionsResult.data?.map((r: SearchSuggestion) => r.query) ?? [];

  const products: SearchProduct[] =
    productsResult.data?.map((p: SearchProduct) => ({
      id: p.id,
      name: p.name,
      artist: p.artist,
      image_url: p.image_url,
      price: p.price,
      sim_score: p.sim_score,
    })) ?? [];

  return { suggestions, products };
}
