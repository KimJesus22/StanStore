import type { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

export interface RecommendationCriteria {
  /** Artista más frecuente en el historial. Null si el historial está vacío. */
  targetArtist: string | null;
  /** Categoría más frecuente en el historial. Null si el historial está vacío. */
  targetCategory: string | null;
  /** IDs de productos ya vistos (para excluirlos de los resultados). */
  excludeIds: string[];
}

/**
 * Cuenta las ocurrencias de cada valor en un array de strings y
 * devuelve el valor con mayor frecuencia.
 * En caso de empate, gana el que apareció primero (índice más bajo).
 */
function mostFrequent(values: string[]): string | null {
  if (values.length === 0) return null;

  const freq: Record<string, number> = {};
  for (const v of values) {
    freq[v] = (freq[v] ?? 0) + 1;
  }

  let best = values[0];
  for (const [value, count] of Object.entries(freq)) {
    if (count > (freq[best] ?? 0)) best = value;
  }

  return best;
}

/**
 * Analiza el historial de productos vistos y devuelve los criterios
 * de recomendación: artista favorito temporal, categoría favorita temporal
 * e IDs a excluir.
 *
 * Ejemplo:
 *   historial = [
 *     { artistId: 'BTS', categoryId: 'album', ... },
 *     { artistId: 'BTS', categoryId: 'album', ... },
 *     { artistId: 'BTS', categoryId: 'merch', ... },
 *     { artistId: 'TWICE', categoryId: 'lightstick', ... },
 *   ]
 *   → { targetArtist: 'BTS', targetCategory: 'album', excludeIds: [...] }
 */
export function getRecommendationCriteria(
  history: RecentlyViewedItem[],
): RecommendationCriteria {
  return {
    targetArtist:   mostFrequent(history.map((i) => i.artistId)),
    targetCategory: mostFrequent(history.map((i) => i.categoryId)),
    excludeIds:     history.map((i) => i.productId),
  };
}
