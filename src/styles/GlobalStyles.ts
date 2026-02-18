import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transition: all 0.25s linear;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  /* Foco visible de alto contraste para accesibilidad */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.background};
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: text-decoration 0.2s;

    &:hover, &:focus {
      text-decoration: underline;
      text-decoration-thickness: 2px;
    }
  }
`;
