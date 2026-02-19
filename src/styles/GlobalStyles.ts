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

  /* ── Foco visible WCAG 2.1 AA (2.4.7 / 2.4.11) ─────────────────────────
     Solo se activa con teclado (Tab/Shift+Tab), nunca con clic de ratón.
     ──────────────────────────────────────────────────────────────────────── */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* Botones: outline más pegado al borde redondeado del componente */
  button:focus-visible,
  [role="button"]:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* Inputs, selects, textareas */
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
    border-radius: 4px;
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
