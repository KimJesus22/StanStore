'use client';

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Share2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocale } from 'next-intl';

/* ─── Styled Components ─── */

const ShareWrapper = styled.div`
    margin-top: 1.5rem;
`;

const ShareBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    &:active {
        transform: translateY(0);
    }
`;

const BonusText = styled.span`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors?.textMuted || '#888'};
    margin-top: 0.35rem;
    display: block;
`;

/* ─── Component ─── */

interface ShareButtonProps {
    productId: string;
    productName: string;
    userId: string | null;
}

export default function ShareButton({ productId, productName, userId }: ShareButtonProps) {
    const locale = useLocale();

    const generateRefUrl = useCallback(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        return `${baseUrl}/${locale}/product/${productId}?ref=${userId}`;
    }, [locale, productId, userId]);

    const handleShare = useCallback(async () => {
        if (!userId) {
            toast.error('Inicia sesión para compartir tu enlace de referido');
            return;
        }

        const url = generateRefUrl();
        const shareData = {
            title: `${productName} - StanStore`,
            text: `¡Mira este producto increíble! 🎶✨`,
            url,
        };

        try {
            // Use Web Share API if available (mobile browsers)
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
                toast.success('¡Enlace compartido!', { icon: '🎉' });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(url);
                toast.success('¡Enlace copiado al portapapeles!', {
                    icon: '📋',
                    style: {
                        border: '1px solid #667eea',
                        padding: '16px',
                    },
                });
            }
        } catch (err) {
            // User cancelled share or clipboard failed
            if ((err as Error).name !== 'AbortError') {
                // Final fallback
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success('¡Enlace copiado!', { icon: '📋' });
                } catch {
                    toast.error('No se pudo copiar el enlace');
                }
            }
        }
    }, [userId, generateRefUrl, productName]);

    // Don't render if user is not logged in
    if (!userId) return null;

    return (
        <ShareWrapper>
            <ShareBtn onClick={handleShare} type="button">
                <Gift size={18} />
                Compartir y Ganar
                <Share2 size={16} />
            </ShareBtn>
            <BonusText>
                Gana +50 puntos por cada compra desde tu enlace 🎁
            </BonusText>
        </ShareWrapper>
    );
}
