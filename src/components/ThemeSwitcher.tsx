'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';

const SwitchButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text}; // Usa el color del tema actual

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary}; // Fondo sutil al hacer hover
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    // Estado para controlar si el componente está montado en cliente
    const [mounted, setMounted] = useState(false);

    // Efecto para marcar como montado solo en cliente
    useEffect(() => {
        setMounted(true);
    }, []);

    // Si no está montado, retornar null o un placeholder para evitar Hydration Mismatch
    // Explicación: El servidor no sabe el tema preferido del usuario (localStorage/media query),
    // por lo que renderizaría algo diferente al cliente inicialmente.
    if (!mounted) {
        return (
            <SwitchButton aria-hidden="true" disabled>
                <div style={{ width: 24, height: 24 }} /> {/* Placeholder invisible de mismo tamaño */}
            </SwitchButton>
        );
    }

    const isDark = theme === 'dark';

    return (
        <SwitchButton
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={isDark ? "Modo Claro" : "Modo Oscuro"}
        >
            {isDark ? (
                <Sun size={20} strokeWidth={2} />
            ) : (
                <Moon size={20} strokeWidth={2} />
            )}
        </SwitchButton>
    );
}
