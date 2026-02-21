'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { ChangeEvent, useTransition } from 'react';
import styled from 'styled-components';

// Native name + region label for each supported locale.
// Intentionally avoids flag emojis: flags carry geopolitical implications,
// render inconsistently across OS/browsers, and fail on some screen readers.
const LOCALE_LABELS: Record<string, string> = {
    'es':    'Español (Latam)',
    'en':    'English (US)',
    'ko':    '한국어',
    'pt-BR': 'Português (Brasil)',
    'fr-CA': 'Français (Canada)',
};

// Order in which locales appear in the dropdown
const LOCALE_ORDER = ['es', 'en', 'ko', 'pt-BR', 'fr-CA'] as const;

const Select = styled.select`
  background: transparent;
  color: inherit;
  border: 1px solid #999;
  /* min-width accommodates the longest label "Português (Brasil)" without overflow */
  min-width: max-content;
  padding: 0.4rem 2rem 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  /* Chevron spacing via padding-right so the arrow never overlaps text */
  appearance: auto;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors?.primary ?? '#10CFBD'};
    outline-offset: 2px;
    border-color: transparent;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    color: #000;
    background: #fff;
  }

  @media (max-width: 768px) {
    /* On mobile show a compact size but keep it readable */
    font-size: 0.8rem;
    padding: 0.35rem 1.5rem 0.35rem 0.4rem;
  }
`;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace(pathname as any, { locale: nextLocale });
    });
  };

  return (
    <Select
      value={locale}
      onChange={onSelectChange}
      disabled={isPending}
      aria-label="Select language / Seleccionar idioma"
    >
      {LOCALE_ORDER.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </Select>
  );
}
