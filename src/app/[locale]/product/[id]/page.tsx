import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

import {
  ProductDetails,
  getProductById,
  ProductReviewsList,
  ReviewsSkeleton
} from '@/features/product';
import { mockProducts } from '@/data/mockData';

import { locales } from '@/navigation';
import { Suspense } from 'react';

export const dynamicParams = true; // Permitir productos nuevos bajo demanda

export async function generateStaticParams() {
  // Desactivado temporalmente para build, permitir renderizado bajo demanda
  return [];
}

type Props = {
  params: Promise<{ id: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | StanStore',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description: `Compra ${product.name} de ${product.artist} por $${product.price}. ${product.description || ''}`,
    openGraph: {
      title: `${product.name} - ${product.artist}`,
      description: `Consigue ${product.name} al mejor precio en StanStore.`,
      images: [
        product.image_url,
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Compra ${product.name} de ${product.artist} por $${product.price}`,
      images: [product.image_url],
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const id = (await params).id;

  const product = await getProductById(id);

  let displayProduct = product;

  // Fallback to mockData for translations if missing in DB
  if (product) {
    const mockProduct = mockProducts.find((p) => p.id === product.id);
    if (mockProduct) {
      displayProduct = {
        ...product,
        description_en: product.description_en || mockProduct.description_en,
        description_ko: product.description_ko || mockProduct.description_ko,
      };
    }
  }

  // Handle case where product is null (not found) to avoid crash in ProductDetails if it doesn't handle null
  if (!displayProduct) {
    // Basic 404 handling if not present
    return <div>Producto no encontrado</div>;
  }

  return (
    <ProductDetails
      product={displayProduct}
      reviewsSlot={
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviewsList productId={displayProduct.id} />
        </Suspense>
      }
    />
  );
}
