'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Ticket, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const CouponCard = styled.div`
    background: #fdf2f8; /* Pinkish background */
    border: 2px dashed #f472b6; /* Pink border */
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    margin-top: 1.5rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    overflow: hidden;

    &::before, &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
    }

    &::before { left: -10px; }
    &::after { right: -10px; }
`;

const Title = styled.h4`
    font-size: 1.1rem;
    font-weight: 700;
    color: #db2777;
    margin-bottom: 0.5rem;
`;

const Text = styled.p`
    font-size: 0.9rem;
    color: #831843;
    margin-bottom: 1rem;
`;

const CodeBox = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: #fff;
    border: 1px solid #f9a8d4;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 1.2rem;
    font-weight: 700;
    color: #db2777;
    cursor: pointer;
    margin: 0 auto;
    width: 100%;
    max-width: 300px;
    transition: all 0.2s;

    &:hover {
        background: #fff1f2;
        transform: scale(1.02);
    }
`;

export default function NextPurchaseCoupon() {
    const t = useTranslations('Gamification');
    const [copied, setCopied] = useState(false);
    const code = 'STANFAN5';

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <CouponCard>
            <Title>
                <Ticket size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                {t('couponTitle')}
            </Title>
            <Text>{t('couponText')}</Text>
            <CodeBox onClick={handleCopy}>
                {code}
                {copied ? <Check size={20} /> : <Copy size={20} />}
            </CodeBox>
        </CouponCard>
    );
}
