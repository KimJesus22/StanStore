'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #111;
  color: #fff;
  padding: 1.5rem;
  z-index: 9999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Text = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  
  a {
    color: #4FD1C5;
    text-decoration: underline;
    &:hover {
      text-decoration: none;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: opacity 0.2s;

  background-color: ${props => props.variant === 'primary' ? '#10CFBD' : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#111' : '#fff'};
  border: ${props => props.variant === 'primary' ? 'none' : '1px solid #fff'};

  &:hover {
    opacity: 0.9;
  }
`;

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const t = useTranslations('CookieBanner');

  useEffect(() => {
    // Check consent on mount (client-side only)
    const consent = localStorage.getItem('NEXT_COOKIE_CONSENT');

    // Only show if no consent is found
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('NEXT_COOKIE_CONSENT', 'true');
    setShow(false);
    // Optional: Trigger analytics or reload if needed
    // window.location.reload(); 
  };

  const handleDecline = () => {
    localStorage.setItem('NEXT_COOKIE_CONSENT', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <Banner>
      <Text>
        {t.rich('message', {
          link: (chunks: React.ReactNode) => <Link href="/privacy">{chunks}</Link>
        })}
      </Text>
      <ButtonGroup>
        <Button variant="secondary" onClick={handleDecline}>{t('decline')}</Button>
        <Button variant="primary" onClick={handleAccept}>{t('accept')}</Button>
      </ButtonGroup>
    </Banner>
  );
}
