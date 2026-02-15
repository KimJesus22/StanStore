'use client';

import styled from 'styled-components';
import { Link } from '@/navigation';

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  padding: 0.5rem 0; /* Touch target improvement */
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export default function HeaderLogo() {
    return <Logo href="/">StanStore</Logo>;
}
