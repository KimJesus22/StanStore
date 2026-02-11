'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Banner = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: #111;
  color: white;
  padding: 1rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 9999;
  max-width: 400px;
  margin: 0 auto;

  @media (min-width: 768px) {
    left: auto;
    right: 20px;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #10CFBD;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
`;

const Subtitle = styled.span`
  font-size: 0.8rem;
  color: #ccc;
`;

const InstallButton = styled.button`
  background-color: #10CFBD;
  color: #111;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-right: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <Banner
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <Content>
          <Icon>S</Icon>
          <Text>
            <Title>Instalar App</Title>
            <Subtitle>Accede más rápido y offline</Subtitle>
          </Text>
        </Content>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InstallButton onClick={handleInstallClick}>Instalar</InstallButton>
          <CloseButton onClick={handleClose}>
            <X size={18} />
          </CloseButton>
        </div>
      </Banner>
    </AnimatePresence>
  );
}
