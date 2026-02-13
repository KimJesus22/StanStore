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

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

interface SalesData {
    date: string;
    total: number;
}

export default function SalesChart({ data }: { data: SalesData[] }) {
    return (
        <ChartContainer>
            <Title>Ventas por Día</Title>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                        labelFormatter={(label) => `Fecha: ${label}`}
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
        </ChartContainer>
    );
}
