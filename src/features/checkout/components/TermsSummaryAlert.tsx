'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Ban, Plane } from 'lucide-react';

const AlertWrapper = styled.div`
    background-color: #fff8e1; /* Light amber/yellow background */
    border: 1px solid #ffe082;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const AlertTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #f57f17; /* Darker amber for title */
    margin-bottom: 1rem;
`;

const AlertList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const AlertItem = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: #5d4037; /* Dark brown for contrast */
    line-height: 1.4;

    svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: #f57f17;
    }
`;

export default function TermsSummaryAlert() {
    const t = useTranslations('TermsAlert');

    return (
        <AlertWrapper>
            <AlertTitle>
                <AlertTriangle size={20} />
                {t('title')}
            </AlertTitle>
            <AlertList>
                <AlertItem>
                    <AlertTriangle size={18} />
                    <span>{t('point1')}</span>
                </AlertItem>
                <AlertItem>
                    <Ban size={18} />
                    <span>{t('point2')}</span>
                </AlertItem>
                <AlertItem>
                    <Plane size={18} />
                    <span>{t('point3')}</span>
                </AlertItem>
            </AlertList>
        </AlertWrapper>
    );
}
