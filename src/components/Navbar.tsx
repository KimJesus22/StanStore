'use client';

import styled from 'styled-components';
import HeaderLogo from './header/HeaderLogo';
import HeaderSearch from './header/HeaderSearch';
import HeaderNav from './header/HeaderNav';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    gap: 0;
  }
`;

export default function Navbar() {
  return (
    <Nav>
      <HeaderLogo />
      <RightSection>
        <HeaderSearch />
        <HeaderNav />
      </RightSection>
    </Nav>
  );
}
