'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from 'next-intl';
import { ShippingInfo } from '@/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const MEXICO_STATES = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas',
];

/* ─── Styled Components ─── */

const PageWrapper = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 3rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 1rem;
        gap: 2rem;
    }
`;

const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    transition: color 0.2s;

    &:hover {
        color: #111;
    }
`;

const FormSection = styled.div``;

const SectionTitle = styled.h2`
    font-size: 1.35rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 1.5rem;
`;

const NoteBox = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 0.85rem 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.85rem;
    color: #555;

    svg {
        flex-shrink: 0;
        color: #888;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 0.75rem;
`;

const Row = styled.div<{ $columns?: string }>`
    display: grid;
    grid-template-columns: ${({ $columns }) => $columns || '1fr 1fr'};
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const FloatingLabel = styled.label<{ $hasValue: boolean }>`
    position: absolute;
    left: 14px;
    top: ${({ $hasValue }) => ($hasValue ? '6px' : '50%')};
    transform: ${({ $hasValue }) => ($hasValue ? 'none' : 'translateY(-50%)')};
    font-size: ${({ $hasValue }) => ($hasValue ? '0.7rem' : '0.9rem')};
    color: ${({ $hasValue }) => ($hasValue ? '#888' : '#999')};
    pointer-events: none;
    transition: all 0.15s ease;
    z-index: 1;
`;

const Input = styled.input`
    width: 100%;
    padding: 1.15rem 14px 0.55rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
        border-color: #111;
    }

    &:focus + ${FloatingLabel} {
        top: 6px;
        transform: none;
        font-size: 0.7rem;
        color: #888;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 1.15rem 14px 0.55rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #111;
    background: #fff;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s;
    box-sizing: border-box;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;

    &:focus {
        border-color: #111;
    }
`;

const CheckboxRow = styled.label`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: #555;
    cursor: pointer;
    margin: 1rem 0 0;

    input {
        accent-color: #111;
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
`;

/* ─── Order Summary ─── */

const SummaryPanel = styled.div`
    background: #fafafa;
    border-left: 1px solid #eee;
    padding: 2rem;
    border-radius: 0;
    position: sticky;
    top: 2rem;
    align-self: start;

    @media (max-width: 768px) {
        border-left: none;
        border-top: 1px solid #eee;
        padding: 1.5rem 0 0;
        position: static;
        background: transparent;
    }
`;

const SummaryTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #111;
`;

const SummaryItem = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;

    &:last-of-type {
        border-bottom: none;
    }
`;

const ItemThumb = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    border: 1px solid #eee;
    background: #f5f5f5;
`;

const ItemBadge = styled.span`
    position: absolute;
    top: -6px;
    right: -6px;
    background: #555;
    color: #fff;
    font-size: 0.65rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    z-index: 2;
`;

const ItemInfo = styled.div`
    flex: 1;
`;

const ItemName = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: #111;
`;

const ItemArtist = styled.div`
    font-size: 0.75rem;
    color: #888;
`;

const ItemPrice = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #111;
`;

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.15rem;
    font-weight: 700;
    color: #111;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 2px solid #ddd;
`;

const PayButton = styled.button`
    width: 100%;
    margin-top: 1.5rem;
    padding: 1rem;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: #000;
        transform: translateY(-1px);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`;

const ShippingMethodBox = styled.div`
    background: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
    color: #888;
    font-size: 0.9rem;
`;

const TermsCheckbox = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: #555;
    cursor: pointer;
    margin-top: 1rem;

    input {
        margin-top: 2px;
        accent-color: #111;
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    a {
        text-decoration: underline;
        color: inherit;
    }
`;

/* ─── Component ─── */

export default function CheckoutForm() {
    const { items } = useCartStore();
    const { formatPrice } = useCurrency();
    const locale = useLocale();

    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [shipping, setShipping] = useState<ShippingInfo>({
        country: 'México',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        postalCode: '',
        city: '',
        state: '',
        phone: '',
    });

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const updateField = (field: keyof ShippingInfo, value: string) => {
        setShipping(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!shipping.firstName.trim() || !shipping.lastName.trim()) {
            toast.error('Nombre y apellidos son requeridos');
            return false;
        }
        if (!shipping.address.trim()) {
            toast.error('La dirección es requerida');
            return false;
        }
        if (!shipping.postalCode.trim() || !shipping.city.trim() || !shipping.state) {
            toast.error('Código postal, ciudad y estado son requeridos');
            return false;
        }
        if (!shipping.phone.trim()) {
            toast.error('El teléfono es requerido');
            return false;
        }
        if (!acceptedTerms) {
            toast.error('Debes aceptar los términos y condiciones');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error('Tu carrito está vacío');
            return;
        }
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { createCheckoutSession } = await import('@/app/actions/stripe');

            const legalMetadata = {
                agreedAt: new Date().toISOString(),
                userAgent: navigator.userAgent,
            };

            const { url, error } = await createCheckoutSession(
                items.map(item => ({ id: item.id, quantity: item.quantity })),
                legalMetadata,
                locale,
                shipping
            );

            if (error) {
                toast.error('Error al iniciar el pago: ' + error);
                return;
            }

            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <PageWrapper style={{ display: 'block', textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Tu carrito está vacío</p>
                <BackLink href={`/${locale}`}>
                    <ArrowLeft size={16} /> Volver a la tienda
                </BackLink>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <FormSection>
                <BackLink href={`/${locale}`}>
                    <ArrowLeft size={16} /> Volver a la tienda
                </BackLink>

                <SectionTitle>Entrega</SectionTitle>

                <NoteBox>
                    <Info size={18} />
                    <span>La dirección debe escribirse en <strong>ESPAÑOL</strong> para entrega en México.</span>
                </NoteBox>

                {/* País */}
                <FormGroup>
                    <InputWrapper>
                        <Select
                            id="country"
                            value={shipping.country}
                            onChange={e => updateField('country', e.target.value)}
                        >
                            <option value="México">México</option>
                        </Select>
                        <FloatingLabel htmlFor="country" $hasValue={true}>País / Región</FloatingLabel>
                    </InputWrapper>
                </FormGroup>

                {/* Nombre + Apellidos */}
                <Row>
                    <InputWrapper>
                        <Input
                            id="firstName"
                            value={shipping.firstName}
                            onChange={e => updateField('firstName', e.target.value)}
                        />
                        <FloatingLabel htmlFor="firstName" $hasValue={!!shipping.firstName}>Nombre</FloatingLabel>
                    </InputWrapper>
                    <InputWrapper>
                        <Input
                            id="lastName"
                            value={shipping.lastName}
                            onChange={e => updateField('lastName', e.target.value)}
                        />
                        <FloatingLabel htmlFor="lastName" $hasValue={!!shipping.lastName}>Apellidos</FloatingLabel>
                    </InputWrapper>
                </Row>

                {/* Dirección */}
                <FormGroup>
                    <InputWrapper>
                        <Input
                            id="address"
                            value={shipping.address}
                            onChange={e => updateField('address', e.target.value)}
                        />
                        <FloatingLabel htmlFor="address" $hasValue={!!shipping.address}>Dirección</FloatingLabel>
                    </InputWrapper>
                </FormGroup>

                {/* Apartamento */}
                <FormGroup>
                    <InputWrapper>
                        <Input
                            id="apartment"
                            value={shipping.apartment || ''}
                            onChange={e => updateField('apartment', e.target.value)}
                        />
                        <FloatingLabel htmlFor="apartment" $hasValue={!!shipping.apartment}>Casa, apartamento, etc. (opcional)</FloatingLabel>
                    </InputWrapper>
                </FormGroup>

                {/* CP + Ciudad + Estado */}
                <Row $columns="1fr 1fr 1fr">
                    <InputWrapper>
                        <Input
                            id="postalCode"
                            value={shipping.postalCode}
                            onChange={e => updateField('postalCode', e.target.value)}
                        />
                        <FloatingLabel htmlFor="postalCode" $hasValue={!!shipping.postalCode}>Código postal</FloatingLabel>
                    </InputWrapper>
                    <InputWrapper>
                        <Input
                            id="city"
                            value={shipping.city}
                            onChange={e => updateField('city', e.target.value)}
                        />
                        <FloatingLabel htmlFor="city" $hasValue={!!shipping.city}>Ciudad</FloatingLabel>
                    </InputWrapper>
                    <InputWrapper>
                        <Select
                            id="state"
                            value={shipping.state}
                            onChange={e => updateField('state', e.target.value)}
                        >
                            <option value="">Seleccionar</option>
                            {MEXICO_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </Select>
                        <FloatingLabel htmlFor="state" $hasValue={!!shipping.state}>Estado</FloatingLabel>
                    </InputWrapper>
                </Row>

                {/* Teléfono */}
                <FormGroup>
                    <InputWrapper>
                        <Input
                            id="phone"
                            type="tel"
                            value={shipping.phone}
                            onChange={e => updateField('phone', e.target.value)}
                        />
                        <FloatingLabel htmlFor="phone" $hasValue={!!shipping.phone}>Teléfono</FloatingLabel>
                    </InputWrapper>
                </FormGroup>

                <CheckboxRow>
                    <input type="checkbox" />
                    <span>Guardar mi información y consultar más rápidamente la próxima vez</span>
                </CheckboxRow>

                {/* Métodos de envío */}
                <SectionTitle style={{ marginTop: '2rem' }}>Métodos de envío</SectionTitle>
                <ShippingMethodBox>
                    Ingresa tu dirección de envío para ver los métodos disponibles.
                </ShippingMethodBox>

                {/* Términos */}
                <TermsCheckbox>
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={e => setAcceptedTerms(e.target.checked)}
                    />
                    <span>
                        Acepto los <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y reconozco que esta acción constituye una <strong>Firma Digital</strong> válida.
                    </span>
                </TermsCheckbox>
            </FormSection>

            {/* Resumen del pedido */}
            <SummaryPanel>
                <SummaryTitle>Resumen del pedido</SummaryTitle>

                {items.map(item => (
                    <SummaryItem key={item.id}>
                        <div style={{ position: 'relative' }}>
                            <ItemThumb>
                                <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    sizes="60px"
                                    placeholder="blur"
                                    blurDataURL={BLUR_DATA_URL}
                                    style={{ objectFit: 'cover' }}
                                />
                            </ItemThumb>
                            {item.quantity > 1 && <ItemBadge>{item.quantity}</ItemBadge>}
                        </div>
                        <ItemInfo>
                            <ItemName>{item.name}</ItemName>
                            <ItemArtist>{item.artist}</ItemArtist>
                        </ItemInfo>
                        <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
                    </SummaryItem>
                ))}

                <TotalRow>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </TotalRow>

                <PayButton
                    onClick={handleSubmit}
                    disabled={loading || !acceptedTerms}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Procesando...
                        </>
                    ) : (
                        `Pagar ${formatPrice(total)}`
                    )}
                </PayButton>
            </SummaryPanel>
        </PageWrapper>
    );
}
