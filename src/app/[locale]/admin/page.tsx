'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '@/lib/supabaseClient';
import SalesChart from '@/components/admin/SalesChart';
import CategoryChart from '@/components/admin/CategoryChart';
import { useTranslations } from 'next-intl';

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
  color: #111;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: white;
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
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export default function AdminDashboard() {
  const t = useTranslations('Admin'); // Ensure you have translations or use fallback
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sales, error: salesError } = await supabase.rpc('get_sales_by_date');
        const { data: categories, error: catError } = await supabase.rpc('get_sales_by_category');

        if (salesError) console.error('Sales Error:', salesError);
        if (catError) console.error('Category Error:', catError);

        if (sales) {
          // Transform date for chart if needed, though RPC returns YYYY-MM-DD
          setSalesData(sales);
          // Calculate totals from the aggregated data (approximation)
          const revenue = sales.reduce((acc: number, curr: { total: number }) => acc + curr.total, 0);
          setTotalRevenue(revenue);
        }

        if (categories) {
          setCategoryData(categories);
          const orders = categories.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0);
          setTotalOrders(orders);
        }

      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Container>Cargando dashboard...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Panel de Administración</Title>
        <Subtitle>Visión general del rendimiento de tu tienda.</Subtitle>
      </Header>

      <Grid>
        <StatCard>
          <StatValue>${totalRevenue.toFixed(2)}</StatValue>
          <StatLabel>Ingresos Totales (Est.)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalOrders}</StatValue>
          <StatLabel>Productos Vendidos</StatLabel>
        </StatCard>
      </Grid>

      <Grid>
        <SalesChart data={salesData} />
        <CategoryChart data={categoryData} />
      </Grid>
    </Container>
  );
}
