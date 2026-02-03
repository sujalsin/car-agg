'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface ComponentScore {
    category: string;
    score: number;
    complaintCount: number;
}

interface ReliabilityChartProps {
    components: ComponentScore[];
    className?: string;
}

export function ReliabilityChart({ components, className }: ReliabilityChartProps) {
    // Sort by score (lowest first) to show problem areas first
    const sortedData = [...components]
        .filter(c => c.category !== 'Other')
        .sort((a, b) => a.score - b.score);

    const getScoreColor = (score: number) => {
        if (score >= 8) return '#10b981'; // emerald-500
        if (score >= 6) return '#f59e0b'; // amber-500
        if (score >= 4) return '#f97316'; // orange-500
        return '#ef4444'; // red-500
    };

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ComponentScore }> }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.category}</p>
                    <p className="text-lg font-bold">{data.score.toFixed(1)}/10</p>
                    <p className="text-sm text-muted-foreground">{data.complaintCount} complaints</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={cn('h-80', className)}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis 
                        type="number" 
                        domain={[0, 10]} 
                        tickCount={6}
                    />
                    <YAxis 
                        type="category" 
                        dataKey="category"
                        width={95}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface ComparisonData {
    category: string;
    [key: string]: string | number;
}

export function ReliabilityComparison({ 
    vehicles 
}: { 
    vehicles: Array<{ 
        name: string; 
        components: ComponentScore[];
    }>;
}) {
    // Build comparison data
    const categories = [...new Set(vehicles[0]?.components.map(c => c.category) || [])];
    
    const data: ComparisonData[] = categories.map(category => {
        const row: ComparisonData = { category };
        vehicles.forEach((vehicle, index) => {
            const component = vehicle.components.find(c => c.category === category);
            row[`vehicle${index}`] = component?.score || 0;
        });
        return row;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b'];

    return (
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis 
                        type="category" 
                        dataKey="category"
                        width={95}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    {vehicles.map((vehicle, index) => (
                        <Bar 
                            key={vehicle.name}
                            dataKey={`vehicle${index}`}
                            name={vehicle.name}
                            fill={colors[index % colors.length]}
                            radius={[0, 4, 4, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
