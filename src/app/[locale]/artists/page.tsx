import { Metadata } from 'next';
import ArtistsContent from './ArtistsContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `https://stan-store.com/${locale}/artists`,
    },
  };
}

export default function ArtistsPage() {
    return <ArtistsContent />;
}
