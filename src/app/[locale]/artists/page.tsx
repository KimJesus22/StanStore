import nextDynamic from 'next/dynamic';

const ArtistsContent = nextDynamic(() => import('./ArtistsContent'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function ArtistsPage() {
    return <ArtistsContent />;
}
