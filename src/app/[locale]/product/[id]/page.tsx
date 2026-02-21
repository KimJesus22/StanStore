import { Metadata, ResolvingMetadata } from 'next';
import { cache } from 'react';

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

// ─── React.cache: deduplica la consulta dentro de un mismo request ───
const getCachedProduct = cache(async (id: string) => {
  return getProductById(id);
});

// ─── Utilidad: truncar texto a un máximo de caracteres ───
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await getCachedProduct(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | StanStore',
    };
  }

  // Descripción truncada a 160 caracteres (SEO best practice)
  const rawDesc = product.description
    || `Compra ${product.name} de ${product.artist} por $${product.price}.`;
  const description = truncate(rawDesc, 160);

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Comprar ${product.name} | StanStore`,
    description,
    alternates: {
      canonical: `/${locale}/product/${id}`,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}/product/${id}`])
      ),
    },
    openGraph: {
      title: `${product.name} – ${product.artist}`,
      description,
      url: `https://stan-store.com/${locale}/product/${id}`,
      siteName: 'StanStore',
      images: [
        {
          url: product.image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Comprar ${product.name} | StanStore`,
      description,
      images: [product.image_url],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const id = (await params).id;

  // Usa la misma función cacheada — no duplica la petición a Supabase
  const product = await getCachedProduct(id);

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: displayProduct.name,
    image: displayProduct.image_url,
    description:
      displayProduct.description ||
      `Compra ${displayProduct.name} de ${displayProduct.artist} en StanStore.`,
    offers: {
      '@type': 'Offer',
      price: displayProduct.price,
      priceCurrency: 'MXN',
      availability:
        displayProduct.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails
        product={displayProduct}
        reviewsSlot={
          <Suspense fallback={<ReviewsSkeleton />}>
            <ProductReviewsList productId={displayProduct.id} />
          </Suspense>
        }
      />
    </>
  );
}

