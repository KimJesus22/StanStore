'use client';

import styled from 'styled-components';

const StyledSkipLink = styled.a`
  position: absolute;
  top: -9999px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  padding: 1rem 2rem;
  z-index: 9999;
  text-decoration: none;
  font-weight: bold;
  border-radius: 0 0 12px 12px;
  transition: top 0.2s ease-in-out;

  &:focus {
    top: 0;
    outline: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

export default function SkipLink() {
    return (
        <StyledSkipLink href="#content">
            Saltar al contenido principal
        </StyledSkipLink>
    );
}
