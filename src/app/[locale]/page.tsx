import HomeContent from './HomeContent';

import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

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

export default function HomePage() {
  return <HomeContent />;
}
