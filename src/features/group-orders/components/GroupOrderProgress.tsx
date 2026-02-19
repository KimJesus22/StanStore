'use client';

import styled, { keyframes } from 'styled-components';
import { Users, Share2, Check, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

/* ─── Props ─── */

interface GroupOrderProgressProps {
    /** How many people have already joined */
    currentParticipants: number;
    /** Target that unlocks the cheaper shipping tier */
    targetParticipants: number;
    /**
     * What each participant currently pays for international shipping (MXN).
     * Derived from: totalShipping / currentParticipants.
     */
    currentEstimatedShipping: number;
    /** URL to copy when the user clicks "Compartir GO". Defaults to window.location.href */
    shareUrl?: string;
}

/* ─── Styled Components ─── */

const Card = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    background: ${({ theme }) => theme.colors.secondaryBackground};
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const ProgressTrack = styled.div`
    width: 100%;
    height: 10px;
    background: ${({ theme }) => theme.colors.border};
    border-radius: 99px;
    overflow: hidden;
`;

const shimmer = keyframes`
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
`;

const ProgressFill = styled.div<{ $pct: number; $complete: boolean }>`
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${({ $complete }) =>
        $complete
            ? 'linear-gradient(90deg, #16a34a, #22c55e)'
            : 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)'};
    background-size: 200% auto;
    animation: ${shimmer} 2.5s linear infinite;
`;

const ParticipantRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
`;

const ParticipantCount = styled.span`
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};

    em {
        font-style: normal;
        color: ${({ theme }) => theme.colors.textMuted};
        font-weight: 400;
    }
`;

const ShippingCallout = styled.div<{ $improved: boolean }>`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    line-height: 1.5;
    background: ${({ $improved }) => ($improved ? '#f0fdf4' : '#faf5ff')};
    border: 1px solid ${({ $improved }) => ($improved ? '#bbf7d0' : '#e9d5ff')};
    color: ${({ $improved }) => ($improved ? '#15803d' : '#6b21a8')};
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
`;

const CalloutIcon = styled.span`
    flex-shrink: 0;
    margin-top: 1px;
`;

const ShareButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.65rem 1rem;
    border: 1.5px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;

    &:hover {
        background: ${({ theme }) => theme.colors.border};
    }

    &[data-copied='true'] {
        border-color: #16a34a;
        color: #16a34a;
    }
`;

/* ─── Component ─── */

export default function GroupOrderProgress({
    currentParticipants,
    targetParticipants,
    currentEstimatedShipping,
    shareUrl,
}: GroupOrderProgressProps) {
    const { formatPrice } = useCurrency();
    const [copied, setCopied] = useState(false);

    const pct = Math.min(100, Math.round((currentParticipants / targetParticipants) * 100));
    const isComplete = currentParticipants >= targetParticipants;

    // Derive total shipping from current state, then compute target per-person cost
    const totalShipping = currentEstimatedShipping * currentParticipants;
    const shippingAtTarget = totalShipping / targetParticipants;

    const needed = Math.max(0, targetParticipants - currentParticipants);

    const handleShare = async () => {
        const url = shareUrl ?? window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for browsers that block clipboard without user gesture
            prompt('Copia este enlace:', url);
        }
    };

    return (
        <Card>
            <Header>
                <Users size={14} />
                Pedido Grupal
            </Header>

            {/* Progress bar */}
            <div>
                <ProgressTrack>
                    <ProgressFill $pct={pct} $complete={isComplete} />
                </ProgressTrack>

                <ParticipantRow style={{ marginTop: '0.5rem' }}>
                    <ParticipantCount>
                        {currentParticipants} <em>de {targetParticipants} participantes</em>
                    </ParticipantCount>
                    <ParticipantCount>{pct}%</ParticipantCount>
                </ParticipantRow>
            </div>

            {/* Dynamic shipping callout */}
            {isComplete ? (
                <ShippingCallout $improved>
                    <CalloutIcon><Check size={15} /></CalloutIcon>
                    <span>
                        ¡Meta alcanzada! Envío internacional estimado:{' '}
                        <strong>{formatPrice(shippingAtTarget)} MXN</strong> por persona.
                    </span>
                </ShippingCallout>
            ) : (
                <ShippingCallout $improved={false}>
                    <CalloutIcon><TrendingDown size={15} /></CalloutIcon>
                    <span>
                        Envío internacional estimado:{' '}
                        <strong>{formatPrice(currentEstimatedShipping)} MXN</strong>.{' '}
                        {needed > 0 && (
                            <>
                                ¡Si se unen{' '}
                                <strong>
                                    {needed} persona{needed !== 1 ? 's' : ''} más
                                </strong>
                                , bajará a{' '}
                                <strong>{formatPrice(shippingAtTarget)} MXN</strong>!
                            </>
                        )}
                    </span>
                </ShippingCallout>
            )}

            {/* Share CTA */}
            <ShareButton data-copied={copied} onClick={handleShare}>
                {copied ? (
                    <>
                        <Check size={15} />
                        ¡Enlace copiado!
                    </>
                ) : (
                    <>
                        <Share2 size={15} />
                        Compartir GO
                    </>
                )}
            </ShareButton>
        </Card>
    );
}
