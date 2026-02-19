'use client';

import styled from 'styled-components';

export const MarkdownStyles = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  h2 {
    font-size: 1.75rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  ul, ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1rem;
    font-style: italic;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  code {
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
  }

  strong {
      font-weight: 700;
  }
`;
