'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideFromBottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 85vh;
    border-bottom: none;
    animation: slideFromBottom 0.3s ease-out;
  }
`;

/* Visual drag handle — only shown on mobile drawer */
const DrawerHandle = styled.div`
  display: none;
  width: 40px;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  margin: 0.75rem auto 0;
  flex-shrink: 0;

  @media (max-width: 640px) {
    display: block;
  }
`;

const ModalBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 2.5rem;
  -webkit-overflow-scrolling: touch;
`;

/* ── Close button (top-right X) ──────────────────────────────────────────
   • min 44×44 px touch target (Apple HIG / WCAG 2.5.5)
   • z-index: 10 keeps it above scrollable content
   • top/right: 1rem = Tailwind's top-4 / right-4
   ─────────────────────────────────────────────────────────────────────── */
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text}80;
  min-width: 44px;
  min-height: 44px;
  padding: 0.625rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.text}12;
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    background: ${({ theme }) => theme.colors.text}1f;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text}60;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text}80;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.25rem;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
  margin-left: 0.5rem;
`;

/* Full-width "Cancelar" button — only rendered on mobile (<640px).
   Placed at the bottom of the drawer for one-thumb reachability. */
const CloseDrawerButton = styled.button`
  display: none;
  width: 100%;
  padding: 1rem;
  margin-top: 1.25rem;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.75;
  }

  @media (max-width: 640px) {
    display: block;
  }
`;

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const t = useTranslations('Validations');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ── Escape key closes the modal ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // ── Focus trap: move focus to close button when modal opens ──────────
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // 1. Zod Validation
      const { createLoginSchema, createRegisterSchema } = await import('@/lib/validations');
      const schema = isSignUp ? createRegisterSchema(t) : createLoginSchema(t);

      const result = schema.safeParse({ email, password });

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
        setLoading(false);
        return;
      }

      // 2. Supabase Action
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const { logAuditAction } = await import('@/app/actions/audit');
        await logAuditAction('SIGNUP_SUCCESS', { email });

        toast.success('¡Registro exitoso! Revisa tu email para confirmar.');
        closeAuthModal();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { logAuditAction } = await import('@/app/actions/audit');
        await logAuditAction('LOGIN_SUCCESS', { email, userId: data.user.id }, data.user.id);

        toast.success('¡Bienvenido de nuevo!');
        closeAuthModal();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    // ── Click outside closes the modal ──────────────────────────────────
    <Overlay onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
      <Modal role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        {/* Drag handle — visual cue for mobile bottom sheet */}
        <DrawerHandle />

        {/* X button — sticky at top-right, above scrollable content */}
        <CloseButton ref={closeButtonRef} onClick={closeAuthModal} aria-label="Cerrar">
          <X size={20} />
        </CloseButton>

        <ModalBody>
          <Title id="auth-modal-title">{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</Title>

          <Form onSubmit={handleSubmit} noValidate>
            <InputGroup>
              <IconWrapper><Mail size={18} /></IconWrapper>
              <Input
                type="email"
                placeholder="Correo electrónico"
                aria-label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderColor: errors.email ? '#ef4444' : '#e0e0e0' }}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <IconWrapper><Lock size={18} /></IconWrapper>
              <Input
                type="password"
                placeholder="Contraseña"
                aria-label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: errors.password ? '#ef4444' : '#e0e0e0' }}
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Registrarse' : 'Entrar')}
            </Button>
          </Form>

          <Footer>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <LinkButton onClick={() => setIsSignUp(!isSignUp)} type="button">
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </LinkButton>
          </Footer>

          {/* Full-width cancel button — only visible on mobile for one-thumb close */}
          <CloseDrawerButton type="button" onClick={closeAuthModal}>
            Cancelar
          </CloseDrawerButton>
        </ModalBody>
      </Modal>
    </Overlay>
  );
}
