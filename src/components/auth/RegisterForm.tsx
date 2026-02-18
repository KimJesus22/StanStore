'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/schemas/auth';
import { registerUser } from '@/app/actions/register';
import { toast } from 'react-hot-toast';
// Styled Components (Reutilizando estilos de AuthModal para consistencia)
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
  text-align: center;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 2.7rem; /* Ajustado para alinearse con el input abajo del label */
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text}60;
  pointer-events: none;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 0.25rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid ${({ theme, $hasError }) => $hasError ? '#ef4444' : theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme, $hasError }) => $hasError ? '#ef4444' : theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ $hasError }) => $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  margin-top: 1rem;

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



// ... (imports y estilos se mantienen)

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            const response = await registerUser(data);

            if (response.success) {
                toast.success(response.message || 'Registro exitoso');
                // Aquí podrías redirigir o limpiar el formulario
            } else {
                toast.error(response.message || 'Ocurrió un error');

                // Si hay errores de campos específicos devueltos por el servidor
                if (response.errors) {
                    Object.entries(response.errors).forEach(([key, messages]) => {
                        if (messages && messages.length > 0) {
                            setError(key as keyof RegisterInput, {
                                type: 'server',
                                message: messages[0]
                            });
                        }
                    });
                }
            }
        } catch (error) {
            toast.error('Error de conexión');
            console.error(error);
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
            <Title>Crear Cuenta</Title>

            <InputGroup>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    $hasError={!!errors.email}
                    {...register('email')}
                />
                <IconWrapper style={{ top: '2.4rem' }}>
                    <Mail size={18} />
                </IconWrapper>
                {errors.email && (
                    <ErrorMessage>
                        <AlertCircle size={14} />
                        {errors.email.message}
                    </ErrorMessage>
                )}
            </InputGroup>

            <InputGroup>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    $hasError={!!errors.password}
                    {...register('password')}
                />
                <IconWrapper style={{ top: '2.4rem' }}>
                    <Lock size={18} />
                </IconWrapper>
                {errors.password && (
                    <ErrorMessage>
                        <AlertCircle size={14} />
                        {errors.password.message}
                    </ErrorMessage>
                )}
            </InputGroup>

            <InputGroup>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="******"
                    $hasError={!!errors.confirmPassword}
                    {...register('confirmPassword')}
                />
                <IconWrapper style={{ top: '2.4rem' }}>
                    <CheckCircle size={18} />
                </IconWrapper>
                {errors.confirmPassword && (
                    <ErrorMessage>
                        <AlertCircle size={14} />
                        {errors.confirmPassword.message}
                    </ErrorMessage>
                )}
            </InputGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </SubmitButton>
        </FormContainer>
    );
}
