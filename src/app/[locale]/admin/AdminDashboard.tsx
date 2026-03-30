'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const SalesChart = dynamic(() => import('@/components/admin/SalesChart'), {
  loading: () => <div style={{ height: 300, background: 'var(--bg-secondary)', borderRadius: 8 }} />,
  ssr: false
});

const CategoryChart = dynamic(() => import('@/components/admin/CategoryChart'), {
  loading: () => <div style={{ height: 300, background: 'var(--bg-secondary)', borderRadius: 8 }} />,
  ssr: false
});

const AdminContent = dynamic(() => import('./AdminContent'), {
  loading: () => <p>Cargando gestión de productos...</p>,
  ssr: false
});

const IpBanManager = dynamic(() => import('@/components/admin/IpBanManager'), {
  loading: () => <div style={{ height: 200, background: 'var(--bg-secondary)', borderRadius: 8, marginTop: '2rem' }} />,
  ssr: false
});

// import { useTranslations } from 'next-intl';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #10CFBD;
  `;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatEmpty = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.55;
  margin-top: 0.25rem;
`;

const LoadingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

export default function AdminDashboard() {
  // const t = useTranslations('Admin'); // Ensure you have translations or use fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [salesData, setSalesData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sales } = await supabase.rpc('get_sales_by_date');
        const { data: categories } = await supabase.rpc('get_sales_by_category');

        if (sales && Array.isArray(sales)) {
          setSalesData(sales);
          const revenue = sales.reduce((acc: number, curr: { total: number }) => acc + (curr.total || 0), 0);
          setTotalRevenue(revenue);
        }

        if (categories && Array.isArray(categories)) {
          setCategoryData(categories);
          const orders = categories.reduce((acc: number, curr: { total: number }) => acc + (curr.total || 0), 0);
          setTotalOrders(orders);
        }

      } catch {
        // RPC functions may not exist yet - silently handle
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <Loader2 size={32} className="animate-spin" style={{ opacity: 0.4 }} />
        <span>Cargando dashboard...</span>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Panel de Administración</Title>
        <Subtitle>Visión general del rendimiento de tu tienda.</Subtitle>
      </Header>

      <Grid>
        <StatCard>
          <StatValue>{totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : '—'}</StatValue>
          <StatLabel>Ingresos Totales (Est.)</StatLabel>
          {totalRevenue === 0 && <StatEmpty>Sin pedidos registrados aún</StatEmpty>}
        </StatCard>
        <StatCard>
          <StatValue>{totalOrders > 0 ? totalOrders : '—'}</StatValue>
          <StatLabel>Productos Vendidos</StatLabel>
          {totalOrders === 0 && <StatEmpty>Sin ventas registradas aún</StatEmpty>}
        </StatCard>
      </Grid>

      <Grid>
        <SalesChart data={salesData} />
        <CategoryChart data={categoryData} />
      </Grid>

      {/* Gestión de Baneos de IP */}
      <IpBanManager />

      {/* Formulario para crear productos */}
      <AdminContent />
    </Container>
  );
}
