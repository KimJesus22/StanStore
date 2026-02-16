import { useCurrency } from '@/context/CurrencyContext';
import styled from 'styled-components';

const Select = styled.select`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  outline: none;
  margin-right: 0.5rem;

  option {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function CurrencySelector() {
    const { currency, setCurrency } = useCurrency();

    return (
        <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'MXN' | 'KRW')}
            aria-label="Seleccionar moneda"
        >
            <option value="USD">USD ($)</option>
            <option value="MXN">MXN ($)</option>
            <option value="KRW">KRW (₩)</option>
        </Select>
    );
}
