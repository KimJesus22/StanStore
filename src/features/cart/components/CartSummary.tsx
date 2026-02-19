'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { Truck, Tag } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import {
    calculateCartTotals,
    FREE_SHIPPING_THRESHOLD,
    FLAT_SHIPPING_RATE,
} from '../utils/calculateCartTotals';

/* ─── Types ─── */

interface CartSummaryProps {
    items: { price: number; quantity: number }[];
    /** Show the shipping estimator widget */
    showShippingEstimator?: boolean;
}

/* ─── Styled Components ─── */

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.55rem 0;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const RowLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const RowValue = styled.span`
    font-variant-numeric: tabular-nums;
`;

const ShippingRow = styled(Row)<{ $free: boolean }>`
    color: ${({ theme, $free }) => ($free ? '#16a34a' : theme.colors.textMuted)};
    font-weight: ${({ $free }) => ($free ? '600' : 'normal')};
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: 0.5rem 0;
`;

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.75rem 0 0.25rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
`;

const HelperText = styled.p`
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0.4rem 0 0;
    line-height: 1.4;
`;

const FreeShippingBadge = styled.span`
    font-size: 0.72rem;
    background: #dcfce7;
    color: #16a34a;
    border-radius: 4px;
    padding: 1px 6px;
    font-weight: 600;
`;

/* ─── Shipping Estimator ─── */

const EstimatorWrapper = styled.div`
    margin: 0.75rem 0 0;
    padding: 0.85rem 1rem;
    background: ${({ theme }) => theme.colors.secondaryBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
`;

const EstimatorLabel = styled.label`
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

const StateSelect = styled.select`
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 1px;
    }
`;

const ShippingHint = styled.p`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0.35rem 0 0;
`;

/* ─── Data ─── */

const MEXICO_STATES = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas',
];

/* ─── Component ─── */

export default function CartSummary({ items, showShippingEstimator = false }: CartSummaryProps) {
    const { formatPrice } = useCurrency();
    const [selectedState, setSelectedState] = useState('');

    // Calculate totals with shipping estimation if a state has been chosen
    const hasStateSelected = selectedState !== '';
    const totals = calculateCartTotals(items, hasStateSelected);

    const isFreeShipping = totals.subtotal >= FREE_SHIPPING_THRESHOLD;

    return (
        <Container>
            {/* Subtotal */}
            <Row>
                <RowLabel>Subtotal</RowLabel>
                <RowValue>{formatPrice(totals.subtotal)}</RowValue>
            </Row>

            {/* IVA */}
            <Row>
                <RowLabel>
                    <Tag size={13} />
                    IVA (16%)
                </RowLabel>
                <RowValue>{formatPrice(totals.taxTotal)}</RowValue>
            </Row>

            {/* Shipping Estimator widget */}
            {showShippingEstimator && (
                <EstimatorWrapper>
                    <EstimatorLabel htmlFor="cart-state">
                        Estimar envío por estado
                    </EstimatorLabel>
                    <StateSelect
                        id="cart-state"
                        value={selectedState}
                        onChange={e => setSelectedState(e.target.value)}
                    >
                        <option value="">Selecciona tu estado...</option>
                        {MEXICO_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </StateSelect>
                    {hasStateSelected && (
                        <ShippingHint>
                            {isFreeShipping
                                ? `¡Envío gratuito a ${selectedState}!`
                                : `Envío estimado a ${selectedState}: ${formatPrice(FLAT_SHIPPING_RATE)}`}
                        </ShippingHint>
                    )}
                </EstimatorWrapper>
            )}

            {/* Shipping cost row */}
            <ShippingRow $free={hasStateSelected && isFreeShipping}>
                <RowLabel>
                    <Truck size={13} />
                    Envío Estimado
                </RowLabel>
                <RowValue>
                    {!hasStateSelected ? (
                        '—'
                    ) : isFreeShipping ? (
                        <FreeShippingBadge>GRATIS</FreeShippingBadge>
                    ) : (
                        formatPrice(FLAT_SHIPPING_RATE)
                    )}
                </RowValue>
            </ShippingRow>

            <Divider />

            {/* Total */}
            <TotalRow>
                <span>Total Final</span>
                <span>{formatPrice(totals.total)}</span>
            </TotalRow>

            <HelperText>
                Los costos finales de envío se calcularán en el siguiente paso.
            </HelperText>
        </Container>
    );
}
