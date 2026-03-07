'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import styled from 'styled-components';
import { useTheme } from '@/context/ThemeContext';

const ChartContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

interface CategoryData {
    category: string;
    count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const EmptyState = styled.div`
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

export default function CategoryChart({ data }: { data: CategoryData[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const legendColor = isDark ? '#B0B0B0' : '#616161';
    const tooltipStyle = isDark
        ? { backgroundColor: '#1E1E1E', border: '1px solid #333333', color: '#E0E0E0' }
        : { backgroundColor: '#fff', border: '1px solid #e0e0e0', color: '#1A1A1A' };

    return (
        <ChartContainer>
            <Title>Ventas por Categoría</Title>
            {data.length === 0 ? (
                <EmptyState>Sin datos de categorías disponibles.</EmptyState>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                        label={({ name, percent }: { name?: string | number; percent?: number }) => `${name ?? ''} ${(percent ? (percent * 100).toFixed(0) : '0')}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend formatter={(value) => <span style={{ color: legendColor }}>{value}</span>} />
                </PieChart>
            </ResponsiveContainer>
            )}
        </ChartContainer>
    );
}
