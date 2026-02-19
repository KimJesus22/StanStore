'use client';

import styled from 'styled-components';
import { useFormatter, useNow } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import {
    Info,
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
} from 'lucide-react';

/* ─── Types ─── */

export type GoUpdateStatusType = 'INFO' | 'WARNING' | 'SUCCESS' | 'DELAY';

export interface GoUpdate {
    id: string;
    title: string;
    content: string;
    image_url?: string | null;
    status_type: GoUpdateStatusType;
    created_at: string; // ISO-8601
}

/* ─── Status config ─── */

const STATUS_CONFIG: Record<
    GoUpdateStatusType,
    { color: string; bg: string; border: string; Icon: typeof Info }
> = {
    INFO:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: Info },
    WARNING: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: AlertTriangle },
    SUCCESS: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
    DELAY:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: Clock },
};

/* ─── Styled Components ─── */

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
`;

const EmptyState = styled.p`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textMuted};
    text-align: center;
    padding: 2rem 0;
`;

/* Each row = node + connector line + card */
const Row = styled.div`
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 0 1rem;
`;

const ColumnLeft = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

/* Colored circle with icon */
const Node = styled.div<{ $color: string; $bg: string; $border: string }>`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $bg }) => $bg};
    border: 2px solid ${({ $border }) => $border};
    color: ${({ $color }) => $color};
    z-index: 1;
`;

/* Vertical connector between nodes */
const Connector = styled.div<{ $last: boolean }>`
    flex: 1;
    width: 2px;
    background: ${({ theme, $last }) =>
        $last ? 'transparent' : theme.colors.border};
    margin: 4px 0;
    min-height: 16px;
`;

/* Update card */
const Card = styled.div<{ $border: string }>`
    margin-bottom: 1.5rem;
    padding: 1rem 1.125rem;
    border: 1px solid ${({ $border }) => $border};
    border-radius: 12px;
    background: ${({ theme }) => theme.colors.secondaryBackground};
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const Title = styled.h3`
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    line-height: 1.3;
`;

const DateLabel = styled.time`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
    flex-shrink: 0;
`;

const Content = styled.p`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap; /* respeta saltos de línea en el texto */
`;

/* Thumbnail */
const Thumbnail = styled.button`
    margin-top: 0.75rem;
    display: block;
    width: 100%;
    max-width: 260px;
    border-radius: 8px;
    overflow: hidden;
    cursor: zoom-in;
    border: none;
    padding: 0;
    background: none;
    position: relative;
    aspect-ratio: 16 / 9;
`;

/* ─── Lightbox ─── */

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
`;

const LightboxImg = styled.div`
    position: relative;
    max-width: min(90vw, 800px);
    max-height: 85vh;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    z-index: 1;

    &:hover { background: rgba(0, 0, 0, 0.85); }
`;

/* ─── Date formatting helper ─── */

function FormattedDate({ dateStr }: { dateStr: string }) {
    const now = useNow({ updateInterval: 60_000 }); // refreshes every minute
    const format = useFormatter();

    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Show relative for recent updates (< 7 days), absolute for older ones
    const label =
        diffDays < 7
            ? format.relativeTime(date, now)
            : format.dateTime(date, { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <DateLabel dateTime={dateStr} title={date.toLocaleString()}>
            {label}
        </DateLabel>
    );
}

/* ─── Component ─── */

export default function TimelineUpdates({ updates }: { updates: GoUpdate[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null);

    if (updates.length === 0) {
        return <EmptyState>Aún no hay actualizaciones para este GO.</EmptyState>;
    }

    return (
        <>
            <Wrapper>
                {updates.map((update, i) => {
                    const { color, bg, border, Icon } = STATUS_CONFIG[update.status_type];
                    const isLast = i === updates.length - 1;

                    return (
                        <Row key={update.id}>
                            {/* Left: node + connector */}
                            <ColumnLeft>
                                <Node $color={color} $bg={bg} $border={border}>
                                    <Icon size={13} strokeWidth={2.5} />
                                </Node>
                                <Connector $last={isLast} />
                            </ColumnLeft>

                            {/* Right: card */}
                            <Card $border={border}>
                                <CardHeader>
                                    <Title>{update.title}</Title>
                                    <FormattedDate dateStr={update.created_at} />
                                </CardHeader>

                                <Content>{update.content}</Content>

                                {update.image_url && (
                                    <Thumbnail
                                        onClick={() => setLightbox(update.image_url!)}
                                        aria-label="Ampliar imagen"
                                    >
                                        <Image
                                            src={update.image_url}
                                            alt={update.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 260px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </Thumbnail>
                                )}
                            </Card>
                        </Row>
                    );
                })}
            </Wrapper>

            {/* Lightbox */}
            {lightbox && (
                <Backdrop onClick={() => setLightbox(null)}>
                    <LightboxImg onClick={e => e.stopPropagation()}>
                        <CloseBtn
                            onClick={() => setLightbox(null)}
                            aria-label="Cerrar imagen"
                        >
                            <X size={16} />
                        </CloseBtn>
                        <Image
                            src={lightbox}
                            alt="Vista ampliada"
                            fill
                            sizes="90vw"
                            style={{ objectFit: 'contain' }}
                        />
                    </LightboxImg>
                </Backdrop>
            )}
        </>
    );
}
