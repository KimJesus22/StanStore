'use client';

import styled from 'styled-components';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

export default function Home() {
  return (
    <Main>
      <Title>StanStore</Title>
      <p>Bienvenido a tu nueva tienda de e-commerce.</p>
    </Main>
  );
}
