'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Package, Search, Truck, CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PageContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: 70vh;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text}50;
  }
`;

const SearchButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultCard = styled.div`
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusIcon = styled.div<{ $active?: boolean }>`
  color: ${({ $active, theme }) => $active ? theme.colors.primary : `${theme.colors.text}30`};
  transition: color 0.3s;
`;

const StatusText = styled.span<{ $active?: boolean }>`
  font-weight: ${({ $active }) => $active ? 700 : 400};
  opacity: ${({ $active }) => $active ? 1 : 0.5};
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  background: #fdf0ef;
  border: 1px solid #f5c6cb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

export default function TrackOrderPage() {
    const t = useTranslations('TrackOrder');
    const [orderId, setOrderId] = useState('');
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;
        setLoading(true);
        // Simular búsqueda
        setTimeout(() => {
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    return (
        <PageContainer>
            <PageTitle>
                <Package size={28} />
                {t('title')}
            </PageTitle>
            <PageSubtitle>
                {t('subtitle')}
            </PageSubtitle>

            <SearchForm onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder={t('placeholder')}
                    value={orderId}
                    onChange={(e) => {
                        setOrderId(e.target.value);
                        setSearched(false);
                    }}
                />
                <SearchButton type="submit" disabled={!orderId.trim() || loading}>
                    <Search size={18} />
                    {loading ? t('searching') : t('search')}
                </SearchButton>
            </SearchForm>

            {searched && (
                <ResultCard>
                    <ErrorMessage>
                        {t('notFound', { orderId: orderId.trim() })}
                    </ErrorMessage>
                    <InfoText>
                        {t('help')}
                    </InfoText>

                    <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('statusExample')}
                        </p>
                        <StatusRow>
                            <StatusIcon $active><CheckCircle size={20} /></StatusIcon>
                            <StatusText $active>{t('statusConfirmed')}</StatusText>
                        </StatusRow>
                        <StatusRow>
                            <StatusIcon><Clock size={20} /></StatusIcon>
                            <StatusText>{t('statusProcessing')}</StatusText>
                        </StatusRow>
                        <StatusRow>
                            <StatusIcon><Truck size={20} /></StatusIcon>
                            <StatusText>{t('statusShipped')}</StatusText>
                        </StatusRow>
                        <StatusRow>
                            <StatusIcon><Package size={20} /></StatusIcon>
                            <StatusText>{t('statusDelivered')}</StatusText>
                        </StatusRow>
                    </div>
                </ResultCard>
            )}
        </PageContainer>
    );
}
