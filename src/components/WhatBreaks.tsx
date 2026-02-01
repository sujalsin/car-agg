'use client';

import { cn } from '@/lib/utils';

interface ComponentData {
    category: string;
    percentage: number;
    topIssue: string;
}

interface WhatBreaksProps {
    data: ComponentData[];
    totalComplaints: number;
    className?: string;
}

export function WhatBreaks({ data, totalComplaints, className }: WhatBreaksProps) {
    if (data.length === 0) {
        return (
            <div className={cn('p-4 rounded-lg bg-muted/50 text-center', className)}>
                <p className="text-sm text-muted-foreground">
                    No significant issues reported for this vehicle.
                </p>
            </div>
        );
    }

    const getBarColor = (percentage: number): string => {
        if (percentage >= 40) return 'bg-red-500';
        if (percentage >= 25) return 'bg-orange-500';
        if (percentage >= 15) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const getCategoryIcon = (category: string): string => {
        const icons: Record<string, string> = {
            'Engine': '⚙️',
            'Transmission': '🔧',
            'Electrical': '⚡',
            'Brakes': '🛑',
            'Safety Systems': '🛡️',
            'Steering/Suspension': '🎯',
            'Interior': '💺',
            'Exterior': '🚗',
            'Visibility': '👁️',
            'Other': '📋',
        };
        return icons[category] || '📋';
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Component</span>
                <span>% of Complaints</span>
            </div>

            <div className="space-y-3">
                {data.map((item, index) => (
                    <div
                        key={item.category}
                        className="animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-base">{getCategoryIcon(item.category)}</span>
                                <span className="text-sm font-medium">{item.category}</span>
                            </div>
                            <span className="text-sm font-semibold">{item.percentage}%</span>
                        </div>

                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn('h-full rounded-full transition-all duration-700 ease-out', getBarColor(item.percentage))}
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>

                        {item.topIssue && (
                            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                                {item.topIssue.slice(0, 80)}...
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                    Based on {totalComplaints.toLocaleString()} owner complaints filed with NHTSA
                </p>
            </div>
        </div>
    );
}
