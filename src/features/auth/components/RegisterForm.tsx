'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/schemas/auth';
import { registerUser } from '@/app/actions/register';
import { toast } from 'react-hot-toast';
import FormInput from '@/components/ui/FormInput';

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
            } else {
                toast.error(response.message || 'Ocurrió un error');

                if (response.errors) {
                    Object.entries(response.errors).forEach(([key, messages]) => {
                        if (messages && messages.length > 0) {
                            setError(key as keyof RegisterInput, {
                                type: 'server',
                                message: messages[0],
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
        <FormContainer onSubmit={handleSubmit(onSubmit)} noValidate>
            <Title>Crear Cuenta</Title>

            <FormInput
                label="Correo Electrónico"
                name="email"
                type="email"
                placeholder="tu@email.com"
                register={register('email')}
                error={errors.email}
                icon={<Mail size={18} />}
            />

            <FormInput
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                register={register('password')}
                error={errors.password}
                icon={<Lock size={18} />}
            />

            <FormInput
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                register={register('confirmPassword')}
                error={errors.confirmPassword}
                icon={<CheckCircle size={18} />}
            />

            <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </SubmitButton>
        </FormContainer>
    );
}
