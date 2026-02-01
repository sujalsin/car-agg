'use client';

import { cn } from '@/lib/utils';
import { DollarSign, Fuel, Shield, Wrench, TrendingDown, Calculator } from 'lucide-react';

interface OwnershipCost {
    totalAnnualCost: number;
    fuelCost: number;
    insuranceCost: number;
    maintenanceCost: number;
    repairCost: number;
    depreciation: number;
    fiveYearCost: number;
}

interface CostCalculatorProps {
    costs: OwnershipCost | null;
    vehicleName: string;
    className?: string;
}

export function CostCalculator({ costs, vehicleName, className }: CostCalculatorProps) {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!costs) {
        return (
            <div className={cn('p-4 rounded-lg bg-muted/50 text-center', className)}>
                <p className="text-sm text-muted-foreground">
                    Cost data not available for this vehicle.
                </p>
            </div>
        );
    }

    const costItems = [
        { label: 'Fuel', value: costs.fuelCost, icon: Fuel, color: 'text-amber-500' },
        { label: 'Insurance', value: costs.insuranceCost, icon: Shield, color: 'text-blue-500' },
        { label: 'Maintenance', value: costs.maintenanceCost, icon: Wrench, color: 'text-green-500' },
        { label: 'Repairs', value: costs.repairCost, icon: Calculator, color: 'text-orange-500' },
        { label: 'Depreciation', value: costs.depreciation, icon: TrendingDown, color: 'text-red-500' },
    ];

    const maxCost = Math.max(...costItems.map(item => item.value));

    return (
        <div className={cn('space-y-6', className)}>
            {/* Total Annual Cost Header */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Estimated Annual Cost</p>
                <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(costs.totalAnnualCost)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(Math.round(costs.totalAnnualCost / 12))}/month
                </p>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
                {costItems.map((item, index) => {
                    const Icon = item.icon;
                    const percentage = (item.value / maxCost) * 100;

                    return (
                        <div
                            key={item.label}
                            className="animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn('w-4 h-4', item.color)} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                            </div>

                            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700 ease-out bg-current', item.color)}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 5-Year Projection */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">5-Year Total Cost</p>
                        <p className="text-xs text-muted-foreground">Projected ownership cost</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(costs.fiveYearCost)}</p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground text-center space-y-1 p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">⚠️ These are CARAG estimates, not official data</p>
                <p>
                    Based on 12,000 mi/year, industry averages, and vehicle-specific factors.
                    Fuel: EPA est. • Insurance: class-based avg. • Depreciation: standard curves.
                    Actual costs vary by location, driving habits, and individual circumstances.
                </p>
            </div>
        </div>
    );
}
