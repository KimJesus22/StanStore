'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
// import { useTranslations } from 'next-intl';
import Link from 'next/link';

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
    color: #10CFBD;
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
  // const t = useTranslations('CookieBanner'); // Assuming we'll add these keys or use fallbacks

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent === null) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
    window.location.reload(); // Reload to activate scripts
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <Banner>
      <Text>
        Usamos cookies para mejorar tu experiencia y analizar nuestro tráfico. Al continuar, aceptas nuestra <Link href="/privacy">Política de Privacidad</Link>.
      </Text>
      <ButtonGroup>
        <Button variant="secondary" onClick={handleDecline}>Rechazar</Button>
        <Button variant="primary" onClick={handleAccept}>Aceptar Todas</Button>
      </ButtonGroup>
    </Banner>
  );
}
