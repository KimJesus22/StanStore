'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Download, Lock, Image as ImageIcon, Music, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

/* ─── Types ─── */

interface DigitalReward {
    id: string;
    title: string;
    description: string | null;
    category: string;
    preview_url: string | null;
    required_tier: 'BRONZE' | 'SILVER' | 'GOLD';
    file_size_bytes: number | null;
}

const TIER_RANK: Record<string, number> = { BRONZE: 0, SILVER: 1, GOLD: 2 };

const CATEGORY_CONFIG: Record<string, { icon: typeof ImageIcon; color: string; label: string }> = {
    wallpaper: { icon: ImageIcon, color: '#8B5CF6', label: 'Wallpaper' },
    ringtone: { icon: Music, color: '#EC4899', label: 'Ringtone' },
    pdf: { icon: FileText, color: '#F59E0B', label: 'PDF' },
};

const TIER_COLORS: Record<string, string> = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
};

/* ─── Animations ─── */

const fadeSlide = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */

const Container = styled.div`
    margin-top: 2rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
`;

const RewardCard = styled.div<{ $unlocked: boolean }>`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: ${({ $unlocked }) => ($unlocked ? '#fff' : '#fafafa')};
    border: 1px solid ${({ $unlocked }) => ($unlocked ? '#e5e7eb' : '#f0f0f0')};
    border-radius: 14px;
    animation: ${fadeSlide} 0.4s ease-out both;
    transition: all 0.2s;
    opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.7)};

    &:hover {
        ${({ $unlocked }) =>
        $unlocked
            ? `transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #d1d5db;`
            : ''}
    }
`;

const IconBox = styled.div<{ $color: string }>`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${({ $color }) => $color}15;
    color: ${({ $color }) => $color};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const RewardInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const RewardTitle = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const RewardMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.2rem;
`;

const RewardCategory = styled.span<{ $color: string }>`
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${({ $color }) => $color};
`;

const TierBadge = styled.span<{ $color: string }>`
    font-size: 0.65rem;
    font-weight: 700;
    color: ${({ $color }) => $color};
    background: ${({ $color }) => $color}15;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
`;

const DownloadBtn = styled.button<{ $color: string }>`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: ${({ $color }) => $color};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px ${({ $color }) => $color}40;
    }

    &:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: #888;
    font-size: 0.9rem;
`;

/* ─── Component ─── */

interface RewardsGalleryProps {
    userTier: string;
}

export default function RewardsGallery({ userTier }: RewardsGalleryProps) {
    const [rewards, setRewards] = useState<DigitalReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRewards() {
            try {
                const { data, error } = await supabase
                    .from('digital_rewards')
                    .select('id, title, description, category, preview_url, required_tier, file_size_bytes')
                    .order('required_tier', { ascending: true });

                if (error) {
                    console.error('Error fetching digital rewards:', error);
                } else {
                    setRewards(data || []);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchRewards();
    }, []);

    const handleDownload = async (rewardId: string, title: string) => {
        setDownloading(rewardId);
        try {
            // Open the download API route in a new tab
            // The route handles auth, tier check, and redirects to signed URL
            window.open(`/api/rewards/download?id=${rewardId}`, '_blank');
            toast.success(`Descargando "${title}"...`, { icon: '📥' });
        } catch {
            toast.error('Error al iniciar la descarga');
        } finally {
            // Small delay for UX
            setTimeout(() => setDownloading(null), 1000);
        }
    };

    if (loading) {
        return <EmptyState>Cargando recompensas...</EmptyState>;
    }

    if (rewards.length === 0) {
        return <EmptyState>No hay recompensas digitales disponibles aún.</EmptyState>;
    }

    const userRank = TIER_RANK[userTier] ?? 0;

    return (
        <Container>
            <Grid>
                {rewards.map((reward, index) => {
                    const config = CATEGORY_CONFIG[reward.category] || CATEGORY_CONFIG.wallpaper;
                    const Icon = config.icon;
                    const isUnlocked = userRank >= (TIER_RANK[reward.required_tier] ?? 0);
                    const tierColor = TIER_COLORS[reward.required_tier] || '#888';

                    return (
                        <RewardCard
                            key={reward.id}
                            $unlocked={isUnlocked}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <IconBox $color={config.color}>
                                <Icon size={20} />
                            </IconBox>

                            <RewardInfo>
                                <RewardTitle>{reward.title}</RewardTitle>
                                <RewardMeta>
                                    <RewardCategory $color={config.color}>
                                        {config.label}
                                    </RewardCategory>
                                    <TierBadge $color={tierColor}>
                                        {reward.required_tier}+
                                    </TierBadge>
                                </RewardMeta>
                            </RewardInfo>

                            <DownloadBtn
                                $color={isUnlocked ? config.color : '#e5e7eb'}
                                disabled={!isUnlocked || downloading === reward.id}
                                onClick={() => handleDownload(reward.id, reward.title)}
                                title={
                                    isUnlocked
                                        ? `Descargar ${reward.title}`
                                        : `Requiere nivel ${reward.required_tier}`
                                }
                            >
                                {downloading === reward.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isUnlocked ? (
                                    <Download size={16} />
                                ) : (
                                    <Lock size={14} />
                                )}
                            </DownloadBtn>
                        </RewardCard>
                    );
                })}
            </Grid>
        </Container>
    );
}
