'use client';

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

const EmptyState = styled.div`
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

interface SalesData {
    date: string;
    total: number;
}

const W = 400;
const H = 220;
const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
const CHART_W = W - PAD.left - PAD.right; // 325
const CHART_H = H - PAD.top - PAD.bottom; // 160

export default function SalesChart({ data }: { data: SalesData[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const gridColor = isDark ? '#333333' : '#e0e0e0';
    const axisColor = isDark ? '#B0B0B0' : '#616161';

    if (data.length === 0) {
        return (
            <ChartContainer>
                <Title>Ventas por Día</Title>
                <EmptyState>Sin datos de ventas disponibles.</EmptyState>
            </ChartContainer>
        );
    }

    const maxVal = Math.max(...data.map(d => d.total));
    const range = maxVal || 1;

    const xOf = (i: number) =>
        PAD.left + (data.length > 1 ? (i / (data.length - 1)) * CHART_W : CHART_W / 2);

    const yOf = (v: number) =>
        PAD.top + CHART_H - (v / range) * CHART_H;

    const points = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.total).toFixed(1)}`).join(' ');

    // 5 evenly-spaced Y-axis ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * range);

    // At most 6 X-axis labels
    const step = Math.max(1, Math.ceil(data.length / 6));
    const xLabelIdxs = data
        .map((_, i) => i)
        .filter(i => i % step === 0 || i === data.length - 1);

    return (
        <ChartContainer>
            <Title>Ventas por Día</Title>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: 220 }}
                aria-label="Gráfica de ventas por día"
            >
                {/* Horizontal grid lines */}
                {yTicks.map((tick, i) => (
                    <line
                        key={i}
                        x1={PAD.left} y1={yOf(tick).toFixed(1)}
                        x2={W - PAD.right} y2={yOf(tick).toFixed(1)}
                        stroke={gridColor} strokeDasharray="3 3" strokeWidth={0.8}
                    />
                ))}

                {/* Axes */}
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke={axisColor} strokeWidth={1} />
                <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke={axisColor} strokeWidth={1} />

                {/* Data line */}
                {data.length > 1 && (
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#10CFBD"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                )}

                {/* Data dots — native <title> tooltip on hover */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={xOf(i).toFixed(1)}
                        cy={yOf(d.total).toFixed(1)}
                        r={4}
                        fill="#10CFBD"
                    >
                        <title>{`${d.date}: $${d.total.toFixed(2)}`}</title>
                    </circle>
                ))}

                {/* Y-axis labels */}
                {yTicks.map((tick, i) => (
                    <text
                        key={i}
                        x={PAD.left - 6}
                        y={(yOf(tick) + 4).toFixed(1)}
                        textAnchor="end"
                        fontSize={9}
                        fill={axisColor}
                    >
                        ${tick.toFixed(0)}
                    </text>
                ))}

                {/* X-axis labels */}
                {xLabelIdxs.map(i => (
                    <text
                        key={i}
                        x={xOf(i).toFixed(1)}
                        y={H - 5}
                        textAnchor="middle"
                        fontSize={9}
                        fill={axisColor}
                    >
                        {data[i].date.length >= 7 ? data[i].date.slice(5) : data[i].date}
                    </text>
                ))}
            </svg>
        </ChartContainer>
    );
}
