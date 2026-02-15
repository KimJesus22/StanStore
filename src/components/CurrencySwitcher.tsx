'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { ChangeEvent } from 'react';
import styled from 'styled-components';

const Select = styled.select`
  background: transparent;
  color: inherit;
  border: 1px solid #999;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;

  &:focus {
    outline: none;
    border-color: #10CFBD;
  }
  
  option {
    color: #000;
    background: #fff;
  }
`;

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextCurrency = e.target.value as 'USD' | 'MXN' | 'KRW';
        setCurrency(nextCurrency);
    };

    return (
        <Select
            value={currency}
            onChange={onSelectChange}
            aria-label="Seleccionar Moneda"
        >
            <option value="MXN">$ MXN</option>
            <option value="USD">$ USD</option>
            <option value="KRW">₩ KRW</option>
        </Select>
    );
}
