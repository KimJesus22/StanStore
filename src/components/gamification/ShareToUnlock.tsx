'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Twitter, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

const Card = styled.div`
    background: #fff;
    border: 1px solid #eee;
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    margin-top: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    max-width: 500px;
    width: 100%;
`;

const Title = styled.h3`
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #111;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
`;

const SocialButton = styled.a<{ $bg: string; $color: string }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    transition: transform 0.2s, opacity 0.2s;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }
`;

const CopyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    background: #fff;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #f9f9f9;
        border-color: #ccc;
    }
`;

export default function ShareToUnlock() {
    const t = useTranslations('Gamification');
    const [copied, setCopied] = useState(false);

    // In a real app, this would be the actual product URL or store URL
    const urlToShare = typeof window !== 'undefined' ? window.location.origin : '';
    const shareText = t('shareText');

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} ${urlToShare}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(urlToShare)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + urlToShare)}`;

    return (
        <Card>
            <Title>{t('shareTitle')}</Title>
            <ButtonGroup>
                <SocialButton href={twitterUrl} target="_blank" rel="noopener noreferrer" $bg="#000" $color="#fff">
                    <Twitter size={18} fill="#fff" />
                    Twitter / X
                </SocialButton>
                <SocialButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" $bg="#25D366" $color="#fff">
                    <MessageCircle size={18} />
                    WhatsApp
                </SocialButton>
                <CopyButton onClick={handleCopy}>
                    {copied ? <Check size={18} color="green" /> : <LinkIcon size={18} />}
                    {copied ? t('copied') : t('copy')}
                </CopyButton>
            </ButtonGroup>
        </Card>
    );
}
