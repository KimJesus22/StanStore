'use client';

import styled, { keyframes } from 'styled-components';
import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, X, Package } from 'lucide-react';

/* ─── Types ─── */

interface ProofUpdate {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    group_orders: { title?: string } | null;
}

interface ProofGridProps {
    updates: ProofUpdate[];
    totalDelivered: number;
}

/* ─── Styled Components ─── */

const Page = styled.main`
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
`;

/* ── Hero badge ── */

const HeroSection = styled.section`
    text-align: center;
    margin-bottom: 3rem;
`;

const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    border-radius: 999px;
    padding: 0.45rem 1.1rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #15803d;
    margin-bottom: 1.25rem;
`;

const HeroTitle = styled.h1`
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 0.75rem;
    line-height: 1.2;
`;

const HeroSub = styled.p`
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textMuted};
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.6;
`;

/* ── Masonry-style grid ── */

const Grid = styled.div`
    columns: 3 240px;
    column-gap: 1rem;
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const Tile = styled.button`
    display: block;
    width: 100%;
    break-inside: avoid;
    margin-bottom: 1rem;
    border: none;
    padding: 0;
    background: none;
    cursor: zoom-in;
    border-radius: 12px;
    overflow: hidden;
    animation: ${fadeIn} 0.4s ease both;

    &:hover img { transform: scale(1.04); }
`;

const TileImg = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;

    img { transition: transform 0.3s ease; }
`;

const TileCaption = styled.div`
    background: ${({ theme }) => theme.colors.secondaryBackground};
    padding: 0.6rem 0.75rem;
    text-align: left;
`;

const TileTitle = styled.p`
    font-size: 0.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TileGo = styled.p`
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

/* ── Empty state ── */

const Empty = styled.div`
    text-align: center;
    padding: 4rem 1rem;
    color: ${({ theme }) => theme.colors.textMuted};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
`;

/* ── Lightbox ── */

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
`;

const LightboxContent = styled.div`
    position: relative;
    max-width: min(92vw, 900px);
    width: 100%;
`;

const LightboxImg = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    overflow: hidden;
`;

const LightboxCaption = styled.div`
    margin-top: 0.75rem;
    text-align: center;
    color: #fff;
`;

const LightboxTitle = styled.h2`
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 2px;
`;

const LightboxSub = styled.p`
    font-size: 0.8rem;
    color: rgba(255,255,255,0.65);
    margin: 0;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: -14px;
    right: -14px;
    background: #fff;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #111;
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;

/* ─── Component ─── */

export default function ProofGrid({ updates, totalDelivered }: ProofGridProps) {
    const [selected, setSelected] = useState<ProofUpdate | null>(null);

    return (
        <Page>
            {/* Hero */}
            <HeroSection>
                <Badge>
                    <CheckCircle2 size={14} />
                    Más de {totalDelivered} pedido{totalDelivered !== 1 ? 's' : ''} entregado{totalDelivered !== 1 ? 's' : ''} exitosamente en México
                </Badge>
                <HeroTitle>Prueba de entrega real</HeroTitle>
                <HeroSub>
                    Cada foto es de un pedido grupal que llegó a manos de un fan en México.
                    Sin trucos — solo mercancía real.
                </HeroSub>
            </HeroSection>

            {/* Grid */}
            {updates.length === 0 ? (
                <Empty>
                    <Package size={40} strokeWidth={1.2} />
                    Aún no hay entregas registradas. ¡Vuelve pronto!
                </Empty>
            ) : (
                <Grid>
                    {updates.map((u, i) => (
                        <Tile
                            key={u.id}
                            onClick={() => setSelected(u)}
                            aria-label={`Ver entrega: ${u.title}`}
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            <TileImg>
                                <Image
                                    src={u.image_url}
                                    alt={u.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </TileImg>
                            <TileCaption>
                                <TileTitle>{u.title}</TileTitle>
                                <TileGo>{u.group_orders?.title ?? ''}</TileGo>
                            </TileCaption>
                        </Tile>
                    ))}
                </Grid>
            )}

            {/* Lightbox */}
            {selected && (
                <Backdrop onClick={() => setSelected(null)}>
                    <LightboxContent onClick={e => e.stopPropagation()}>
                        <CloseBtn onClick={() => setSelected(null)} aria-label="Cerrar">
                            <X size={16} />
                        </CloseBtn>
                        <LightboxImg>
                            <Image
                                src={selected.image_url}
                                alt={selected.title}
                                fill
                                sizes="90vw"
                                style={{ objectFit: 'contain' }}
                            />
                        </LightboxImg>
                        <LightboxCaption>
                            <LightboxTitle>{selected.title}</LightboxTitle>
                            <LightboxSub>{selected.group_orders?.title}</LightboxSub>
                        </LightboxCaption>
                    </LightboxContent>
                </Backdrop>
            )}
        </Page>
    );
}
