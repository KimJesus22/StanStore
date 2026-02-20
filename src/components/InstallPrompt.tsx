'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

// Definición de tipos para el evento beforeinstallprompt no estándar
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallBanner = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.text}; // Usually dark
  color: ${({ theme }) => theme.colors.background}; // Usually light
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  font-weight: bold;
  font-size: 1rem;
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const InstallButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 0.5rem;
  
  &:hover {
    opacity: 1;
  }
`;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevenir que el navegador muestre el prompt nativo inmediatamente
      e.preventDefault();
      // Guardar el evento para dispararlo después
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar nuestra UI personalizada
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Ocultar nuestra UI
    setIsVisible(false);

    // Mostrar el prompt nativo
    await deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
    } else {
      console.log('Usuario dechazó la instalación');
    }

    // El evento ya no sirve, limpiar
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setIsVisible(false);
    setDeferredPrompt(null); // Opcional: si queremos que vuelva a aparecer en la próxima visita, no lo nulleamos, solo ocultamos.
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <InstallBanner
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <Content>
          <div style={{ background: '#333', padding: '0.5rem', borderRadius: '8px' }}>
            {/* Icono de App o Logo */}
            <Download size={24} color="#fff" />
          </div>
          <TextContainer>
            <Title>Instalar App</Title>
            <Subtitle>Acceso rápido a tus Group Orders</Subtitle>
          </TextContainer>
        </Content>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <InstallButton onClick={handleInstallClick}>
            Instalar
          </InstallButton>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </div>
      </InstallBanner>
    </AnimatePresence>
  );
}
