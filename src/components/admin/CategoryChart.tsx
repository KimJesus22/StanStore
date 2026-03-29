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

interface CategoryData {
    category: string;
    count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Pie geometry constants
const CX = 100;
const CY = 100;
const R = 80;

interface Slice {
    path: string;
    color: string;
    label: string;
    pct: string;
    lx: number;
    ly: number;
}

function buildSlices(data: CategoryData[]): Slice[] {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) return [];

    return data.reduce<{ slices: Slice[]; angle: number }>(
        ({ slices, angle }, item, i) => {
            const sweep = (item.count / total) * 2 * Math.PI;
            const endAngle = angle + sweep;

            const x1 = CX + R * Math.cos(angle);
            const y1 = CY + R * Math.sin(angle);
            const x2 = CX + R * Math.cos(endAngle);
            const y2 = CY + R * Math.sin(endAngle);
            const largeArc = sweep > Math.PI ? 1 : 0;

            const path = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
            const pct = ((item.count / total) * 100).toFixed(0);

            // Label position: midpoint of arc at 65% radius
            const mid = angle + sweep / 2;
            const lr = R * 0.65;
            const lx = CX + lr * Math.cos(mid);
            const ly = CY + lr * Math.sin(mid);

            return {
                slices: [...slices, { path, color: COLORS[i % COLORS.length], label: item.category, pct, lx, ly }],
                angle: endAngle,
            };
        },
        { slices: [], angle: -Math.PI / 2 },
    ).slices;
}

export default function CategoryChart({ data }: { data: CategoryData[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const legendColor = isDark ? '#B0B0B0' : '#616161';

    if (data.length === 0) {
        return (
            <ChartContainer>
                <Title>Ventas por Categoría</Title>
                <EmptyState>Sin datos de categorías disponibles.</EmptyState>
            </ChartContainer>
        );
    }

    const slices = buildSlices(data);

    return (
        <ChartContainer>
            <Title>Ventas por Categoría</Title>
            <svg
                viewBox="0 0 300 220"
                style={{ width: '100%', height: 220 }}
                aria-label="Gráfica de ventas por categoría"
            >
                {/* Pie slices */}
                {slices.map((slice, i) => (
                    <path key={i} d={slice.path} fill={slice.color}>
                        <title>{`${slice.label}: ${slice.pct}%`}</title>
                    </path>
                ))}

                {/* Percentage labels inside slices (only if slice >= 8%) */}
                {slices.map((slice, i) =>
                    parseInt(slice.pct) >= 8 ? (
                        <text
                            key={i}
                            x={slice.lx.toFixed(1)}
                            y={slice.ly.toFixed(1)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={10}
                            fill="white"
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                        >
                            {slice.pct}%
                        </text>
                    ) : null
                )}

                {/* Legend — right side of the pie */}
                {slices.map((slice, i) => (
                    <g key={i} transform={`translate(195, ${20 + i * 26})`}>
                        <rect width={12} height={12} fill={slice.color} rx={2} />
                        <text x={16} y={10} fontSize={10} fill={legendColor}>
                            {slice.label.length > 11 ? `${slice.label.slice(0, 11)}\u2026` : slice.label}
                        </text>
                    </g>
                ))}
            </svg>
        </ChartContainer>
    );
}
