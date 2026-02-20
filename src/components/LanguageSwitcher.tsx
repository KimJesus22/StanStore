'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { ChangeEvent, useTransition } from 'react';
import styled from 'styled-components';

const Select = styled.select`
  background: transparent;
  color: inherit;
  border: 1px solid #999;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #10CFBD;
  }
  
  option {
    color: #000;
  }

  @media (max-width: 768px) {
    max-width: 42px;
    min-width: 0;
    padding: 0.4rem 0.1rem 0.4rem 0.2rem;
    font-size: 1rem;
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
      defaultValue={locale}
      onChange={onSelectChange}
      disabled={isPending}
      aria-label="Seleccionar idioma"
    >
      <option value="es">🇲🇽 Español</option>
      <option value="en">🇺🇸 English</option>
      <option value="ko">🇰🇷 한국어</option>
    </Select>
  );
}
