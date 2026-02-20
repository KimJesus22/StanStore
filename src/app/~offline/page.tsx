import { Metadata } from 'next';
import OfflineContent from './OfflineContent';

export const metadata: Metadata = {
    title: 'Sin Conexión | FanShield Store',
};

export default function OfflinePage() {
    return <OfflineContent />;
}
