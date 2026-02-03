'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface TCOData {
    fuelCost: number;
    insuranceCost: number;
    maintenanceCost: number;
    repairCost: number;
    depreciation: number;
}

interface TCOBreakdownProps {
    data: TCOData;
    className?: string;
}

const COLORS = {
    fuel: '#f59e0b',      // amber-500
    insurance: '#3b82f6',  // blue-500
    maintenance: '#10b981', // emerald-500
    repairs: '#f97316',    // orange-500
    depreciation: '#ef4444', // red-500
};

export function TCOBreakdown({ data, className }: TCOBreakdownProps) {
    const chartData = [
        { name: 'Fuel', value: data.fuelCost, color: COLORS.fuel },
        { name: 'Insurance', value: data.insuranceCost, color: COLORS.insurance },
        { name: 'Maintenance', value: data.maintenanceCost, color: COLORS.maintenance },
        { name: 'Repairs', value: data.repairCost, color: COLORS.repairs },
        { name: 'Depreciation', value: data.depreciation, color: COLORS.depreciation },
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
                <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-lg font-bold">{formatCurrency(item.value)}</p>
                    <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Summary table */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                {chartData.map((item) => (
                    <div 
                        key={item.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TCOComparison({ 
    vehicles 
}: { 
    vehicles: Array<{ 
        name: string; 
        data: TCOData;
    }>;
}) {
    return (
        <div className="space-y-4">
            {vehicles.map((vehicle) => (
                <div key={vehicle.name} className="space-y-2">
                    <h4 className="font-medium">{vehicle.name}</h4>
                    <TCOBreakdown data={vehicle.data} />
                </div>
            ))}
        </div>
    );
}
