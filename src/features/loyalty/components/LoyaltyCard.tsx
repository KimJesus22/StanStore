'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Trophy, Star, Zap, Gift, Shield, Crown, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

const RewardsGallery = dynamic(() => import('./RewardsGallery'), {
    ssr: false,
    loading: () => <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>Cargando descargas...</div>,
});

/* ─── Tier Configuration ─── */

const TIER_CONFIG = {
    BRONZE: {
        label: 'Bronze',
        emoji: '🥉',
        color: '#CD7F32',
        gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
        glowColor: 'rgba(205, 127, 50, 0.3)',
        nextTier: 'SILVER' as const,
        minGos: 0,
        maxGos: 2,
        pointsForNext: 300,  // 3 GOs × 100 pts
        rewards: [
            { icon: '🎵', label: 'Acceso a Group Orders' },
            { icon: '📦', label: 'Seguimiento de pedidos' },
        ],
    },
    SILVER: {
        label: 'Silver',
        emoji: '🥈',
        color: '#C0C0C0',
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
        glowColor: 'rgba(192, 192, 192, 0.3)',
        nextTier: 'GOLD' as const,
        minGos: 3,
        maxGos: 9,
        pointsForNext: 1000, // 10 GOs × 100 pts
        rewards: [
            { icon: '🎵', label: 'Acceso a Group Orders' },
            { icon: '📦', label: 'Seguimiento de pedidos' },
            { icon: '⚡', label: 'Acceso anticipado a GOs' },
            { icon: '🎁', label: '+50 pts por referido' },
        ],
    },
    GOLD: {
        label: 'Gold',
        emoji: '🥇',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        glowColor: 'rgba(255, 215, 0, 0.4)',
        nextTier: null,
        minGos: 10,
        maxGos: Infinity,
        pointsForNext: Infinity,
        rewards: [
            { icon: '🎵', label: 'Acceso a Group Orders' },
            { icon: '📦', label: 'Seguimiento prioritario' },
            { icon: '⚡', label: 'Acceso anticipado a GOs' },
            { icon: '🎁', label: '+50 pts por referido' },
            { icon: '👑', label: 'Envío prioritario doméstico' },
            { icon: '🌟', label: 'Descuentos exclusivos Gold' },
        ],
    },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

/* ─── Animations ─── */

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */

const CardContainer = styled.div<{ $tierColor: string; $glowColor: string }>`
    background: #fff;
    border-radius: 20px;
    padding: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
    border: 1px solid #eee;
`;

const CardHeader = styled.div<{ $gradient: string }>`
    background: ${({ $gradient }) => $gradient};
    padding: 2rem 2.5rem;
    color: #fff;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
        );
        background-size: 200% 100%;
        animation: ${shimmer} 3s infinite;
    }
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
`;

const TierBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const TierEmoji = styled.span`
    font-size: 2.5rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const TierInfo = styled.div``;

const TierLabel = styled.div`
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.9;
`;

const TierName = styled.div`
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: 1px;
`;

const PointsDisplay = styled.div`
    text-align: right;
    position: relative;
    z-index: 1;
`;

const PointsValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
`;

const PointsLabel = styled.div`
    font-size: 0.8rem;
    opacity: 0.85;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const CardBody = styled.div`
    padding: 2rem 2.5rem;
`;

/* ─── Progress Section ─── */

const ProgressSection = styled.div`
    margin-bottom: 2rem;
`;

const ProgressHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
`;

const ProgressTitle = styled.span`
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const ProgressCount = styled.span`
    font-size: 0.85rem;
    color: #888;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 10px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
`;

const ProgressBarFill = styled.div<{ $width: number; $color: string }>`
    height: 100%;
    width: ${({ $width }) => $width}%;
    background: ${({ $color }) => $color};
    border-radius: 10px;
    transition: width 1s ease-out;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        background-size: 200% 100%;
        animation: ${shimmer} 2s infinite;
    }
`;

const ProgressText = styled.div`
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.5rem;
    text-align: right;
`;

/* ─── Stats Section ─── */

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div<{ $accentColor: string }>`
    background: #fafafa;
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    border: 1px solid #f0f0f0;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${({ $accentColor }) => $accentColor}20;
        border-color: ${({ $accentColor }) => $accentColor}40;
    }
`;

const StatIcon = styled.div<{ $color: string }>`
    color: ${({ $color }) => $color};
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: center;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: #111;
`;

const StatLabel = styled.div`
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.25rem;
`;

/* ─── Rewards Section ─── */

const RewardsTitle = styled.h4`
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RewardsList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const RewardItem = styled.div<{ $unlocked: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    background: ${({ $unlocked }) => ($unlocked ? '#f0fdf4' : '#fafafa')};
    border: 1px solid ${({ $unlocked }) => ($unlocked ? '#bbf7d0' : '#f0f0f0')};
    border-radius: 10px;
    font-size: 0.85rem;
    color: ${({ $unlocked }) => ($unlocked ? '#166534' : '#aaa')};
    font-weight: ${({ $unlocked }) => ($unlocked ? '500' : '400')};
    transition: all 0.2s;
`;

const RewardEmoji = styled.span`
    font-size: 1.25rem;
`;

const LoadingSkeleton = styled.div`
    background: #fff;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    text-align: center;
    color: #888;
`;

/* ─── Component ─── */

interface UserRewards {
    loyalty_points: number;
    completed_gos: number;
    tier_level: TierKey;
}

interface LoyaltyCardProps {
    userId: string;
}

export default function LoyaltyCard({ userId }: LoyaltyCardProps) {
    const [rewards, setRewards] = useState<UserRewards | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRewards() {
            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from('user_rewards')
                    .select('loyalty_points, completed_gos, tier_level')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching rewards:', error);
                    // If user_rewards row doesn't exist yet, show defaults
                    setRewards({ loyalty_points: 0, completed_gos: 0, tier_level: 'BRONZE' });
                } else {
                    setRewards(data as UserRewards);
                }
            } catch (err) {
                console.error('Error:', err);
                setRewards({ loyalty_points: 0, completed_gos: 0, tier_level: 'BRONZE' });
            } finally {
                setLoading(false);
            }
        }

        fetchRewards();
    }, [userId]);

    if (loading) {
        return <LoadingSkeleton>Cargando programa de lealtad...</LoadingSkeleton>;
    }

    if (!rewards) return null;

    const tier = TIER_CONFIG[rewards.tier_level] || TIER_CONFIG.BRONZE;
    const nextTierConfig = tier.nextTier ? TIER_CONFIG[tier.nextTier] : null;

    // Progress calculation
    let progressPercent = 100;
    let gosRemaining = 0;
    let pointsRemaining = 0;

    if (nextTierConfig) {
        const totalNeeded = nextTierConfig.minGos - tier.minGos;
        const completed = rewards.completed_gos - tier.minGos;
        progressPercent = Math.min(100, Math.max(0, (completed / totalNeeded) * 100));
        gosRemaining = nextTierConfig.minGos - rewards.completed_gos;
        pointsRemaining = gosRemaining * 100;
    }

    // All possible rewards across all tiers
    const allRewards = TIER_CONFIG.GOLD.rewards;
    const unlockedRewards = tier.rewards;

    return (
        <CardContainer $tierColor={tier.color} $glowColor={tier.glowColor}>
            <CardHeader $gradient={tier.gradient}>
                <HeaderTop>
                    <TierBadge>
                        <TierEmoji>{tier.emoji}</TierEmoji>
                        <TierInfo>
                            <TierLabel>Status Actual</TierLabel>
                            <TierName>{tier.label}</TierName>
                        </TierInfo>
                    </TierBadge>
                    <PointsDisplay>
                        <PointsValue>{rewards.loyalty_points.toLocaleString()}</PointsValue>
                        <PointsLabel>Puntos</PointsLabel>
                    </PointsDisplay>
                </HeaderTop>
            </CardHeader>

            <CardBody>
                {/* Progress to Next Tier */}
                {nextTierConfig && (
                    <ProgressSection>
                        <ProgressHeader>
                            <ProgressTitle>
                                <TrendingUp size={16} />
                                Progreso a {nextTierConfig.label} {nextTierConfig.emoji}
                            </ProgressTitle>
                            <ProgressCount>
                                {rewards.completed_gos} / {nextTierConfig.minGos} GOs
                            </ProgressCount>
                        </ProgressHeader>
                        <ProgressBarContainer>
                            <ProgressBarFill
                                $width={progressPercent}
                                $color={tier.color}
                            />
                        </ProgressBarContainer>
                        <ProgressText>
                            {gosRemaining > 0
                                ? `Faltan ${gosRemaining} GO${gosRemaining > 1 ? 's' : ''} (${pointsRemaining} pts) para ${nextTierConfig.label}`
                                : `¡Ya cumples los requisitos para ${nextTierConfig.label}!`
                            }
                        </ProgressText>
                    </ProgressSection>
                )}

                {/* If already GOLD */}
                {!nextTierConfig && (
                    <ProgressSection>
                        <ProgressHeader>
                            <ProgressTitle>
                                <Crown size={16} />
                                ¡Nivel Máximo Alcanzado!
                            </ProgressTitle>
                        </ProgressHeader>
                        <ProgressBarContainer>
                            <ProgressBarFill $width={100} $color={tier.color} />
                        </ProgressBarContainer>
                        <ProgressText>
                            Disfruta de todas las recompensas Gold 👑
                        </ProgressText>
                    </ProgressSection>
                )}

                {/* Stats Grid */}
                <StatsGrid>
                    <StatCard $accentColor={tier.color}>
                        <StatIcon $color={tier.color}>
                            <Star size={22} />
                        </StatIcon>
                        <StatValue>{rewards.loyalty_points.toLocaleString()}</StatValue>
                        <StatLabel>Puntos Totales</StatLabel>
                    </StatCard>
                    <StatCard $accentColor="#10CFBD">
                        <StatIcon $color="#10CFBD">
                            <Zap size={22} />
                        </StatIcon>
                        <StatValue>{rewards.completed_gos}</StatValue>
                        <StatLabel>GOs Completados</StatLabel>
                    </StatCard>
                    <StatCard $accentColor="#667eea">
                        <StatIcon $color="#667eea">
                            <Gift size={22} />
                        </StatIcon>
                        <StatValue>{unlockedRewards.length}</StatValue>
                        <StatLabel>Recompensas</StatLabel>
                    </StatCard>
                </StatsGrid>

                {/* Rewards Section */}
                <RewardsTitle>
                    <Shield size={18} />
                    Recompensas Disponibles
                </RewardsTitle>
                <RewardsList>
                    {allRewards.map((reward, index) => {
                        const isUnlocked = unlockedRewards.some(
                            (r) => r.label === reward.label
                        );
                        return (
                            <RewardItem key={index} $unlocked={isUnlocked}>
                                <RewardEmoji style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                                    {reward.icon}
                                </RewardEmoji>
                                {reward.label}
                                {!isUnlocked && ' 🔒'}
                            </RewardItem>
                        );
                    })}
                </RewardsList>

                {/* Digital Rewards Downloads */}
                <RewardsTitle style={{ marginTop: '2rem' }}>
                    <Download size={18} />
                    Descargas Digitales
                </RewardsTitle>
                <RewardsGallery userTier={rewards.tier_level} />
            </CardBody>
        </CardContainer>
    );
}
