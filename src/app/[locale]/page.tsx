import HomeContent from './HomeContent';

import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/features/product';

export const revalidate = 3600;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('homeTitle'),
    alternates: {
      canonical: `https://stan-store.com/${locale}`,
    },
  };
}

export default async function HomePage() {
  const products = await getProducts();
  return <HomeContent initialProducts={products} />;
}
