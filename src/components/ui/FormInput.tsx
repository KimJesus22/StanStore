'use client';

import React from 'react';
import styled from 'styled-components';
import { AlertCircle } from 'lucide-react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { useZodErrorTranslation } from '@/hooks/useZodErrorTranslation';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Texto del label visible */
    label: string;
    /** Nombre del campo (usado para htmlFor, id, aria-describedby) */
    name: string;
    /** Resultado de register('fieldName') de React Hook Form */
    register: UseFormRegisterReturn;
    /** Objeto de error del campo (formState.errors.fieldName) */
    error?: FieldError;
    /** Icono opcional a la izquierda del input */
    icon?: React.ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 0.25rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text}60;
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ $hasError: boolean; $hasIcon: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem ${({ $hasIcon }) => ($hasIcon ? '2.75rem' : '1rem')};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? '#ef4444' : theme.colors.border)};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme, $hasError }) => ($hasError ? '#ef4444' : theme.colors.primary)};
    box-shadow: 0 0 0 4px ${({ $hasError }) => ($hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text}50;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.25rem;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/**
 * Componente reutilizable de input con integración React Hook Form.
 *
 * @example
 * <FormInput
 *   label="Correo Electrónico"
 *   name="email"
 *   type="email"
 *   placeholder="tu@email.com"
 *   register={register('email')}
 *   error={errors.email}
 *   icon={<Mail size={18} />}
 * />
 */
export default function FormInput({
    label,
    name,
    register,
    error,
    icon,
    ...inputProps
}: FormInputProps) {
    const translateError = useZodErrorTranslation();
    const errorMessage = translateError(error);
    const errorId = `${name}-error`;

    return (
        <Wrapper>
            <Label htmlFor={name}>{label}</Label>
            <InputContainer>
                {icon && <IconWrapper>{icon}</IconWrapper>}
                <StyledInput
                    id={name}
                    $hasError={!!error}
                    $hasIcon={!!icon}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    {...register}
                    {...inputProps}
                />
            </InputContainer>
            {error && errorMessage && (
                <ErrorMessage id={errorId} role="alert">
                    <AlertCircle size={14} />
                    {errorMessage}
                </ErrorMessage>
            )}
        </Wrapper>
    );
}
