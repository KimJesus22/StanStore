'use client';

import styled from 'styled-components';
import { Link } from '@/navigation';
import { Facebook, Instagram, Twitter, Music } from 'lucide-react';


const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 4rem 2rem 2rem;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ContentGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.9;
  line-height: 1.6;
  max-width: 300px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
  text-decoration: none;
  transition: color 0.2s;
  width: fit-content;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: auto; /* Center in mobile */
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialIcon = styled.a`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const Copyright = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-size: 0.9rem;
`;

export default function Footer() {
  // const t = useTranslations('Footer'); // Assuming translation keys exist, otherwise fallback or generic logic uses hardcoded for now based on user request "Stan Store"
  const year = new Date().getFullYear();

  return (
    <FooterContainer>
      <ContentGrid>
        {/* Columna 1: Marca */}
        <Column>
          <Brand>
            <Logo href="/">
              <Music size={24} color="#10CFBD" />
              StanStore
            </Logo>
            <Description>
              Tu tienda de confianza para merch de K-pop. Encuentra los mejores álbumes, lightsticks y accesorios de tus idols favoritos.
            </Description>
          </Brand>
        </Column>

        {/* Columna 2: Enlaces Rápidos */}
        <Column>
          <ColumnTitle>Enlaces Rápidos</ColumnTitle>
          <FooterLink href="/">Inicio</FooterLink>
          <FooterLink href="/artists">Catálogo</FooterLink>
          <FooterLink href="/profile">Mi Cuenta</FooterLink>
          <FooterLink href="/track-order">Rastrear Pedido</FooterLink>
        </Column>

        {/* Columna 3: Legal y Social */}
        <Column>
          <ColumnTitle>Legal</ColumnTitle>
          <FooterLink href="/terms">Términos y Condiciones</FooterLink>
          <FooterLink href="/privacy">Política de Privacidad</FooterLink>

          <ColumnTitle style={{ marginTop: '1rem' }}>Síguenos</ColumnTitle>
          <SocialLinks>
            <SocialIcon href="https://www.facebook.com/profile.php?id=61588123330439" target="_blank" aria-label="Facebook">
              <Facebook size={20} />
            </SocialIcon>
            <SocialIcon href="https://instagram.com" target="_blank" aria-label="Instagram">
              <Instagram size={20} />
            </SocialIcon>
            <SocialIcon href="https://twitter.com" target="_blank" aria-label="Twitter">
              <Twitter size={20} />
            </SocialIcon>
          </SocialLinks>
        </Column>
      </ContentGrid>

      <Copyright>
        &copy; {year} StanStore. Todos los derechos reservados.
      </Copyright>
    </FooterContainer>
  );
}
