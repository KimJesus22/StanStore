'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS   = 10;

export interface RecentlyViewedItem {
  productId:  string;
  categoryId: string;
  artistId:   string;
  viewedAt:   number; // timestamp ms
}

function readFromStorage(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: RecentlyViewedItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Fallo silencioso si localStorage está lleno o deshabilitado
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Carga inicial en el cliente (evita hydration mismatch)
  useEffect(() => {
    setItems(readFromStorage());
  }, []);

  const addViewedProduct = useCallback(
    (productId: string, categoryId: string, artistId: string) => {
      setItems((prev) => {
        // Elimina entrada previa del mismo producto (dedup)
        const filtered = prev.filter((i) => i.productId !== productId);

        // Inserta al inicio (más reciente primero) y recorta a MAX_ITEMS (FIFO)
        const updated: RecentlyViewedItem[] = [
          { productId, categoryId, artistId, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ITEMS);

        writeToStorage(updated);
        return updated;
      });
    },
    [],
  );

  const clearHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setItems([]);
  }, []);

  return { items, addViewedProduct, clearHistory };
}
