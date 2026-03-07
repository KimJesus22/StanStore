'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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

interface SalesData {
    date: string;
    total: number;
}

const EmptyState = styled.div`
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

export default function SalesChart({ data }: { data: SalesData[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const gridColor = isDark ? '#333333' : '#e0e0e0';
    const axisColor = isDark ? '#B0B0B0' : '#616161';
    const tooltipStyle = isDark
        ? { backgroundColor: '#1E1E1E', border: '1px solid #333333', color: '#E0E0E0' }
        : { backgroundColor: '#fff', border: '1px solid #e0e0e0', color: '#1A1A1A' };

    return (
        <ChartContainer>
            <Title>Ventas por Día</Title>
            {data.length === 0 ? (
                <EmptyState>Sin datos de ventas disponibles.</EmptyState>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor }} />
                    <YAxis tick={{ fill: axisColor }} />
                    <Tooltip
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        contentStyle={tooltipStyle}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#10CFBD"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            )}
        </ChartContainer>
    );
}
